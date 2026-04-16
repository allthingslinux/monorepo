import "server-only";
import { captureException } from "@sentry/nextjs";

import type { EventSource, ManualCalendarEvent } from "@atl/config/events";

import {
  calendarFetchCacheInit,
  CALENDAR_FETCH_TIMEOUT_MS,
  calendarUpstreamHeaders,
} from "./calendar-upstream";
import type { CalendarFetchOptions } from "./calendar-upstream";

const DEV_EVENTS_LINUX_URL = "https://dev.events/linux";
const DEV_EVENTS_ICAL_BASE = "https://dev.events/ical/";

/** Max concurrent ICS fetches to avoid hammering the server. */
const MAX_CONCURRENT_FETCHES = 6;

/**
 * Extract conference slugs from the dev.events/linux HTML page.
 * The static HTML contains links like `conferences/linux-plumbers-conference-aoyhsbaj`.
 */
function extractSlugs(html: string): string[] {
  const pattern = /conferences\/([a-z0-9-]+)/gu;
  const slugs = new Set<string>();
  let match;
  while ((match = pattern.exec(html)) !== null) {
    slugs.add(match[1]);
  }
  return [...slugs];
}

/**
 * Parse a single-event ICS file into a ManualCalendarEvent.
 */
function parseIcsEvent(
  ics: string,
  slug: string,
  source: EventSource
): ManualCalendarEvent | null {
  const summary = /SUMMARY:(.+)/u.exec(ics)?.[1]?.trim();
  if (!summary) {
    return null;
  }

  // DTSTART can be DATE or DATETIME
  const dtstart =
    /DTSTART(?:;VALUE=DATE)?:(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})Z?)?/u.exec(
      ics
    );
  const dtend =
    /DTEND(?:;VALUE=DATE)?:(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})Z?)?/u.exec(
      ics
    );

  let startsAt: string | undefined;
  let endsAt: string | undefined;

  if (dtstart) {
    const [, y, m, d, h, min, s] = dtstart;
    startsAt = h
      ? `${y}-${m}-${d}T${h}:${min}:${s}Z`
      : `${y}-${m}-${d}T00:00:00.000Z`;
  }

  if (dtend) {
    const [, y, m, d, h, min, s] = dtend;
    if (h) {
      endsAt = `${y}-${m}-${d}T${h}:${min}:${s}Z`;
    } else {
      // DATE-only DTEND in ICS is exclusive, so subtract 1 day
      const endDate = new Date(`${y}-${m}-${d}`);
      endDate.setDate(endDate.getDate() - 1);
      endsAt = endDate.toISOString();
    }
  }

  const location =
    /LOCATION:(.+)/u.exec(ics)?.[1]?.replaceAll("\\,", ",").trim() || "—";

  const url =
    /URL:(.+)/u.exec(ics)?.[1]?.trim() ||
    `https://dev.events/conferences/${slug}`;

  const description =
    /DESCRIPTION:(.+)/u
      .exec(ics)?.[1]
      ?.replaceAll("\\,", ",")
      .replaceAll("\\n", " ")
      .trim() || `${summary} — from dev.events.`;

  return {
    category: source.name,
    description,
    id: `${source.id}:${slug}`,
    location,
    sourceId: source.id,
    title: summary,
    url,
    ...(startsAt ? { startsAt } : {}),
    ...(endsAt ? { endsAt } : {}),
  };
}

async function fetchIcsForSlug(
  slug: string,
  options?: CalendarFetchOptions
): Promise<string | null> {
  try {
    const res = await fetch(`${DEV_EVENTS_ICAL_BASE}${slug}`, {
      headers: calendarUpstreamHeaders("text/calendar"),
      ...calendarFetchCacheInit(options),
      signal: AbortSignal.timeout(CALENDAR_FETCH_TIMEOUT_MS),
    });
    if (!res.ok) {
      return null;
    }
    return res.text();
  } catch {
    return null;
  }
}

/**
 * Fetch Linux/OS events from dev.events.
 * 1. Scrape the /linux page for conference slugs
 * 2. Batch-fetch individual ICS files for each slug
 * 3. Parse into ManualCalendarEvent[]
 */
export async function fetchDevEventsForSource(
  source: EventSource,
  options?: CalendarFetchOptions
): Promise<ManualCalendarEvent[]> {
  try {
    // Step 1: Get the slugs from the listing page
    const listUrl = source.siteUrl ?? DEV_EVENTS_LINUX_URL;
    const listRes = await fetch(listUrl, {
      headers: calendarUpstreamHeaders("text/html"),
      ...calendarFetchCacheInit(options),
      signal: AbortSignal.timeout(CALENDAR_FETCH_TIMEOUT_MS),
    });

    if (!listRes.ok) {
      throw new Error(
        `dev.events listing fetch failed: HTTP ${listRes.status}`
      );
    }

    const html = await listRes.text();
    const slugs = extractSlugs(html);

    if (slugs.length === 0) {
      return [];
    }

    // Step 2: Batch-fetch ICS files with concurrency limit
    const events: ManualCalendarEvent[] = [];

    for (let i = 0; i < slugs.length; i += MAX_CONCURRENT_FETCHES) {
      const batch = slugs.slice(i, i + MAX_CONCURRENT_FETCHES);
      const results = await Promise.all(
        batch.map(async (slug) => {
          const ics = await fetchIcsForSlug(slug, options);
          if (!ics) {
            return null;
          }
          return parseIcsEvent(ics, slug, source);
        })
      );
      for (const ev of results) {
        if (ev) {
          events.push(ev);
        }
      }
    }

    return events;
  } catch (error) {
    captureException(error, {
      level: "warning",
      tags: { calendarSourceId: source.id, calendarTransport: "dev-events" },
    });
    return [];
  }
}
