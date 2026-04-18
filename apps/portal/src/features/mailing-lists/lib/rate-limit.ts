/**
 * Lightweight in-process rate limiter for sync endpoints (per user id).
 * Resets on process restart; sufficient for single-instance or low-volume abuse prevention.
 */
const WINDOW_MS = 60_000;
const MAX_SYNCS_PER_WINDOW = 5;

const buckets = new Map<string, number[]>();

export function allowMailingListSync(userId: string): boolean {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;
  const prev = buckets.get(userId) ?? [];
  const recent = prev.filter((t) => t > windowStart);
  if (recent.length >= MAX_SYNCS_PER_WINDOW) {
    buckets.set(userId, recent);
    return false;
  }
  recent.push(now);
  buckets.set(userId, recent);
  return true;
}
