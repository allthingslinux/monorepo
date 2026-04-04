import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { runtimeEnv as env } from "@/env";
import {
  fetchQuickBooksTransactions,
  getCloudflareEnv,
} from "@/lib/integrations/quickbooks";

// Cloudflare Workers runtime - using nodejs for Buffer/crypto compatibility
export const runtime = "nodejs";

/**
 * Helper to get Cloudflare env with KV access
 * Uses getCloudflareContext() which is the recommended way in OpenNext Cloudflare
 * Falls back gracefully if not available
 */

/**
 * GET /api/quickbooks
 *
 * Public endpoint that returns QuickBooks transaction data for transparency.
 * This is intentionally public to provide financial transparency for the organization.
 *
 * Data includes: transaction amounts, types, dates, and basic descriptions.
 * Sensitive details like full customer/vendor information are limited.
 */
export async function GET(_request: NextRequest) {
  try {
    // Get Cloudflare environment
    // Uses getCloudflareContext() which is the recommended way in OpenNext Cloudflare
    const cfEnv = await getCloudflareEnv();

    console.log(
      "[QuickBooks API] Request received, KV namespace available:",
      !!cfEnv?.KV_QUICKBOOKS
    );

    // Fetch transactions with Cloudflare environment
    const transactions = await fetchQuickBooksTransactions(cfEnv);

    console.log(
      "[QuickBooks API] Returning",
      transactions.length,
      "transactions"
    );

    return NextResponse.json({
      count: transactions.length,
      data: transactions,
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[QuickBooks API] ❌ Error fetching QuickBooks data:", error);
    console.error(
      "[QuickBooks API] Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );

    let devDetails: string | undefined;
    if (env.NODE_ENV === "development") {
      devDetails = error instanceof Error ? error.message : "Unknown error";
    }
    let devStack: string | undefined;
    if (env.NODE_ENV === "development" && error instanceof Error) {
      devStack = error.stack;
    }

    const body: Record<string, unknown> = {
      details: devDetails,
      error: "Failed to fetch QuickBooks data",
      success: false,
    };
    if (devStack !== undefined) {
      body.stack = devStack;
    }

    return NextResponse.json(body, { status: 500 });
  }
}

/**
 * POST /api/quickbooks
 *
 * Administrative endpoint for token refresh operations.
 * Requires authentication to prevent abuse and unauthorized token operations.
 */
export async function POST(request: NextRequest) {
  try {
    // Basic authentication check - require admin access
    const authHeader = request.headers.get("authorization");
    const adminKey = env.QUICKBOOKS_ADMIN_KEY;

    if (!adminKey || authHeader !== `Bearer ${adminKey}`) {
      return NextResponse.json(
        { error: "Unauthorized - admin access required", success: false },
        { status: 401 }
      );
    }

    const body: { action?: string } = await request.json();
    const { action } = body;

    if (action === "refresh_tokens") {
      // Fetch latest transactions (tokens will be refreshed automatically if needed)
      const cfEnv = await getCloudflareEnv();
      const transactions = await fetchQuickBooksTransactions(cfEnv);

      return NextResponse.json({
        count: transactions.length,
        data: transactions,
        message: "Latest transactions fetched successfully",
        success: true,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      { error: "Invalid action", success: false },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error in QuickBooks API:", error);

    let postDevDetails: string | undefined;
    if (env.NODE_ENV === "development") {
      postDevDetails = error instanceof Error ? error.message : "Unknown error";
    }

    return NextResponse.json(
      {
        details: postDevDetails,
        error: "API request failed",
        success: false,
      },
      { status: 500 }
    );
  }
}
