import { env } from "@/env";

/** Strip trailing slashes for safe path joining. */
function normalizePortalBase(url: string): string {
  return url.replace(/\/+$/, "");
}

/**
 * Base URL for the Portal app (production or local). Set via `NEXT_PUBLIC_PORTAL_URL`.
 */
export function getPortalBaseUrl(): string {
  return normalizePortalBase(env.NEXT_PUBLIC_PORTAL_URL);
}

/** Full URL to Portal sign-up (Better Auth UI). */
export function getPortalSignUpUrl(): string {
  return `${getPortalBaseUrl()}/auth/sign-up`;
}

/** Full URL to Portal sign-in. */
export function getPortalSignInUrl(): string {
  return `${getPortalBaseUrl()}/auth/sign-in`;
}
