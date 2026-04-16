import type { NextRequest } from "next/server";

import { fetchAllLinuxFeeds } from "@/shared/feed";
import { handleAPIError, requireAuth } from "@atl/api/utils";
import { LINUX_FEED_SOURCES } from "@atl/config/feed";
import {
  enrichWideEventWithUser,
  withWideEvent,
} from "@atl/observability/wide-events";
import type { WideEvent } from "@atl/observability/wide-events";

// With cacheComponents, route handlers are dynamic by default.

/**
 * GET /api/app/feed
 * Fresh Linux feed payload for authenticated users (bypasses Next fetch Data Cache).
 */
export const GET = withWideEvent(
  async (request: NextRequest, event: WideEvent) => {
    try {
      const { session, userId } = await requireAuth(request);
      enrichWideEventWithUser(event, {
        email: session.user.email,
        id: userId,
      });

      const payload = await fetchAllLinuxFeeds(LINUX_FEED_SOURCES, {
        bypassNextDataCache: true,
      });

      return Response.json(payload, {
        headers: { "Cache-Control": "private, no-store" },
      });
    } catch (error) {
      return handleAPIError(error);
    }
  }
);
