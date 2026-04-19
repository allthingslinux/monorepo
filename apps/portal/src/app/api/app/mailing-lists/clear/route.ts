import type { NextRequest } from "next/server";

import { allowMailingListSync } from "@/features/mailing-lists/lib/rate-limit";
import { clearMlUserState } from "@/features/mailing-lists/lib/sync";
import { handleAPIError, requireAuth } from "@atl/api/utils";
import {
  enrichWideEventWithUser,
  withWideEvent,
} from "@atl/observability/wide-events";
import type { WideEvent } from "@atl/observability/wide-events";

/**
 * POST /api/app/mailing-lists/clear
 * Clear current user's mailing-list state (rate-limited per user).
 */
export const POST = withWideEvent(
  async (request: NextRequest, event: WideEvent) => {
    try {
      const { session, userId } = await requireAuth(request);
      enrichWideEventWithUser(event, {
        email: session.user.email,
        id: userId,
      });

      if (!allowMailingListSync(userId)) {
        return Response.json(
          {
            error: "Too many requests. Try again in a minute.",
            ok: false,
          },
          { status: 429 }
        );
      }

      const result = await clearMlUserState(userId);
      return Response.json({ data: result, ok: true });
    } catch (error) {
      return handleAPIError(error);
    }
  }
);
