import { and, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";

import { handleAPIError, parseRouteId, requireAuth } from "@atl/api/utils";
import { db } from "@atl/db/client";
import { mlSource, mlUserFollowSource } from "@atl/db/schema/mailing-lists";

/**
 * PUT /api/app/mailing-lists/sources/[sourceId]/follow
 */
export async function PUT(
  request: NextRequest,
  ctx: { params: Promise<{ sourceId: string }> }
) {
  try {
    const { userId } = await requireAuth(request);
    const params = await ctx.params;
    const sourceId = parseRouteId(params.sourceId);

    const [src] = await db
      .select({ id: mlSource.id })
      .from(mlSource)
      .where(eq(mlSource.id, sourceId))
      .limit(1);

    if (!src) {
      return Response.json(
        { error: "Source not found", ok: false },
        { status: 404 }
      );
    }

    await db
      .insert(mlUserFollowSource)
      .values({
        id: crypto.randomUUID(),
        sourceId,
        userId,
      })
      .onConflictDoNothing({
        target: [mlUserFollowSource.userId, mlUserFollowSource.sourceId],
      });

    return Response.json({ ok: true });
  } catch (error) {
    return handleAPIError(error);
  }
}

/**
 * DELETE /api/app/mailing-lists/sources/[sourceId]/follow
 */
export async function DELETE(
  request: NextRequest,
  ctx: { params: Promise<{ sourceId: string }> }
) {
  try {
    const { userId } = await requireAuth(request);
    const params = await ctx.params;
    const sourceId = parseRouteId(params.sourceId);

    await db
      .delete(mlUserFollowSource)
      .where(
        and(
          eq(mlUserFollowSource.userId, userId),
          eq(mlUserFollowSource.sourceId, sourceId)
        )
      );

    return Response.json({ ok: true });
  } catch (error) {
    return handleAPIError(error);
  }
}
