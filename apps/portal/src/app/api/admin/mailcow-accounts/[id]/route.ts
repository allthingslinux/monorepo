import {
  APIError,
  handleAPIError,
  parseRouteId,
  requireAdminOrStaff,
} from "@atl/api/utils";
import { db } from "@atl/db/client";
import { user } from "@atl/db/schema/auth";
import { mailcowAccount } from "@atl/db/schema/mailcow";
import { and, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";

import { mailcowIntegration } from "@/features/integrations/lib/mailcow/implementation";

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/mailcow-accounts/[id]">
) {
  try {
    await requireAdminOrStaff(request);
    const params = await ctx.params;
    const id = parseRouteId(params.id);

    const [row] = await db
      .select({
        mailcowAccount,
        user: {
          email: user.email,
          id: user.id,
          name: user.name,
        },
      })
      .from(mailcowAccount)
      .leftJoin(user, eq(mailcowAccount.userId, user.id))
      .where(eq(mailcowAccount.id, id))
      .limit(1);

    if (!row) {
      return Response.json(
        { error: "Mailcow account not found", ok: false },
        { status: 404 }
      );
    }

    return Response.json({
      mailcowAccount: {
        ...row.mailcowAccount,
        user: row.user?.id ? row.user : undefined,
      },
      ok: true,
    });
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/mailcow-accounts/[id]">
) {
  try {
    await requireAdminOrStaff(request);
    const params = await ctx.params;
    const id = parseRouteId(params.id);

    let body: Record<string, unknown>;
    try {
      const raw = await request.json();
      if (typeof raw !== "object" || raw === null) {
        throw new APIError("Invalid request body", 400);
      }
      body = raw as Record<string, unknown>;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError("Invalid JSON body", 400);
    }

    const updated = await mailcowIntegration.updateAccount(id, body);

    return Response.json({ mailcowAccount: updated, ok: true });
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/mailcow-accounts/[id]">
) {
  try {
    await requireAdminOrStaff(request);
    const params = await ctx.params;
    const id = parseRouteId(params.id);

    const [existing] = await db
      .select({ id: mailcowAccount.id })
      .from(mailcowAccount)
      .where(and(eq(mailcowAccount.id, id)))
      .limit(1);

    if (!existing) {
      return Response.json(
        { error: "Mailcow account not found", ok: false },
        { status: 404 }
      );
    }

    await mailcowIntegration.deleteAccount(id);

    return Response.json({ ok: true });
  } catch (error) {
    return handleAPIError(error);
  }
}
