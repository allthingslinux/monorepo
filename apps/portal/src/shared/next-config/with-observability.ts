import { keys } from "@portal/observability/keys";
import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

/**
 * Add observability configuration to Next.js config
 * This includes Sentry integration when available
 */
export const withObservability = (sourceConfig: NextConfig): NextConfig => {
  const env = keys();

  // Only add Sentry config if org and project are configured
  if (!(env.SENTRY_ORG && env.SENTRY_PROJECT)) {
    return sourceConfig;
  }

  // Skip Sentry config in development to avoid next-prerender-crypto: Sentry’s
  // instrumentation runs during MetadataOutlet and uses crypto.randomUUID() before
  // request data is read. See https://nextjs.org/docs/messages/next-prerender-crypto
  // and https://github.com/vercel/next.js/issues/72904
  if (process.env.NODE_ENV === "development") {
    return sourceConfig;
  }

  const sentryConfig: Parameters<typeof withSentryConfig>[1] = {
    // Upload source maps for readable stack traces
    authToken: env.SENTRY_AUTH_TOKEN,
    // Bundle size optimizations
    bundleSizeOptimizations: {
      excludeDebugStatements: true,
    },

    // Error handling for CI/CD
    errorHandler: (error) => {
      console.warn("Sentry build error occurred:", error);
      // Don't fail the build in CI for Sentry issues
      if (process.env.CI) {
        return;
      }
      throw error;
    },

    org: env.SENTRY_ORG,

    project: env.SENTRY_PROJECT,

    // Release configuration
    release: {
      create: true,
      finalize: true,
      name: env.SENTRY_RELEASE || "unknown",
    },

    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // Source maps configuration
    sourcemaps: {
      assets: ["**/*.js", "**/*.js.map"],
      deleteSourcemapsAfterUpload: true,
      disable: false,
      ignore: ["**/node_modules/**"], // Security: delete after upload
    },

    // Route Sentry requests through your server (avoids ad-blockers)
    // When tunnelRoute is set, Sentry SDK automatically uses this path for tunneling
    // Our manual route handler at /api/monitoring handles the actual forwarding
    tunnelRoute: "/api/monitoring",

    // Webpack tree-shaking configuration for production builds
    webpack: {
      // Enables automatic instrumentation of Vercel Cron Monitors
      automaticVercelMonitors: true, // Moved from deprecated top-level option
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      treeshake: {
        excludeReplayCompressionWorker: false, // Use built-in compression worker
        excludeReplayIframe: false, // Keep iframe capture for session replay
        excludeReplayShadowDOM: true, // Portal doesn't use shadow DOM extensively
        removeDebugLogging: true, // Replaces deprecated disableLogger
        removeTracing: false, // Keep tracing for performance monitoring
      },
    },

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,
  };

  // Merge transpilePackages to preserve existing packages
  const existingPackages = sourceConfig.transpilePackages || [];
  const mergedPackages = [...existingPackages, "@sentry/nextjs"].filter(
    (v, i, a) => a.indexOf(v) === i
  ); // unique

  return withSentryConfig(
    {
      ...sourceConfig,
      transpilePackages: mergedPackages,
    },
    sentryConfig
  );
};