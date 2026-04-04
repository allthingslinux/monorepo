import { oauthProviderOpenIdConfigMetadata } from "@better-auth/oauth-provider";
import type { NextRequest } from "next/server";

import { auth } from "@/auth";

// Issuer-scoped OpenID Connect discovery endpoint.
// Per the OIDC spec, openid-configuration uses path *appending*:
// the issuer path is prepended before /.well-known/openid-configuration.
// With basePath "/api/auth", the canonical path is:
//   /api/auth/.well-known/openid-configuration
//
// The root /.well-known/openid-configuration is kept as a fallback for
// clients that incorrectly hardcode the root path (docs recommend both).
//
// See: https://openid.net/specs/openid-connect-discovery-1_0.html

const handler = oauthProviderOpenIdConfigMetadata(
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  auth as unknown as Parameters<typeof oauthProviderOpenIdConfigMetadata>[0]
);

export async function GET(request: NextRequest) {
  return handler(request);
}
