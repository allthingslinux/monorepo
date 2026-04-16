/**
 * Shared HTTP client config for ICS, RSS, and Discourse calendar fetches.
 */

export const CALENDAR_FETCH_REVALIDATE_SECONDS = 3600;
export const CALENDAR_FETCH_TIMEOUT_MS = 15_000;

/**
 * Many CDNs/WAFs treat uncommon bot User-Agents as suspicious. A typical browser UA
 * reduces that; we still suffix ATL-Portal for logs and support.
 */
export const CALENDAR_FETCH_USER_AGENT =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 ATL-Portal/1.0 (+https://atl.tools; calendar fetch)";

export interface CalendarFetchOptions {
  bypassNextDataCache?: boolean;
}

export function calendarUpstreamHeaders(accept: string): HeadersInit {
  return {
    Accept: accept,
    "Accept-Language": "en-US,en;q=0.9",
    "User-Agent": CALENDAR_FETCH_USER_AGENT,
  };
}

export function calendarFetchCacheInit(
  options?: CalendarFetchOptions
): Pick<RequestInit, "cache" | "next"> {
  if (options?.bypassNextDataCache) {
    return { cache: "no-store" };
  }
  return { next: { revalidate: CALENDAR_FETCH_REVALIDATE_SECONDS } };
}

/** `webcal://` uses the same host/path as HTTPS for server-side fetch. */
export function resolveWebcalToHttps(url: string): string {
  return url.trim().replace(/^webcal:/iu, "https:");
}
