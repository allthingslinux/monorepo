import {
  and,
  asc,
  desc,
  eq,
  ilike,
  inArray,
  isNotNull,
  or,
  sql,
} from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import type { NextRequest } from "next/server";

import { stripSubjectReplyPrefixesForDisplay } from "@/features/mailing-lists/lib/normalize";
import { handleAPIError, requireAuth } from "@atl/api/utils";
import { db } from "@atl/db/client";
import {
  mlMessage,
  mlSource,
  mlThread,
  mlUserReadState,
} from "@atl/db/schema/mailing-lists";
import {
  enrichWideEventWithUser,
  withWideEvent,
} from "@atl/observability/wide-events";
import type { WideEvent } from "@atl/observability/wide-events";
import { mailingListThreadsQuerySchema } from "@atl/schemas/mailing-lists";

function escapeIlikePattern(raw: string): string {
  return raw
    .replaceAll("\\", "\\\\")
    .replaceAll("%", "\\%")
    .replaceAll("_", "\\_");
}

/**
 * GET /api/app/mailing-lists/threads
 * Paginated thread list, optional filter by source id, sort, volume, search.
 */
export const GET = withWideEvent(
  async (request: NextRequest, event: WideEvent) => {
    try {
      const { session, userId } = await requireAuth(request);
      enrichWideEventWithUser(event, {
        email: session.user.email,
        id: userId,
      });

      const raw = Object.fromEntries(request.nextUrl.searchParams.entries());
      const query = mailingListThreadsQuerySchema.parse(raw);

      const base = db
        .select({
          lastMessageAt: mlThread.lastMessageAt,
          lastReadAt: mlUserReadState.lastReadAt,
          messageCount: mlThread.messageCount,
          source: {
            displayName: mlSource.displayName,
            id: mlSource.id,
            listLabel: mlSource.listLabel,
            slug: mlSource.slug,
            sourceLabel: mlSource.sourceLabel,
            volumeClass: mlSource.volumeClass,
          },
          subject: mlThread.subject,
          threadId: mlThread.id,
        })
        .from(mlThread)
        .innerJoin(mlSource, eq(mlThread.sourceId, mlSource.id))
        .leftJoin(
          mlUserReadState,
          and(
            eq(mlUserReadState.threadId, mlThread.id),
            eq(mlUserReadState.userId, userId)
          )
        );

      const whereParts: SQL[] = [];

      if (query.sourceId) {
        whereParts.push(eq(mlThread.sourceId, query.sourceId));
      }
      if (query.volumeClass) {
        whereParts.push(eq(mlSource.volumeClass, query.volumeClass));
      }

      if (query.q) {
        const pattern = `%${escapeIlikePattern(query.q)}%`;
        const bodyRows = await db
          .selectDistinct({ threadId: mlMessage.threadId })
          .from(mlMessage)
          .where(
            and(
              isNotNull(mlMessage.bodyText),
              ilike(mlMessage.bodyText, pattern)
            )
          );
        const bodyThreadIds = bodyRows.map((r) => r.threadId);
        const bodyMatch =
          bodyThreadIds.length > 0
            ? inArray(mlThread.id, bodyThreadIds)
            : sql`false`;
        whereParts.push(or(ilike(mlThread.subject, pattern), bodyMatch)!);
      }

      let orderColumn: SQL;
      if (query.sort === "messageCount") {
        orderColumn =
          query.order === "asc"
            ? asc(mlThread.messageCount)
            : desc(mlThread.messageCount);
      } else if (query.sort === "subject") {
        orderColumn =
          query.order === "asc"
            ? asc(mlThread.subject)
            : desc(mlThread.subject);
      } else {
        orderColumn =
          query.order === "asc"
            ? asc(mlThread.lastMessageAt)
            : desc(mlThread.lastMessageAt);
      }

      const filtered =
        whereParts.length > 0 ? base.where(and(...whereParts)) : base;

      const threads = await filtered
        .orderBy(orderColumn)
        .limit(query.limit)
        .offset(query.offset);

      const threadsWithDisplaySubject = threads.map((t) => {
        const display = stripSubjectReplyPrefixesForDisplay(t.subject);
        const lastAt = t.lastMessageAt ? new Date(t.lastMessageAt) : null;
        const readAt = t.lastReadAt ? new Date(t.lastReadAt) : null;
        const unread = Boolean(
          lastAt && (!readAt || lastAt.getTime() > readAt.getTime())
        );
        const { lastReadAt: _lr, ...rest } = t;
        return {
          ...rest,
          subject: display.trim() || "(No subject)",
          unread,
        };
      });

      return Response.json(
        { data: { threads: threadsWithDisplaySubject }, ok: true },
        { headers: { "Cache-Control": "private, no-store" } }
      );
    } catch (error) {
      return handleAPIError(error);
    }
  }
);
