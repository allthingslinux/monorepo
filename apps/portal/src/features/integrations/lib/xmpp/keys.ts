import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * Get validated XMPP environment variables
 * Uses t3-env for runtime validation and type safety
 *
 * Auth: Prosody's mod_http_admin_api requires Bearer token auth (mod_tokenauth).
 * Set PROSODY_REST_TOKEN to a token generated via prosodyctl or OAuth2.
 *
 * @returns Validated environment configuration for XMPP/Prosody integration
 */
export const keys = () =>
  createEnv({
    runtimeEnv: {
      PROSODY_REST_TOKEN: process.env.PROSODY_REST_TOKEN,
      PROSODY_REST_URL: process.env.PROSODY_REST_URL,
      XMPP_DOMAIN: process.env.XMPP_DOMAIN,
    },
    server: {
      PROSODY_REST_TOKEN: z.string().optional(),
      PROSODY_REST_URL: z.url().optional(),
      XMPP_DOMAIN: z.string().optional(),
    },
  });
