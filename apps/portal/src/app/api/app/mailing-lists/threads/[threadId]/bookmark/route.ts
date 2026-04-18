import { and, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";

import { handleAPIError, parseRouteId, requireAuth } from "@atl/api/utils";
import { db } from "@atl/db/client";
import { mlBookmark, mlThread } from "@atl/db/schema/mailing-lists";

/**
 * PUT /api/app/mailing-lists/threads/[threadId]/bookmark
 */
export async function PUT(
  _request: NextRequest,
  ctx: { params: Promise<{ threadId: string }> }
) {
  try {
    const { userId } = await requireAuth(_request);
    const params = await ctx.params;
    const threadId = parseRouteId(params.threadId);

    const [t] = await db
      .select({ id: mlThread.id })
      .from(mlThread)
      .where(eq(mlThread.id, threadId))
      .limit(1);

    if (!t) {
      return Response.json(
        { error: "Thread not found", ok: false },
        { status: 404 }
      );
    }

    await db
      .insert(mlBookmark)
      .values({
        id: crypto.randomUUID(),
        threadId,
        userId,
      })
      .onConflictDoNothing({
        target: [mlBookmark.userId, mlBookmark.threadId],
      });

    return Response.json({ ok: true });
  } catch (error) {
    return handleAPIError(error);
  }
}

/**
 * DELETE /api/app/mailing-lists/threads/[threadId]/bookmark
 */
export async function DELETE(
  request: NextRequest,
  ctx: { params: Promise<{ threadId: string }> }
) {
  try {
    const { userId } = await requireAuth(request);
    const params = await ctx.params;
    const threadId = parseRouteId(params.threadId);

    await db
      .delete(mlBookmark)
      .where(
        and(eq(mlBookmark.userId, userId), eq(mlBookmark.threadId, threadId))
      );

    return Response.json({ ok: true });
  } catch (error) {
    return handleAPIError(error);
  }
}
