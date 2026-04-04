import { oauthProviderAuthServerMetadata } from "@better-auth/oauth-provider";
import type { NextRequest } from "next/server";

import { auth } from "@/auth";

// With cacheComponents, route handlers are dynamic by default.

// Type assertion needed because TypeScript doesn't infer the plugin API methods
// The oauthProvider plugin is configured, so this will work at runtime
// Wrap in async function to prevent execution during build
const handler = oauthProviderAuthServerMetadata(
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  auth as unknown as Parameters<typeof oauthProviderAuthServerMetadata>[0]
);

export async function GET(request: NextRequest) {
  return handler(request);
}
