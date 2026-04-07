import {
  APIError,
  handleAPIError,
  parseRouteId,
  requireAdminOrStaff,
} from "@atl/api/utils";
import { db } from "@atl/db/client";
import { user } from "@atl/db/schema/auth";
import { xmppAccount } from "@atl/db/schema/xmpp";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";

import { xmppIntegration } from "@/features/integrations/lib/xmpp/implementation";

// With cacheComponents, route handlers are dynamic by default.

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/xmpp-accounts/[id]">
) {
  try {
    await requireAdminOrStaff(request);
    const params = await ctx.params;
    const id = parseRouteId(params.id);

    const [row] = await db
      .select({
        user: {
          email: user.email,
          id: user.id,
          name: user.name,
        },
        xmppAccount,
      })
      .from(xmppAccount)
      .leftJoin(user, eq(xmppAccount.userId, user.id))
      .where(eq(xmppAccount.id, id))
      .limit(1);

    if (!row) {
      return Response.json(
        { error: "XMPP account not found", ok: false },
        { status: 404 }
      );
    }

    return Response.json({
      ok: true,
      xmppAccount: {
        ...row.xmppAccount,
        user: row.user?.id ? row.user : undefined,
      },
    });
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/xmpp-accounts/[id]">
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

    const updated = await xmppIntegration.updateAccount(id, body);

    return Response.json({ ok: true, xmppAccount: updated });
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/xmpp-accounts/[id]">
) {
  try {
    await requireAdminOrStaff(request);
    const params = await ctx.params;
    const id = parseRouteId(params.id);

    const [existing] = await db
      .select({ id: xmppAccount.id })
      .from(xmppAccount)
      .where(eq(xmppAccount.id, id))
      .limit(1);

    if (!existing) {
      return Response.json(
        { error: "XMPP account not found", ok: false },
        { status: 404 }
      );
    }

    await xmppIntegration.deleteAccount(id);

    return Response.json({ ok: true });
  } catch (error) {
    return handleAPIError(error);
  }
}
