import { and, count, desc, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";

import { handleAPIError, requireAdminOrStaff } from "@atl/api/utils";
import { db } from "@atl/db/client";
import { user } from "@atl/db/schema/auth";
import { xmppAccount } from "@atl/db/schema/xmpp";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

// With cacheComponents, route handlers are dynamic by default.

export async function GET(request: NextRequest) {
  try {
    await requireAdminOrStaff(request);

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const rawLimit = Number.parseInt(searchParams.get("limit") ?? "", 10);
    const rawOffset = Number.parseInt(searchParams.get("offset") ?? "", 10);
    const limit =
      Number.isFinite(rawLimit) && rawLimit > 0
        ? Math.min(rawLimit, MAX_LIMIT)
        : DEFAULT_LIMIT;
    const offset = Number.isFinite(rawOffset) && rawOffset >= 0 ? rawOffset : 0;

    const validStatuses = ["active", "suspended", "deleted"] as const;
    const statusFilter =
      statusParam &&
      validStatuses.includes(statusParam as (typeof validStatuses)[number])
        ? (statusParam as (typeof validStatuses)[number])
        : undefined;

    const conditions: ReturnType<typeof eq>[] = [];
    if (statusFilter) {
      conditions.push(eq(xmppAccount.status, statusFilter));
    }
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, [totalResult]] = await Promise.all([
      db
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
        .where(whereClause)
        .orderBy(desc(xmppAccount.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: count() }).from(xmppAccount).where(whereClause),
    ]);

    const total = Number(totalResult?.count ?? 0);

    const xmppAccounts = rows.map((row) => ({
      ...row.xmppAccount,
      user: row.user?.id ? row.user : undefined,
    }));

    return Response.json({
      pagination: {
        hasMore: offset + limit < total,
        limit,
        offset,
        total,
      },
      xmppAccounts,
    });
  } catch (error) {
    return handleAPIError(error);
  }
}
