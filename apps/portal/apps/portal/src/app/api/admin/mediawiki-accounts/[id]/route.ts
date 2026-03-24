import {
  APIError,
  handleAPIError,
  parseRouteId,
  requireAdminOrStaff,
} from "@portal/api/utils";
import { db } from "@portal/db/client";
import { user } from "@portal/db/schema/auth";
import { mediawikiAccount } from "@portal/db/schema/mediawiki";
import { and, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";

import { mediawikiIntegration } from "@/features/integrations/lib/mediawiki/implementation";

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/mediawiki-accounts/[id]">
) {
  try {
    await requireAdminOrStaff(request);
    const params = await ctx.params;
    const id = parseRouteId(params.id);

    const [row] = await db
      .select({
        mediawikiAccount,
        user: {
          email: user.email,
          id: user.id,
          name: user.name,
        },
      })
      .from(mediawikiAccount)
      .leftJoin(user, eq(mediawikiAccount.userId, user.id))
      .where(eq(mediawikiAccount.id, id))
      .limit(1);

    if (!row) {
      return Response.json(
        { error: "MediaWiki account not found", ok: false },
        { status: 404 }
      );
    }

    return Response.json({
      mediawikiAccount: {
        ...row.mediawikiAccount,
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
  ctx: RouteContext<"/api/admin/mediawiki-accounts/[id]">
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

    const updated = await mediawikiIntegration.updateAccount(id, body);

    return Response.json({ mediawikiAccount: updated, ok: true });
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/mediawiki-accounts/[id]">
) {
  try {
    await requireAdminOrStaff(request);
    const params = await ctx.params;
    const id = parseRouteId(params.id);

    const [existing] = await db
      .select({ id: mediawikiAccount.id })
      .from(mediawikiAccount)
      .where(and(eq(mediawikiAccount.id, id)))
      .limit(1);

    if (!existing) {
      return Response.json(
        { error: "MediaWiki account not found", ok: false },
        { status: 404 }
      );
    }

    await mediawikiIntegration.deleteAccount(id);

    return Response.json({ ok: true });
  } catch (error) {
    return handleAPIError(error);
  }
}