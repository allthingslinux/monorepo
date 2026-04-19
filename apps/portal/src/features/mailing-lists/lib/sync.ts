import { createHash } from "node:crypto";

import { and, asc, desc, eq, or } from "drizzle-orm";

import { MAILING_LIST_SEED_SOURCES } from "@atl/config/mailing-lists";
import { db } from "@atl/db/client";
import {
  mlBookmark,
  mlMessage,
  mlSource,
  mlThread,
  mlUserFollowSource,
  mlUserFollowThread,
  mlUserReadState,
} from "@atl/db/schema/mailing-lists";
import { log } from "@atl/observability/utils";

import { fetchHtmlArchiveItems } from "./adapters/html-archives";
import {
  fetchRssAtomPage,
  supportsPublicInboxTimeCursor,
  toPublicInboxTimeCursor,
} from "./adapters/rss-atom";
import {
  isReplyLikeSubject,
  normalizeLooseThreadSubjectKey,
  normalizeRfcMessageId,
  normalizeThreadSubjectKey,
} from "./normalize";
import type { NormalizedFeedItem } from "./types";

function newId(): string {
  return crypto.randomUUID();
}

function dedupeHash(sourceId: string, link: string): string {
  return createHash("sha256").update(`${sourceId}\n${link}`).digest("hex");
}

function extractMessageIdLike(raw: string | null | undefined): string | null {
  if (!raw) {
    return null;
  }
  const trimmed = raw.trim().replaceAll(/^<|>$/g, "");
  if (!trimmed || !trimmed.includes("@") || /\s/.test(trimmed)) {
    return null;
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return null;
  }
  return trimmed;
}

function extractMessageIdFromUrl(
  raw: string | null | undefined
): string | null {
  if (!raw) {
    return null;
  }
  try {
    const u = new URL(raw);
    const segs = u.pathname.split("/").filter((s) => s.length > 0);
    const last = segs.length > 0 ? decodeURIComponent(segs.at(-1) ?? "") : "";
    return extractMessageIdLike(last);
  } catch {
    return null;
  }
}

function normalizeComparableUrl(raw: string): string {
  return raw.replace(/\/+$/, "");
}

function deriveRfcMessageId(item: NormalizedFeedItem): string | null {
  const fromGuid = extractMessageIdLike(item.guid);
  if (fromGuid) {
    return fromGuid;
  }
  const fromLink = extractMessageIdFromUrl(item.link);
  if (fromLink) {
    return fromLink;
  }
  return null;
}

function normalizeInReplyForStorage(
  raw: string | null | undefined
): string | null {
  const fromRaw = extractMessageIdLike(raw);
  if (fromRaw) {
    return fromRaw;
  }
  const fromUrl = extractMessageIdFromUrl(raw);
  if (fromUrl) {
    return fromUrl;
  }
  return normalizeRfcMessageId(raw);
}

function buildMlDuplicatePatch(
  dup: {
    authorEmail: string | null;
    authorName: string | null;
    bodyText: string | null;
    inReplyTo: string | null;
    rfcMessageId: string | null;
  },
  item: NormalizedFeedItem
): {
  authorEmail?: string | null;
  authorName?: string | null;
  bodyText?: string | null;
  inReplyTo?: string | null;
  rfcMessageId?: string | null;
} {
  const patch: {
    authorEmail?: string | null;
    authorName?: string | null;
    bodyText?: string | null;
    inReplyTo?: string | null;
    rfcMessageId?: string | null;
  } = {};
  if (!dup.authorName?.trim() && item.authorName?.trim()) {
    patch.authorName = item.authorName;
  }
  if (!dup.authorEmail?.trim() && item.authorEmail?.trim()) {
    patch.authorEmail = item.authorEmail;
  }
  if (!dup.inReplyTo?.trim() && item.inReplyTo) {
    const normalized = normalizeInReplyForStorage(item.inReplyTo);
    if (normalized) {
      patch.inReplyTo = normalized;
    }
  }
  if (!dup.rfcMessageId?.trim()) {
    const normalized = deriveRfcMessageId(item);
    if (normalized) {
      patch.rfcMessageId = normalized;
    }
  }
  if (
    item.bodyText.trim().length > 0 &&
    item.bodyText !== (dup.bodyText ?? "")
  ) {
    patch.bodyText = item.bodyText;
  }
  return patch;
}

async function resolveThreadForFeedItem(
  sourceId: string,
  item: NormalizedFeedItem,
  threadSubjectKey: string
) {
  const inReplyMid =
    extractMessageIdLike(item.inReplyTo) ??
    extractMessageIdFromUrl(item.inReplyTo);
  if (inReplyMid) {
    const [parent] = await db
      .select()
      .from(mlMessage)
      .where(
        and(
          eq(mlMessage.sourceId, sourceId),
          or(
            eq(mlMessage.rfcMessageId, inReplyMid),
            eq(mlMessage.rfcMessageId, `<${inReplyMid}>`)
          )
        )
      )
      .limit(1);
    if (parent) {
      const [t] = await db
        .select()
        .from(mlThread)
        .where(eq(mlThread.id, parent.threadId))
        .limit(1);
      if (t) {
        return t;
      }
    }
  }

  const inReplyUrl =
    typeof item.inReplyTo === "string" && /^https?:\/\//i.test(item.inReplyTo)
      ? item.inReplyTo.trim()
      : null;
  if (inReplyUrl) {
    const comparableUrl = normalizeComparableUrl(inReplyUrl);
    const [parentByUrl] = await db
      .select()
      .from(mlMessage)
      .where(
        and(
          eq(mlMessage.sourceId, sourceId),
          or(
            eq(mlMessage.externalUrl, inReplyUrl),
            eq(mlMessage.externalUrl, comparableUrl),
            eq(mlMessage.externalUrl, `${comparableUrl}/`)
          )
        )
      )
      .limit(1);
    if (parentByUrl) {
      const [t] = await db
        .select()
        .from(mlThread)
        .where(eq(mlThread.id, parentByUrl.threadId))
        .limit(1);
      if (t) {
        return t;
      }
    }
  }

  const [byKey] = await db
    .select()
    .from(mlThread)
    .where(
      and(
        eq(mlThread.sourceId, sourceId),
        eq(mlThread.subjectKey, threadSubjectKey)
      )
    )
    .limit(1);
  if (byKey) {
    return byKey;
  }

  if (isReplyLikeSubject(item.title)) {
    const looseIncomingKey = normalizeLooseThreadSubjectKey(item.title);
    if (looseIncomingKey) {
      const recent = await db
        .select()
        .from(mlThread)
        .where(eq(mlThread.sourceId, sourceId))
        .orderBy(desc(mlThread.lastMessageAt))
        .limit(200);
      const matched = recent.find((t) => {
        const looseCandidate = normalizeLooseThreadSubjectKey(t.subject);
        return looseCandidate.length > 0 && looseCandidate === looseIncomingKey;
      });
      if (matched) {
        return matched;
      }
    }
  }

  return null;
}

function pollIntervalForVolume(volume: string): number {
  if (volume === "high") {
    return 1800;
  }
  if (volume === "low") {
    return 7200;
  }
  return 3600;
}

/**
 * Clear current user's mailing-list personalization state only.
 * Shared synced messages/threads remain available to all users.
 */
export async function clearMlUserState(userId: string): Promise<{
  deletedBookmarks: number;
  deletedFollowedSources: number;
  deletedFollowedThreads: number;
  deletedReadStates: number;
  totalDeleted: number;
}> {
  const deletedBookmarks = await db
    .delete(mlBookmark)
    .where(eq(mlBookmark.userId, userId))
    .returning({ id: mlBookmark.id });
  const deletedFollowedSources = await db
    .delete(mlUserFollowSource)
    .where(eq(mlUserFollowSource.userId, userId))
    .returning({ id: mlUserFollowSource.id });
  const deletedFollowedThreads = await db
    .delete(mlUserFollowThread)
    .where(eq(mlUserFollowThread.userId, userId))
    .returning({ id: mlUserFollowThread.id });
  const deletedReadStates = await db
    .delete(mlUserReadState)
    .where(eq(mlUserReadState.userId, userId))
    .returning({ id: mlUserReadState.id });
  const totalDeleted =
    deletedBookmarks.length +
    deletedFollowedSources.length +
    deletedFollowedThreads.length +
    deletedReadStates.length;

  return {
    deletedBookmarks: deletedBookmarks.length,
    deletedFollowedSources: deletedFollowedSources.length,
    deletedFollowedThreads: deletedFollowedThreads.length,
    deletedReadStates: deletedReadStates.length,
    totalDeleted,
  };
}

/**
 * Upsert catalog rows from `@atl/config/mailing-lists` seed list.
 */
export async function ensureMlSourcesSeeded(): Promise<void> {
  for (const seed of MAILING_LIST_SEED_SOURCES) {
    await db
      .insert(mlSource)
      .values({
        adapterType: seed.adapterType,
        archiveUrl: seed.archiveUrl,
        displayName: seed.displayName,
        feedUrl: seed.feedUrl,
        id: seed.id,
        listLabel: seed.listLabel ?? null,
        name: seed.name,
        pollIntervalSeconds: pollIntervalForVolume(seed.volumeClass),
        rateLimitClass: seed.volumeClass === "high" ? "slow" : "normal",
        slug: seed.id,
        sourceLabel: seed.sourceLabel ?? null,
        supportsPatchMeta: seed.supportsPatchMeta,
        supportsThreading: true,
        visibility: "public",
        volumeClass: seed.volumeClass,
      })
      .onConflictDoUpdate({
        set: {
          adapterType: seed.adapterType,
          archiveUrl: seed.archiveUrl,
          displayName: seed.displayName,
          feedUrl: seed.feedUrl,
          listLabel: seed.listLabel ?? null,
          name: seed.name,
          sourceLabel: seed.sourceLabel ?? null,
          supportsPatchMeta: seed.supportsPatchMeta,
          updatedAt: new Date(),
          volumeClass: seed.volumeClass,
        },
        target: mlSource.slug,
      });
  }
}

export interface SyncResult {
  cursorMode?: "latest" | "older" | "smart";
  error?: string;
  insertedMessages: number;
  skippedDuplicates: number;
  sourceId: string;
  status: "ok" | "error";
}

type SyncCursorMode = "latest" | "older" | "smart";
const INITIAL_SMART_BACKFILL_PASSES = 3;
const REGULAR_SMART_BACKFILL_PASSES = 1;

function resolveOlderSyncCursor(raw: string | null): string | null {
  const cursor = toPublicInboxTimeCursor(raw);
  if (cursor) {
    return cursor;
  }
  return null;
}

function isRfcMessageIdUniqueViolation(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  const message = error.message.toLowerCase();
  return (
    message.includes("duplicate key value violates unique constraint") &&
    (message.includes("rfc_message_id") ||
      message.includes("ml_message_rfc_message_id"))
  );
}

/**
 * Pull new items from a source's feed and persist threads/messages.
 */
// eslint-disable-next-line complexity -- adapters, dedupe, threading, and DB in one orchestrator
export async function syncMlSource(
  sourceSlug: string,
  options?: { bypassNextDataCache?: boolean; cursorMode?: SyncCursorMode }
): Promise<SyncResult> {
  const cursorMode = options?.cursorMode ?? "smart";
  const [source] = await db
    .select()
    .from(mlSource)
    .where(eq(mlSource.slug, sourceSlug))
    .limit(1);

  if (!source) {
    return {
      cursorMode,
      error: "Source not found",
      insertedMessages: 0,
      skippedDuplicates: 0,
      sourceId: sourceSlug,
      status: "error",
    };
  }

  if (!source.feedUrl) {
    await db
      .update(mlSource)
      .set({
        lastSyncError: "Adapter not implemented or missing feed URL",
        lastSyncStatus: "error",
        lastSyncedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(mlSource.id, source.id));

    return {
      cursorMode,
      error: "Unsupported adapter or missing feedUrl",
      insertedMessages: 0,
      skippedDuplicates: 0,
      sourceId: source.id,
      status: "error",
    };
  }

  if (cursorMode === "smart") {
    const latest = await syncMlSource(sourceSlug, {
      bypassNextDataCache: options?.bypassNextDataCache,
      cursorMode: "latest",
    });
    if (latest.status === "error") {
      return { ...latest, cursorMode: "smart" };
    }
    if (!supportsPublicInboxTimeCursor(source.feedUrl)) {
      return { ...latest, cursorMode: "smart" };
    }
    const [existingMessage] = await db
      .select({ id: mlMessage.id })
      .from(mlMessage)
      .where(eq(mlMessage.sourceId, source.id))
      .limit(1);
    const olderPasses = existingMessage
      ? REGULAR_SMART_BACKFILL_PASSES
      : INITIAL_SMART_BACKFILL_PASSES;

    let insertedMessages = latest.insertedMessages;
    let skippedDuplicates = latest.skippedDuplicates;

    for (let i = 0; i < olderPasses; i += 1) {
      const older = await syncMlSource(sourceSlug, {
        bypassNextDataCache: options?.bypassNextDataCache,
        cursorMode: "older",
      });
      if (older.status === "error") {
        return {
          cursorMode: "smart",
          error: older.error,
          insertedMessages: insertedMessages + older.insertedMessages,
          skippedDuplicates: skippedDuplicates + older.skippedDuplicates,
          sourceId: latest.sourceId,
          status: "error",
        };
      }
      insertedMessages += older.insertedMessages;
      skippedDuplicates += older.skippedDuplicates;
      if (older.insertedMessages === 0 && older.skippedDuplicates === 0) {
        break;
      }
    }

    return {
      cursorMode: "smart",
      insertedMessages,
      skippedDuplicates,
      sourceId: latest.sourceId,
      status: "ok",
    };
  }

  try {
    if (source.adapterType === "html_archive") {
      const items = await fetchHtmlArchiveItems(source.feedUrl, {
        bypassNextDataCache: options?.bypassNextDataCache,
      });
      let inserted = 0;
      let skipped = 0;
      for (const item of items) {
        const [dup] = await db
          .select()
          .from(mlMessage)
          .where(
            and(
              eq(mlMessage.sourceId, source.id),
              eq(mlMessage.externalUrl, item.link)
            )
          )
          .limit(1);
        if (dup) {
          const patch = buildMlDuplicatePatch(dup, item);
          if (Object.keys(patch).length > 0) {
            await db
              .update(mlMessage)
              .set(patch)
              .where(eq(mlMessage.id, dup.id));
          }
          skipped += 1;
          continue;
        }

        const rfcMessageId = deriveRfcMessageId(item);
        if (rfcMessageId) {
          const [dupByRfc] = await db
            .select({ id: mlMessage.id })
            .from(mlMessage)
            .where(
              or(
                eq(mlMessage.rfcMessageId, rfcMessageId),
                eq(mlMessage.rfcMessageId, `<${rfcMessageId}>`)
              )
            )
            .limit(1);
          if (dupByRfc) {
            skipped += 1;
            continue;
          }
        }

        const threadSubjectKey = normalizeThreadSubjectKey(item.title);
        let thread = await resolveThreadForFeedItem(
          source.id,
          item,
          threadSubjectKey
        );
        if (!thread) {
          const threadId = newId();
          await db.insert(mlThread).values({
            id: threadId,
            lastMessageAt: item.publishedAt ?? new Date(),
            messageCount: 0,
            rootMessageId: item.guid,
            sourceId: source.id,
            subject: item.title,
            subjectKey: threadSubjectKey,
          });
          const [insertedThread] = await db
            .select()
            .from(mlThread)
            .where(eq(mlThread.id, threadId))
            .limit(1);
          thread = insertedThread;
        }

        if (!thread) {
          throw new Error("Failed to create thread");
        }

        const messageId = newId();
        const sentAt = item.publishedAt ?? new Date();
        const inReplyToStored = normalizeInReplyForStorage(item.inReplyTo);
        try {
          await db.insert(mlMessage).values({
            authorEmail: item.authorEmail,
            authorName: item.authorName,
            bodyText: item.bodyText || undefined,
            dedupeHash: dedupeHash(source.id, item.link),
            externalUrl: item.link,
            id: messageId,
            inReplyTo: inReplyToStored,
            referencesHeader: null,
            rfcMessageId,
            sentAt,
            sourceId: source.id,
            subject: item.title,
            threadId: thread.id,
          });
        } catch (error) {
          if (isRfcMessageIdUniqueViolation(error)) {
            skipped += 1;
            continue;
          }
          throw error;
        }

        const nextCount = thread.messageCount + 1;
        const lastAt =
          thread.lastMessageAt && sentAt < thread.lastMessageAt
            ? thread.lastMessageAt
            : sentAt;
        await db
          .update(mlThread)
          .set({
            lastMessageAt: lastAt,
            messageCount: nextCount,
            updatedAt: new Date(),
          })
          .where(eq(mlThread.id, thread.id));
        inserted += 1;
      }

      await db
        .update(mlSource)
        .set({
          lastSyncError: null,
          lastSyncStatus: "ok",
          lastSyncedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(mlSource.id, source.id));

      return {
        cursorMode,
        insertedMessages: inserted,
        skippedDuplicates: skipped,
        sourceId: source.id,
        status: "ok",
      };
    }

    if (source.adapterType !== "rss_atom") {
      return {
        cursorMode,
        error: "Unsupported adapter or missing feedUrl",
        insertedMessages: 0,
        skippedDuplicates: 0,
        sourceId: source.id,
        status: "error",
      };
    }

    const sourceSupportsOlder = supportsPublicInboxTimeCursor(source.feedUrl);
    if (cursorMode === "older" && !sourceSupportsOlder) {
      return {
        cursorMode,
        insertedMessages: 0,
        skippedDuplicates: 0,
        sourceId: source.id,
        status: "ok",
      };
    }

    let beforeTimeCursor: string | null = null;
    if (cursorMode === "older" && sourceSupportsOlder) {
      beforeTimeCursor = resolveOlderSyncCursor(source.lastCursor);
      if (!beforeTimeCursor) {
        const [oldest] = await db
          .select({ sentAt: mlMessage.sentAt })
          .from(mlMessage)
          .where(eq(mlMessage.sourceId, source.id))
          .orderBy(asc(mlMessage.sentAt))
          .limit(1);
        beforeTimeCursor = toPublicInboxTimeCursor(oldest?.sentAt ?? null);
      }
    }

    const page = await fetchRssAtomPage(source.feedUrl, {
      beforeTimeCursor,
      bypassNextDataCache: options?.bypassNextDataCache,
    });
    const items = page.items;
    let inserted = 0;
    let skipped = 0;

    for (const item of items) {
      const [dup] = await db
        .select()
        .from(mlMessage)
        .where(
          and(
            eq(mlMessage.sourceId, source.id),
            eq(mlMessage.externalUrl, item.link)
          )
        )
        .limit(1);
      if (dup) {
        const patch = buildMlDuplicatePatch(dup, item);
        if (Object.keys(patch).length > 0) {
          await db.update(mlMessage).set(patch).where(eq(mlMessage.id, dup.id));
        }
        skipped += 1;
        continue;
      }

      const rfcMessageId = deriveRfcMessageId(item);
      if (rfcMessageId) {
        const [dupByRfc] = await db
          .select({ id: mlMessage.id })
          .from(mlMessage)
          .where(
            or(
              eq(mlMessage.rfcMessageId, rfcMessageId),
              eq(mlMessage.rfcMessageId, `<${rfcMessageId}>`)
            )
          )
          .limit(1);
        if (dupByRfc) {
          skipped += 1;
          continue;
        }
      }

      const threadSubjectKey = normalizeThreadSubjectKey(item.title);
      let thread = await resolveThreadForFeedItem(
        source.id,
        item,
        threadSubjectKey
      );

      if (!thread) {
        const threadId = newId();
        await db.insert(mlThread).values({
          id: threadId,
          lastMessageAt: item.publishedAt ?? new Date(),
          messageCount: 0,
          rootMessageId: item.guid,
          sourceId: source.id,
          subject: item.title,
          subjectKey: threadSubjectKey,
        });
        const [insertedThread] = await db
          .select()
          .from(mlThread)
          .where(eq(mlThread.id, threadId))
          .limit(1);
        thread = insertedThread;
      }

      if (!thread) {
        throw new Error("Failed to create thread");
      }

      const messageId = newId();
      const sentAt = item.publishedAt ?? new Date();
      const inReplyToStored = normalizeInReplyForStorage(item.inReplyTo);

      try {
        await db.insert(mlMessage).values({
          authorEmail: item.authorEmail,
          authorName: item.authorName,
          bodyText: item.bodyText || undefined,
          dedupeHash: dedupeHash(source.id, item.link),
          externalUrl: item.link,
          id: messageId,
          inReplyTo: inReplyToStored,
          referencesHeader: null,
          rfcMessageId,
          sentAt,
          sourceId: source.id,
          subject: item.title,
          threadId: thread.id,
        });
      } catch (error) {
        if (isRfcMessageIdUniqueViolation(error)) {
          skipped += 1;
          continue;
        }
        throw error;
      }

      const nextCount = thread.messageCount + 1;
      const lastAt =
        thread.lastMessageAt && sentAt < thread.lastMessageAt
          ? thread.lastMessageAt
          : sentAt;

      await db
        .update(mlThread)
        .set({
          lastMessageAt: lastAt,
          messageCount: nextCount,
          updatedAt: new Date(),
        })
        .where(eq(mlThread.id, thread.id));

      inserted += 1;
    }

    let lastCursor = source.lastCursor;
    if (
      page.supportsTimeCursor &&
      page.nextTimeCursor &&
      (cursorMode === "older" || !source.lastCursor)
    ) {
      lastCursor = page.nextTimeCursor;
    }

    await db
      .update(mlSource)
      .set({
        lastCursor,
        lastSyncError: null,
        lastSyncStatus: "ok",
        lastSyncedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(mlSource.id, source.id));

    return {
      cursorMode,
      insertedMessages: inserted,
      skippedDuplicates: skipped,
      sourceId: source.id,
      status: "ok",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log.warn("Mailing list sync failed", {
      error: message,
      sourceId: source.id,
      sourceSlug: sourceSlug,
    });
    await db
      .update(mlSource)
      .set({
        lastSyncError: message,
        lastSyncStatus: "error",
        lastSyncedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(mlSource.id, source.id));

    return {
      cursorMode,
      error: message,
      insertedMessages: 0,
      skippedDuplicates: 0,
      sourceId: source.id,
      status: "error",
    };
  }
}

/**
 * Seed sources (if needed) and sync every catalog entry. Best-effort per source.
 */
export async function syncAllMlSources(options?: {
  bypassNextDataCache?: boolean;
  cursorMode?: SyncCursorMode;
}): Promise<SyncResult[]> {
  await ensureMlSourcesSeeded();
  const results: SyncResult[] = [];
  for (const seed of MAILING_LIST_SEED_SOURCES) {
    results.push(
      await syncMlSource(seed.id, {
        ...options,
        cursorMode: options?.cursorMode ?? "smart",
      })
    );
  }
  return results;
}
