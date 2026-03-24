import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * Get validated observability environment variables
 * Uses t3-env for runtime validation and type safety
 * @returns Validated environment configuration for observability (Sentry)
 */
export const keys = () =>
  createEnv({
    client: {
      NEXT_PUBLIC_SENTRY_DSN: z.url().optional(),
      NEXT_PUBLIC_SENTRY_RELEASE: z.string().optional(),
    },
    runtimeEnv: {
      SENTRY_ORG: process.env.SENTRY_ORG,
      SENTRY_PROJECT: process.env.SENTRY_PROJECT,
      SENTRY_RELEASE: process.env.SENTRY_RELEASE,
      SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
      NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
      NEXT_PUBLIC_SENTRY_RELEASE: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
    },
    server: {
      SENTRY_ORG: z.string().optional(),
      SENTRY_PROJECT: z.string().optional(),
      SENTRY_RELEASE: z.string().optional(),
      SENTRY_AUTH_TOKEN: z.string().optional(),
    },
  });