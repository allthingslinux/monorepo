import { and, eq, sql } from "drizzle-orm";
import type { NextRequest } from "next/server";

import { ensureMlSourcesSeeded } from "@/features/mailing-lists/lib/sync";
import { handleAPIError, requireAuth } from "@atl/api/utils";
import { db } from "@atl/db/client";
import {
  mlSource,
  mlThread,
  mlUserFollowSource,
  mlUserReadState,
} from "@atl/db/schema/mailing-lists";
import {
  enrichWideEventWithUser,
  withWideEvent,
} from "@atl/observability/wide-events";
import type { WideEvent } from "@atl/observability/wide-events";

/**
 * GET /api/app/mailing-lists/sources
 * Catalog of mailing list sources + whether the current user follows each.
 */
export const GET = withWideEvent(
  async (request: NextRequest, event: WideEvent) => {
    try {
      const { session, userId } = await requireAuth(request);
      enrichWideEventWithUser(event, {
        email: session.user.email,
        id: userId,
      });

      await ensureMlSourcesSeeded();
      const sources = await db
        .select()
        .from(mlSource)
        .orderBy(mlSource.displayName);

      const follows = await db
        .select({ sourceId: mlUserFollowSource.sourceId })
        .from(mlUserFollowSource)
        .where(eq(mlUserFollowSource.userId, userId));

      const unreadBySource = await db
        .select({
          sourceId: mlThread.sourceId,
          unreadCount: sql<number>`COUNT(*)`,
        })
        .from(mlThread)
        .leftJoin(
          mlUserReadState,
          and(
            eq(mlUserReadState.threadId, mlThread.id),
            eq(mlUserReadState.userId, userId)
          )
        )
        .where(
          sql`${mlThread.lastMessageAt} IS NOT NULL AND (${mlUserReadState.lastReadAt} IS NULL OR ${mlThread.lastMessageAt} > ${mlUserReadState.lastReadAt})`
        )
        .groupBy(mlThread.sourceId);

      const followSet = new Set(follows.map((f) => f.sourceId));
      const unreadMap = new Map(
        unreadBySource.map((r) => [r.sourceId, Number(r.unreadCount) || 0])
      );

      return Response.json(
        {
          data: sources.map((s) => ({
            ...s,
            following: followSet.has(s.id),
            unreadCount: unreadMap.get(s.id) ?? 0,
          })),
          ok: true,
        },
        { headers: { "Cache-Control": "private, no-store" } }
      );
    } catch (error) {
      return handleAPIError(error);
    }
  }
);
