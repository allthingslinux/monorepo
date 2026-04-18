import { createHash } from "node:crypto";

import { and, eq, isNotNull, or } from "drizzle-orm";

import { MAILING_LIST_SEED_SOURCES } from "@atl/config/mailing-lists";
import { db } from "@atl/db/client";
import { mlMessage, mlSource, mlThread } from "@atl/db/schema/mailing-lists";
import { log } from "@atl/observability/utils";

import { fetchRssAtomItems } from "./adapters/rss-atom";
import { normalizeRfcMessageId, normalizeThreadSubjectKey } from "./normalize";
import type { NormalizedFeedItem } from "./types";

function newId(): string {
  return crypto.randomUUID();
}

function dedupeHash(sourceId: string, link: string): string {
  return createHash("sha256").update(`${sourceId}\n${link}`).digest("hex");
}

function buildMlDuplicatePatch(
  dup: {
    authorEmail: string | null;
    authorName: string | null;
    inReplyTo: string | null;
  },
  item: NormalizedFeedItem
): {
  authorEmail?: string | null;
  authorName?: string | null;
  inReplyTo?: string | null;
} {
  const patch: {
    authorEmail?: string | null;
    authorName?: string | null;
    inReplyTo?: string | null;
  } = {};
  if (!dup.authorName?.trim() && item.authorName?.trim()) {
    patch.authorName = item.authorName;
  }
  if (!dup.authorEmail?.trim() && item.authorEmail?.trim()) {
    patch.authorEmail = item.authorEmail;
  }
  if (!dup.inReplyTo?.trim() && item.inReplyTo) {
    const normalized = normalizeRfcMessageId(item.inReplyTo);
    if (normalized) {
      patch.inReplyTo = normalized;
    }
  }
  return patch;
}

async function resolveThreadForFeedItem(
  sourceId: string,
  item: NormalizedFeedItem,
  threadSubjectKey: string
) {
  const inReplyMid = normalizeRfcMessageId(item.inReplyTo);
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
  return byKey;
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
 * Remove all ingested mailing-list rows (threads, messages, follows, bookmarks).
 * Catalog sources are re-seeded from config on the next sync.
 */
export async function clearAllMlIngestedData(): Promise<{
  deletedSources: number;
}> {
  const deleted = await db
    .delete(mlSource)
    .where(isNotNull(mlSource.id))
    .returning({ id: mlSource.id });
  return { deletedSources: deleted.length };
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
  error?: string;
  insertedMessages: number;
  skippedDuplicates: number;
  sourceId: string;
  status: "ok" | "error";
}

/**
 * Pull new items from a source's feed and persist threads/messages.
 */
export async function syncMlSource(
  sourceSlug: string,
  options?: { bypassNextDataCache?: boolean }
): Promise<SyncResult> {
  const [source] = await db
    .select()
    .from(mlSource)
    .where(eq(mlSource.slug, sourceSlug))
    .limit(1);

  if (!source) {
    return {
      error: "Source not found",
      insertedMessages: 0,
      skippedDuplicates: 0,
      sourceId: sourceSlug,
      status: "error",
    };
  }

  if (source.adapterType !== "rss_atom" || !source.feedUrl) {
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
      error: "Unsupported adapter or missing feedUrl",
      insertedMessages: 0,
      skippedDuplicates: 0,
      sourceId: source.id,
      status: "error",
    };
  }

  try {
    const items = await fetchRssAtomItems(source.feedUrl, options);
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
      const rfcMessageId =
        item.guid?.includes("@") === true
          ? normalizeRfcMessageId(item.guid)
          : null;
      const inReplyToStored = normalizeRfcMessageId(item.inReplyTo);

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
        lastCursor: new Date().toISOString(),
        lastSyncError: null,
        lastSyncStatus: "ok",
        lastSyncedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(mlSource.id, source.id));

    return {
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
}): Promise<SyncResult[]> {
  await ensureMlSourcesSeeded();
  const results: SyncResult[] = [];
  for (const seed of MAILING_LIST_SEED_SOURCES) {
    results.push(await syncMlSource(seed.id, options));
  }
  return results;
}
