import { handleAPIError, requireAuth } from "@portal/api/utils";
import type { NextRequest } from "next/server";

import { registerIntegrations } from "@/features/integrations/lib";
import { getIntegrationRegistry } from "@/features/integrations/lib/core/registry";

// With cacheComponents, route handlers are dynamic by default.

/**
 * GET /api/integrations
 * List available integrations
 */
export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);

    registerIntegrations();
    const integrations = getIntegrationRegistry().getPublicInfo();

    return Response.json({ integrations, ok: true });
  } catch (error) {
    return handleAPIError(error);
  }
}