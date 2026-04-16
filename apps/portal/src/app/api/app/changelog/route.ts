import type { NextRequest } from "next/server";

import { fetchChangelog } from "@/features/changelog/lib/service";
import { handleAPIError, requireAuth } from "@atl/api/utils";
import { CHANGELOG_REPOS } from "@atl/config/changelog";
import {
  enrichWideEventWithUser,
  withWideEvent,
} from "@atl/observability/wide-events";
import type { WideEvent } from "@atl/observability/wide-events";

// With cacheComponents, route handlers are dynamic by default.

/**
 * GET /api/app/changelog
 * Fresh changelog payload for authenticated users (bypasses Next fetch Data Cache).
 */
export const GET = withWideEvent(
  async (request: NextRequest, event: WideEvent) => {
    try {
      const { session, userId } = await requireAuth(request);
      enrichWideEventWithUser(event, {
        email: session.user.email,
        id: userId,
      });

      const payload = await fetchChangelog(CHANGELOG_REPOS, {
        bypassNextDataCache: true,
      });
      const allFailed =
        payload.entries.length === 0 && payload.errors.length > 0;
      const responsePayload = allFailed
        ? await fetchChangelog(CHANGELOG_REPOS)
        : payload;

      return Response.json(responsePayload, {
        headers: { "Cache-Control": "private, no-store" },
      });
    } catch (error) {
      return handleAPIError(error);
    }
  }
);
