import { and, asc, eq, inArray } from "drizzle-orm";
import type { NextRequest } from "next/server";

import { stripSubjectReplyPrefixesForDisplay } from "@/features/mailing-lists/lib/normalize";
import { handleAPIError, parseRouteId, requireAuth } from "@atl/api/utils";
import { db } from "@atl/db/client";
import {
  mlMessage,
  mlPatchMeta,
  mlSource,
  mlThread,
  mlUserReadState,
} from "@atl/db/schema/mailing-lists";
import { mailingListThreadDetailQuerySchema } from "@atl/schemas/mailing-lists";

/**
 * GET /api/app/mailing-lists/threads/[threadId]
 * Thread detail with messages (ascending by time).
 * Optional `include=threading,bodyHtml` for extra message columns.
 */
export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ threadId: string }> }
) {
  try {
    const { userId } = await requireAuth(request);

    const params = await ctx.params;
    const threadId = parseRouteId(params.threadId);

    const raw = Object.fromEntries(request.nextUrl.searchParams.entries());
    const detailQuery = mailingListThreadDetailQuerySchema.parse(raw);
    const include = new Set(detailQuery.include);

    const [threadRow] = await db
      .select({
        source: {
          archiveUrl: mlSource.archiveUrl,
          displayName: mlSource.displayName,
          id: mlSource.id,
          listLabel: mlSource.listLabel,
          slug: mlSource.slug,
          sourceLabel: mlSource.sourceLabel,
        },
        thread: mlThread,
      })
      .from(mlThread)
      .innerJoin(mlSource, eq(mlThread.sourceId, mlSource.id))
      .where(eq(mlThread.id, threadId))
      .limit(1);

    if (!threadRow) {
      return Response.json(
        { error: "Thread not found", ok: false },
        { status: 404 }
      );
    }

    const messageSelect = {
      authorEmail: mlMessage.authorEmail,
      authorName: mlMessage.authorName,
      bodyText: mlMessage.bodyText,
      externalUrl: mlMessage.externalUrl,
      id: mlMessage.id,
      sentAt: mlMessage.sentAt,
      subject: mlMessage.subject,
      ...(include.has("threading")
        ? {
            inReplyTo: mlMessage.inReplyTo,
            referencesHeader: mlMessage.referencesHeader,
            rfcMessageId: mlMessage.rfcMessageId,
          }
        : {}),
      ...(include.has("bodyHtml") ? { bodyHtml: mlMessage.bodyHtml } : {}),
    };

    const messages = await db
      .select(messageSelect)
      .from(mlMessage)
      .where(eq(mlMessage.threadId, threadId))
      .orderBy(asc(mlMessage.sentAt));

    const ids = messages.map((m) => m.id);
    const patches =
      ids.length > 0
        ? await db
            .select()
            .from(mlPatchMeta)
            .where(inArray(mlPatchMeta.messageId, ids))
        : [];

    const patchByMessageId = new Map(patches.map((p) => [p.messageId, p]));

    const [readRow] = await db
      .select({
        lastReadAt: mlUserReadState.lastReadAt,
        lastReadMessageId: mlUserReadState.lastReadMessageId,
      })
      .from(mlUserReadState)
      .where(
        and(
          eq(mlUserReadState.threadId, threadId),
          eq(mlUserReadState.userId, userId)
        )
      )
      .limit(1);

    return Response.json(
      {
        data: {
          messages: messages.map((m) => ({
            ...m,
            patch: patchByMessageId.get(m.id) ?? null,
            subject: stripSubjectReplyPrefixesForDisplay(m.subject),
          })),
          read: readRow
            ? {
                lastReadAt: readRow.lastReadAt?.toISOString() ?? null,
                lastReadMessageId: readRow.lastReadMessageId,
              }
            : null,
          source: threadRow.source,
          thread: {
            ...threadRow.thread,
            subject: stripSubjectReplyPrefixesForDisplay(
              threadRow.thread.subject
            ),
          },
        },
        ok: true,
      },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error) {
    return handleAPIError(error);
  }
}
