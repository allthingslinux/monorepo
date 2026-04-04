import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple in-memory store for rate limiting
const store = new Map<string, { count: number; resetTime: number }>();

// Get client IP address
function getClientIP(req: NextRequest): string {
  const cfConnectingIP = req.headers.get("cf-connecting-ip");
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  const xForwardedFor = req.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0].trim();
  }

  return "unknown";
}

// Simple rate limiter for form submissions: 1 per hour
export function formSubmissionRateLimit(req: NextRequest): NextResponse | null {
  const ip = getClientIP(req);
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const resetTime = now + windowMs;

  // Clean up expired entries
  for (const key of store.keys()) {
    const entry = store.get(key);
    if (entry && entry.resetTime < now) {
      store.delete(key);
    }
  }

  // Check if IP exists and is within window
  const existing = store.get(ip);
  if (!existing || existing.resetTime < now) {
    store.set(ip, { count: 1, resetTime });
    return null; // Allow request
  }

  // Block if already submitted within the last hour
  return NextResponse.json(
    {
      error:
        "You can only submit 1 application per hour. Please try again later.",
    },
    { status: 429 }
  );
}

// General API rate limiter: 100 requests per hour
export function apiRateLimit(req: NextRequest): NextResponse | null {
  const ip = getClientIP(req);
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxRequests = 100;
  const resetTime = now + windowMs;

  // Clean up expired entries
  for (const key of store.keys()) {
    const entry = store.get(key);
    if (entry && entry.resetTime < now) {
      store.delete(key);
    }
  }

  // Check if IP exists and is within window
  const existing = store.get(ip);
  if (!existing || existing.resetTime < now) {
    store.set(ip, { count: 1, resetTime });
    return null; // Allow request
  }

  // Increment count if within window
  const current = store.get(ip);
  if (current && current.count < maxRequests) {
    current.count += 1;
    return null; // Allow request
  }

  // Block if rate limit exceeded
  return NextResponse.json(
    { error: "Rate limit exceeded. Please try again later." },
    { status: 429 }
  );
}
