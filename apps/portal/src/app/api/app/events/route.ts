import type { NextRequest } from "next/server";

import { getIcsCalendarEvents } from "@/features/events/lib/ics-events";
import { handleAPIError, requireAuth } from "@atl/api/utils";
import { enrichEventsWithSources, getManualEvents } from "@atl/config/events";
import {
  enrichWideEventWithUser,
  withWideEvent,
} from "@atl/observability/wide-events";
import type { WideEvent } from "@atl/observability/wide-events";

// With cacheComponents, route handlers are dynamic by default.

export interface EventsLivePayload {
  events: ReturnType<typeof enrichEventsWithSources>;
}

export const GET = withWideEvent(
  async (request: NextRequest, event: WideEvent) => {
    try {
      const { session, userId } = await requireAuth(request);
      enrichWideEventWithUser(event, {
        email: session.user.email,
        id: userId,
      });

      const manual = getManualEvents();
      const freshRemote = await getIcsCalendarEvents({
        bypassNextDataCache: true,
      });
      const freshEvents = enrichEventsWithSources([...manual, ...freshRemote]);

      const allFailed = freshRemote.length === 0;
      const responsePayload: EventsLivePayload = {
        events: allFailed
          ? enrichEventsWithSources([
              ...manual,
              ...(await getIcsCalendarEvents()),
            ])
          : freshEvents,
      };

      return Response.json(responsePayload, {
        headers: { "Cache-Control": "private, no-store" },
      });
    } catch (error) {
      return handleAPIError(error);
    }
  }
);
