import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { runtimeEnv as env } from "@/env";
import {
  escapeHtml,
  exchangeAuthorizationCode,
  getCloudflareEnv,
  saveTokens,
} from "@/lib/integrations/quickbooks";

export const runtime = "nodejs";

function buildQuickBooksCallbackBaseUrl(requestUrl: string): string {
  const url = new URL(requestUrl);
  const host = url.hostname;
  const { port } = url;
  const protocol = url.protocol.replace(":", "");
  const finalProtocol = host.includes("localhost") ? "http" : protocol;
  return port
    ? `${finalProtocol}://${host}:${port}`
    : `${finalProtocol}://${host}`;
}

function quickBooksOAuthStateErrorHtml(
  storedState: string | undefined,
  state: string | null
): string {
  return `<!DOCTYPE html>
    <html>
    <head><title>OAuth Error</title></head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px;">
      <h1>⚠️ OAuth State Validation Failed</h1>
      <p>This could be due to:</p>
      <ul>
        <li>Cookie not being set (check browser DevTools → Application → Cookies)</li>
        <li>Cross-domain cookie issues</li>
        <li>Session expired (try the OAuth flow again)</li>
      </ul>
      <p><strong>State cookie found:</strong> ${storedState ? "Yes" : "No"}</p>
      <p><strong>State parameter:</strong> ${state ? "Present" : "Missing"}</p>
      <p>To retry the OAuth flow, please use the admin setup endpoint with proper authentication.</p>
      <p><a href="/">Return to home</a></p>
    </body>
    </html>`;
}

function logQuickBooksCallbackDevTokenHints(
  clientId: string,
  refreshToken: string,
  realmId: string
): void {
  console.log("");
  console.log(
    "🔑 QuickBooks OAuth Setup - Copy these to your environment variables:"
  );
  console.log(`QUICKBOOKS_CLIENT_ID=${clientId}`);
  console.log(
    `QUICKBOOKS_REFRESH_TOKEN=${refreshToken.slice(0, 10)}...${refreshToken.slice(-4)} (masked)`
  );
  const safeRealmId = /^[0-9]+$/.test(realmId) ? realmId : "[INVALID_FORMAT]";
  console.log(`QUICKBOOKS_REALM_ID=${safeRealmId}`);
  console.log(
    `QUICKBOOKS_ENVIRONMENT=${env.QUICKBOOKS_ENVIRONMENT || "sandbox"}`
  );
  console.log("");
  console.log(
    "⚠️  Full refresh token available in browser network tab or server logs."
  );
  console.log("Add these to your .env.local file and restart your dev server.");
  console.log("");
}

function buildQuickBooksOAuthSuccessHtml(
  realmId: string,
  saved: boolean,
  isSetupMode: boolean
): string {
  return `<!DOCTYPE html>
    <html>
    <head><title>QuickBooks Authorization Success</title></head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center;">
      <h1>✅ Authorization Successful!</h1>
      <p>Your QuickBooks integration is now ${isSetupMode ? "configured" : "updated"}.</p>
      <p><strong>Realm ID:</strong> ${escapeHtml(realmId)}</p>
      <p><strong>Environment:</strong> ${escapeHtml(env.QUICKBOOKS_ENVIRONMENT || "sandbox")}</p>
      ${saved ? "<p>✅ Tokens have been automatically saved to Cloudflare (KV or Secrets).</p>" : "<p>⚠️ Tokens are being used from environment variables. Check server logs for details.</p>"}
      <p>You can close this window now.</p>
    </body>
    </html>`;
}

export async function GET(request: NextRequest) {
  const { nextUrl, cookies } = request;
  const { searchParams } = nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const realmId = searchParams.get("realmId");
  const errorParam = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  if (errorParam) {
    return NextResponse.json(
      {
        error: errorParam,
        error_description: errorDescription,
      },
      { status: 400 }
    );
  }

  if (!(code && realmId)) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  const storedState = cookies.get("qb_oauth_state")?.value;
  const isValidState = storedState && storedState === state;

  if (!isValidState) {
    console.error("CSRF state validation failed", {
      allCookies: [...cookies.getAll()].map((c) => c.name),
      receivedState: state ? `[${state.slice(0, 8)}...]` : "missing",
      storedState: storedState ? `[${storedState.slice(0, 8)}...]` : "missing",
    });

    return new NextResponse(quickBooksOAuthStateErrorHtml(storedState, state), {
      headers: { "Content-Type": "text/html" },
      status: 403,
    });
  }

  const clientId = env.QUICKBOOKS_CLIENT_ID;
  const clientSecret = env.QUICKBOOKS_CLIENT_SECRET;
  const baseUrl = buildQuickBooksCallbackBaseUrl(request.url);
  const redirectUri = `${baseUrl}/api/quickbooks/callback`;

  if (!(clientId && clientSecret)) {
    return NextResponse.json(
      { error: "Missing QuickBooks credentials" },
      { status: 500 }
    );
  }

  try {
    const tokens = await exchangeAuthorizationCode(
      code,
      redirectUri,
      clientId,
      clientSecret,
      env.QUICKBOOKS_ENVIRONMENT || "sandbox"
    );

    if (!tokens) {
      return NextResponse.json(
        { error: "Token exchange failed" },
        { status: 500 }
      );
    }

    const tokenData = {
      clientId,
      clientSecret,
      environment: env.QUICKBOOKS_ENVIRONMENT || "sandbox",
      realmId,
      refreshToken: tokens.refresh_token,
    };

    const cfEnv = await getCloudflareEnv();

    console.log(
      "[QuickBooks Callback] KV namespace available:",
      !!cfEnv?.KV_QUICKBOOKS
    );
    console.log("[QuickBooks Callback] Attempting to save tokens...", {
      environment: tokenData.environment,
      hasClientId: !!tokenData.clientId,
      hasClientSecret: !!tokenData.clientSecret,
      hasRealmId: !!tokenData.realmId,
      hasRefreshToken: !!tokenData.refreshToken,
    });

    const saved = await saveTokens(tokenData, cfEnv);

    if (saved) {
      console.log(
        "[QuickBooks Callback] ✅ QuickBooks tokens saved (KV or Secrets API)"
      );
    } else {
      console.warn(
        "[QuickBooks Callback] ⚠️ Tokens NOT saved to KV/Secrets (using environment variables)"
      );
      console.log("[QuickBooks Callback] 💡 To enable automatic token saving:");
      console.log(
        "[QuickBooks Callback]    1. Ensure KV namespace is accessible, OR"
      );
      console.log(
        "[QuickBooks Callback]    2. Add CLOUDFLARE_API_TOKEN as a secret to enable automatic secret updates"
      );
      if (env.NODE_ENV === "development") {
        logQuickBooksCallbackDevTokenHints(
          clientId,
          tokens.refresh_token,
          realmId
        );
      }
    }

    const isSetupMode = !env.QUICKBOOKS_REFRESH_TOKEN;

    const html = buildQuickBooksOAuthSuccessHtml(realmId, saved, isSetupMode);

    const finalResponse = new NextResponse(html, {
      headers: { "Content-Type": "text/html" },
    });
    finalResponse.cookies.delete("qb_oauth_state");
    return finalResponse;
  } catch (error) {
    console.error("Error in QuickBooks callback:", error);
    return NextResponse.json(
      {
        details: error instanceof Error ? error.message : "Unknown error",
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}