import { handleAPIError, requireAdminOrStaff } from "@portal/api/utils";
import { db } from "@portal/db/client";
import { apikey } from "@portal/db/schema/api-keys";
import { session, user } from "@portal/db/schema/auth";
import { oauthClient } from "@portal/db/schema/oauth";
import { count, sql } from "drizzle-orm";
import type { NextRequest } from "next/server";

// With cacheComponents, route handlers are dynamic by default.

export async function GET(request: NextRequest) {
  try {
    await requireAdminOrStaff(request);

    const [[userStats], [sessionStats], [apiKeyStats], [oauthClientStats]] =
      await Promise.all([
        db
          .select({
            admins: sql<number>`COUNT(*) FILTER (WHERE ${user.role} = 'admin')`,
            banned: sql<number>`COUNT(*) FILTER (WHERE ${user.banned} = true)`,
            staff: sql<number>`COUNT(*) FILTER (WHERE ${user.role} = 'staff')`,
            total: count(user.id),
          })
          .from(user),
        db
          .select({
            active: sql<number>`COUNT(*) FILTER (WHERE ${session.expiresAt} > NOW())`,
            total: count(session.id),
          })
          .from(session),
        db
          .select({
            enabled: sql<number>`COUNT(*) FILTER (WHERE ${apikey.enabled} = true)`,
            total: count(apikey.id),
          })
          .from(apikey),
        db
          .select({
            disabled: sql<number>`COUNT(*) FILTER (WHERE ${oauthClient.disabled} = true)`,
            total: count(oauthClient.id),
          })
          .from(oauthClient),
      ]);

    return Response.json({
      apiKeys: {
        enabled: Number(apiKeyStats.enabled),
        total: Number(apiKeyStats.total),
      },
      oauthClients: {
        disabled: Number(oauthClientStats.disabled),
        total: Number(oauthClientStats.total),
      },
      sessions: {
        active: Number(sessionStats.active),
        total: Number(sessionStats.total),
      },
      users: {
        admins: Number(userStats.admins),
        banned: Number(userStats.banned),
        regular:
          Number(userStats.total) -
          Number(userStats.admins) -
          Number(userStats.staff),
        staff: Number(userStats.staff),
        total: Number(userStats.total),
      },
    });
  } catch (error) {
    return handleAPIError(error);
  }
}