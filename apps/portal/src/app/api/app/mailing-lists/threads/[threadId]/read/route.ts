import { and, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { z } from "zod";

import { handleAPIError, parseRouteId, requireAuth } from "@atl/api/utils";
import { db } from "@atl/db/client";
import {
  mlMessage,
  mlThread,
  mlUserReadState,
} from "@atl/db/schema/mailing-lists";

const readBodySchema = z.object({
  lastReadMessageId: z.string().min(1).optional(),
});

/**
 * PATCH /api/app/mailing-lists/threads/[threadId]/read
 */
export async function PATCH(
  request: NextRequest,
  ctx: { params: Promise<{ threadId: string }> }
) {
  try {
    const { userId } = await requireAuth(request);
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

    const json: unknown = await request.json().catch(() => ({}));
    const body = readBodySchema.parse(json);

    if (body.lastReadMessageId) {
      const [m] = await db
        .select({ id: mlMessage.id })
        .from(mlMessage)
        .where(
          and(
            eq(mlMessage.id, body.lastReadMessageId),
            eq(mlMessage.threadId, threadId)
          )
        )
        .limit(1);
      if (!m?.id) {
        return Response.json(
          { error: "Message not found in this thread", ok: false },
          { status: 400 }
        );
      }
    }

    await db
      .insert(mlUserReadState)
      .values({
        id: crypto.randomUUID(),
        lastReadAt: new Date(),
        lastReadMessageId: body.lastReadMessageId ?? null,
        threadId,
        userId,
      })
      .onConflictDoUpdate({
        set: {
          lastReadAt: new Date(),
          lastReadMessageId: body.lastReadMessageId ?? null,
        },
        target: [mlUserReadState.userId, mlUserReadState.threadId],
      });

    return Response.json({ ok: true });
  } catch (error) {
    return handleAPIError(error);
  }
}
