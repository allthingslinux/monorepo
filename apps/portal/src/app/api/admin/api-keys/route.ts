import { handleAPIError, requireAdminOrStaff } from "@atl/api/utils";
import { db } from "@atl/db/client";
import { apikey } from "@atl/db/schema/api-keys";
import { user } from "@atl/db/schema/auth";
import { and, desc, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";

// With cacheComponents, route handlers are dynamic by default.

export async function GET(request: NextRequest) {
  try {
    await requireAdminOrStaff(request);

    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get("userId");
    const enabled = searchParams.get("enabled");
    const limit = Number.parseInt(searchParams.get("limit") || "100", 10);
    const offset = Number.parseInt(searchParams.get("offset") || "0", 10);

    // Build where conditions
    const conditions: ReturnType<typeof eq>[] = [];
    if (userIdParam) {
      conditions.push(eq(apikey.referenceId, userIdParam));
    }
    if (enabled !== null) {
      conditions.push(eq(apikey.enabled, enabled === "true"));
    }
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Fetch API keys with user information
    const apiKeysData = await db
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
      .where(whereClause)
      .orderBy(desc(apikey.createdAt))
      .limit(limit)
      .offset(offset);

    // Transform to match expected format (exclude hashed key from response)
    const apiKeys = apiKeysData.map((row) => ({
      ...row.apikey,
      user: row.user?.id ? row.user : undefined,
    }));

    return Response.json({ apiKeys });
  } catch (error) {
    return handleAPIError(error);
  }
}
