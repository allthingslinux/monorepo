import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { apiRateLimit, formSubmissionRateLimit } from "@/lib/rate-limit";

export async function proxy(request: NextRequest) {
  // Environment URLs are now set statically in wrangler.jsonc for each environment
  // No need for dynamic runtime environment detection with separate workers
  const host = request.headers.get("host") || "";

  console.log(
    "Proxy running for path:",
    request.nextUrl.pathname,
    "Host:",
    host
  );

  // Only apply to /api routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    console.log("Proxy running for API request:", request.nextUrl.pathname);

    // Handle OPTIONS requests (preflight)
    if (request.method === "OPTIONS") {
      return new NextResponse(null, {
        headers: {
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Allow-Headers":
            "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Max-Age": "86400",
        },
        status: 204,
      });
    }

    // Stricter limit for POSTs to /forms/; general limit otherwise
    const rateLimitResponse =
      request.nextUrl.pathname.includes("/forms/") && request.method === "POST"
        ? await formSubmissionRateLimit(request)
        : await apiRateLimit(request);

    // If rate limit exceeded, return the rate limit response
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Get response with CORS headers
    const response = NextResponse.next();

    // Add CORS headers to all API responses
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,DELETE,OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
    );

    return response;
  }
}

export const config = {
  matcher: "/api/:path*",
};
