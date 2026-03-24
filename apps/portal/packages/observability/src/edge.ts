/*
 * This file configures the initialization of Sentry on the Edge runtime.
 * The config you add here will be used whenever Edge functions handle a request.
 * https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import "server-only";
import {
  consoleLoggingIntegration,
  extraErrorDataIntegration,
  httpIntegration,
  init,
  zodErrorsIntegration,
} from "@sentry/nextjs";

import { keys } from "./keys";

// Common regex patterns for edge runtime filtering
const REQUEST_ABORTED_REGEX = /Request aborted/;
const EDGE_RUNTIME_REGEX = /edge runtime/i;
const HEALTH_CHECK_REGEX = /^GET \/health/;
const API_HEALTH_REGEX = /^GET \/api\/health/;
const MONITORING_REGEX = /^GET \/monitoring/;
const STATIC_ASSETS_REGEX = /^GET \/_next\/static\//;
const FAVICON_REGEX = /^GET \/favicon/;

/**
 * Check if a URL is a Sentry endpoint by parsing the hostname.
 * Prevents false positives for "sentry.io" in paths or query strings.
 */
function isSentryHostEdge(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    const hostname = parsed.hostname.toLowerCase();
    return hostname === "sentry.io" || hostname.endsWith(".sentry.io");
  } catch {
    return false;
  }
}

export const initializeSentry = (): ReturnType<typeof init> => {
  const env = keys();

  if (!env.NEXT_PUBLIC_SENTRY_DSN) {
    // Sentry not configured, return early
    return undefined as ReturnType<typeof init>;
  }

  // Skip init in development to avoid next-prerender-crypto (scope/trace use
  // crypto.randomUUID() during MetadataOutlet). See server.ts for details.
  if (process.env.NODE_ENV === "development") {
    return undefined as ReturnType<typeof init>;
  }

  // Environment-based sample rates
  const isProduction = process.env.NODE_ENV === "production";

  const integrations = [
    // Send console.log, console.error, and console.warn calls as logs to Sentry
    consoleLoggingIntegration({ levels: ["log", "error", "warn"] }),

    // HTTP integration for request/response tracking
    httpIntegration({
      breadcrumbs: true, // Enable breadcrumbs for HTTP requests
      ignoreIncomingRequests: (urlPath) =>
        urlPath.includes("/health") ||
        urlPath.includes("/api/health") ||
        urlPath.includes("/monitoring"),
      ignoreOutgoingRequests: (url) => isSentryHostEdge(url),
      maxIncomingRequestBodySize: "small", // 1KB limit for edge runtime
      spans: true, // Enable spans for outgoing HTTP requests
    }),

    // Zod validation error enhancement
    zodErrorsIntegration({
      limit: 10, // Limit validation errors per event
    }),

    extraErrorDataIntegration({
      captureErrorCause: true, // Capture error.cause chains
      depth: 5, // Capture deeper error object properties
    }),
  ];

  return init({
    // Filter sensitive data before sending
    beforeSend(event) {
      // Remove sensitive request data
      if (event.request) {
        event.request.cookies = undefined;
        if (event.request.headers) {
          const headers = event.request.headers as Record<string, unknown>;
          headers.authorization = undefined;
          headers.cookie = undefined;
        }
      }

      // Remove sensitive user data
      if (event.user) {
        event.user.email = undefined;
        event.user.ip_address = undefined;
      }

      return event;
    },

    // Filter transaction data
    beforeSendTransaction(event) {
      // Remove query parameters that might contain sensitive data
      if (event.transaction) {
        event.transaction = event.transaction.split("?")[0];
      }
      return event;
    },
    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,

    dsn: env.NEXT_PUBLIC_SENTRY_DSN,

    // Enable logging
    enableLogs: true,

    // Environment and release info
    environment: process.env.NODE_ENV,

    // Filter out common edge runtime errors
    ignoreErrors: [
      "ECONNRESET",
      "EPIPE",
      "ENOTFOUND",
      REQUEST_ABORTED_REGEX,
      EDGE_RUNTIME_REGEX,
    ],

    // Filter out health check and monitoring transactions
    ignoreTransactions: [
      HEALTH_CHECK_REGEX,
      API_HEALTH_REGEX,
      MONITORING_REGEX,
      STATIC_ASSETS_REGEX,
      FAVICON_REGEX,
    ],

    // Integrations for console logging and error data
    integrations,

    release: env.SENTRY_RELEASE || "unknown",

    // Lower sample rate in production to reduce costs
    // In production: 10% of transactions
    // In development: 100% of transactions
    tracesSampleRate: isProduction ? 0.1 : 1,
  });
};