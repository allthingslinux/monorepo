import type { NextRequest } from "next/server";

import { handleAPIError, requireAuth } from "@atl/api/utils";
import { db } from "@atl/db/client";
import { mlSource } from "@atl/db/schema/mailing-lists";

/**
 * GET /api/app/mailing-lists/health
 * Aggregate sync health + per-source status for monitoring (authenticated).
 */
export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);

    const rows = await db
      .select({
        displayName: mlSource.displayName,
        id: mlSource.id,
        lastSyncError: mlSource.lastSyncError,
        lastSyncStatus: mlSource.lastSyncStatus,
        lastSyncedAt: mlSource.lastSyncedAt,
        slug: mlSource.slug,
      })
      .from(mlSource)
      .orderBy(mlSource.displayName);

    const sourcesTotal = rows.length;
    let sourcesOk = 0;
    let sourcesInError = 0;
    let sourcesNeverSynced = 0;
    for (const r of rows) {
      if (r.lastSyncStatus === "ok") {
        sourcesOk += 1;
      } else if (r.lastSyncStatus === "error") {
        sourcesInError += 1;
      } else {
        sourcesNeverSynced += 1;
      }
    }

    return Response.json(
      {
        data: {
          sources: rows.map((r) => ({
            displayName: r.displayName,
            id: r.id,
            lastSyncError: r.lastSyncError,
            lastSyncStatus: r.lastSyncStatus,
            lastSyncedAt: r.lastSyncedAt?.toISOString() ?? null,
            slug: r.slug,
          })),
          sourcesInError,
          sourcesNeverSynced,
          sourcesOk,
          sourcesTotal,
        },
        ok: true,
      },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error) {
    return handleAPIError(error);
  }
}
