import {
  handleAPIError,
  parseRouteId,
  requireAdminOrStaff,
} from "@portal/api/utils";
import { db } from "@portal/db/client";
import { apikey } from "@portal/db/schema/api-keys";
import { user } from "@portal/db/schema/auth";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";

// With cacheComponents, route handlers are dynamic by default.

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/api-keys/[id]">
) {
  try {
    await requireAdminOrStaff(request);
    const params = await ctx.params;
    const id = parseRouteId(params.id);

    // Fetch API key with user information
    const [apiKeyData] = await db
      .select({
        apikey,
        user: {
          email: user.email,
          id: user.id,
          name: user.name,
        },
      })
      .from(apikey)
      .leftJoin(user, eq(apikey.referenceId, user.id))
      .where(eq(apikey.id, id))
      .limit(1);

    if (!apiKeyData) {
      return Response.json(
        { error: "API key not found", ok: false },
        { status: 404 }
      );
    }

    // Exclude hashed key from response
    const apiKeyResponse = {
      ...apiKeyData.apikey,
      user: apiKeyData.user?.id ? apiKeyData.user : undefined,
    };

    return Response.json({ apiKey: apiKeyResponse });
  } catch (error) {
    return handleAPIError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/api-keys/[id]">
) {
  try {
    await requireAdminOrStaff(request);
    const params = await ctx.params;
    const id = parseRouteId(params.id);

    const [deleted] = await db
      .delete(apikey)
      .where(eq(apikey.id, id))
      .returning();

    if (!deleted) {
      return Response.json(
        { error: "API key not found", ok: false },
        { status: 404 }
      );
    }

    return Response.json({ success: true });
  } catch (error) {
    return handleAPIError(error);
  }
}