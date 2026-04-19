import type { NextRequest } from "next/server";

import { allowMailingListSync } from "@/features/mailing-lists/lib/rate-limit";
import {
  syncAllMlSources,
  syncMlSource,
} from "@/features/mailing-lists/lib/sync";
import { handleAPIError, requireAuth } from "@atl/api/utils";
import {
  enrichWideEventWithUser,
  withWideEvent,
} from "@atl/observability/wide-events";
import type { WideEvent } from "@atl/observability/wide-events";
import { mailingListSyncBodySchema } from "@atl/schemas/mailing-lists";

/**
 * POST /api/app/mailing-lists/sync
 * Trigger feed ingestion (rate-limited per user).
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
            error: "Too many sync requests. Try again in a minute.",
            ok: false,
          },
          { status: 429 }
        );
      }

      const json: unknown = await request.json().catch(() => ({}));
      const body = mailingListSyncBodySchema.parse(json);
      const cursorMode = body.older ? "older" : "smart";

      if (body.all) {
        const results = await syncAllMlSources({
          bypassNextDataCache: true,
          cursorMode,
        });
        return Response.json({ data: { results }, ok: true });
      }

      if (body.sourceSlug) {
        const result = await syncMlSource(body.sourceSlug, {
          bypassNextDataCache: true,
          cursorMode,
        });
        return Response.json({ data: { result }, ok: true });
      }

      return Response.json(
        {
          error:
            'Provide body { all: true } or { sourceSlug: "lkml" } (optionally with { older: true })',
          ok: false,
        },
        { status: 400 }
      );
    } catch (error) {
      return handleAPIError(error);
    }
  }
);
