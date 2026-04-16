import "server-only";
import { captureException } from "@sentry/nextjs";

import type { EventSource, ManualCalendarEvent } from "@atl/config/events";
import { EVENT_SOURCES } from "@atl/config/events";

import {
  calendarFetchCacheInit,
  CALENDAR_FETCH_REVALIDATE_SECONDS,
  CALENDAR_FETCH_TIMEOUT_MS,
  calendarUpstreamHeaders,
  resolveWebcalToHttps,
} from "./calendar-upstream";
import type { CalendarFetchOptions } from "./calendar-upstream";
import { fetchDevEventsForSource } from "./dev-events";
import { fetchDiscourseEventsForSource } from "./discourse-events";
import { fetchFedocalEventsForSource } from "./fedocal-events";
import { parseVeventsFromIcs } from "./ics-parse";
import { fetchLfEventsForSource } from "./lf-events";
import { parseRssToEvents } from "./rss-parse";

/** Kept for callers that imported the old name; same as CALENDAR_FETCH_REVALIDATE_SECONDS. */
export const EVENT_ICS_FETCH_REVALIDATE_SECONDS =
  CALENDAR_FETCH_REVALIDATE_SECONDS;

/** KDE ships a broken first line; normalize so parsers accept the file. */
function normalizeBrokenCalHeader(body: string): string {
  return body.replace(
    /^BEGIN:VCALENDARVERSION:/im,
    "BEGIN:VCALENDAR\r\nVERSION:"
  );
}

async function fetchIcsText(
  url: string,
  options?: CalendarFetchOptions
): Promise<string> {
  const fetchUrl = resolveWebcalToHttps(url);
  const res = await fetch(fetchUrl, {
    headers: calendarUpstreamHeaders("text/calendar,text/plain,*/*"),
    ...calendarFetchCacheInit(options),
    signal: AbortSignal.timeout(CALENDAR_FETCH_TIMEOUT_MS),
  });
  if (!res.ok) {
    throw new Error(`ICS fetch failed: HTTP ${res.status}`);
  }
  return normalizeBrokenCalHeader(await res.text());
}

async function fetchRssText(
  url: string,
  options?: CalendarFetchOptions
): Promise<string> {
  const res = await fetch(url, {
    headers: calendarUpstreamHeaders(
      "application/rss+xml,application/xml,text/xml,text/plain,*/*"
    ),
    ...calendarFetchCacheInit(options),
    signal: AbortSignal.timeout(CALENDAR_FETCH_TIMEOUT_MS),
  });
  if (!res.ok) {
    throw new Error(`RSS fetch failed: HTTP ${res.status}`);
  }
  return res.text();
}

function parseIcsToEvents(
  icsText: string,
  source: EventSource
): ManualCalendarEvent[] {
  const vevents = parseVeventsFromIcs(icsText);
  return vevents.map((ev) => ({
    category: source.name,
    description: ev.description || `From ${source.name} community calendar.`,
    id: `${source.id}:${ev.uid}`,
    location: ev.location || "—",
    sourceId: source.id,
    startsAt: ev.dtstart,
    title: ev.summary || "(Untitled event)",
    ...(ev.dtend ? { endsAt: ev.dtend } : {}),
    ...(ev.url ? { url: ev.url } : {}),
  }));
}

function sourceFetchesRemotely(source: EventSource): boolean {
  if (!source.enabled || source.kind === "manual") {
    return false;
  }
  if (source.kind === "ics") {
    return Boolean(source.calendarUrl) || Boolean(source.feedUrl);
  }
  if (source.kind === "rss") {
    return Boolean(source.feedUrl);
  }
  if (source.kind === "discourse") {
    return Boolean(source.discourseEventsUrl);
  }
  if (source.kind === "fedocal") {
    return Boolean(source.fedocalApiUrl);
  }
  if (source.kind === "lf-scrape") {
    return Boolean(source.siteUrl);
  }
  if (source.kind === "dev-events") {
    return true;
  }
  return false;
}

async function fetchEventsForSource(
  source: EventSource,
  options?: CalendarFetchOptions
): Promise<ManualCalendarEvent[]> {
  if (!sourceFetchesRemotely(source)) {
    return [];
  }

  if (source.kind === "discourse") {
    return fetchDiscourseEventsForSource(source, options);
  }

  if (source.kind === "fedocal") {
    return fetchFedocalEventsForSource(source, options);
  }

  if (source.kind === "lf-scrape") {
    return fetchLfEventsForSource(source, options);
  }

  if (source.kind === "dev-events") {
    return fetchDevEventsForSource(source, options);
  }

  const merged: ManualCalendarEvent[] = [];
  const seenUrls = new Set<string>();

  if (source.kind === "ics" && source.calendarUrl) {
    try {
      const text = await fetchIcsText(source.calendarUrl, options);
      for (const ev of parseIcsToEvents(text, source)) {
        merged.push(ev);
        if (ev.url) {
          seenUrls.add(ev.url);
        }
      }
    } catch (error) {
      captureException(error, {
        level: "warning",
        tags: { calendarSourceId: source.id, calendarTransport: "ics" },
      });
    }
  }

  if (source.feedUrl && (source.kind === "ics" || source.kind === "rss")) {
    try {
      const xml = await fetchRssText(source.feedUrl, options);
      for (const ev of parseRssToEvents(xml, source)) {
        if (ev.url && seenUrls.has(ev.url)) {
          continue;
        }
        if (ev.url) {
          seenUrls.add(ev.url);
        }
        merged.push(ev);
      }
    } catch (error) {
      captureException(error, {
        level: "warning",
        tags: { calendarSourceId: source.id, calendarTransport: "rss" },
      });
    }
  }

  return merged;
}

/** Remote calendar rows: ICS, RSS, Discourse JSON (Next fetch revalidate). */
export async function getIcsCalendarEvents(
  options?: CalendarFetchOptions
): Promise<ManualCalendarEvent[]> {
  const sources = EVENT_SOURCES.filter((s) => sourceFetchesRemotely(s));
  const batches = await Promise.all(
    sources.map((s) => fetchEventsForSource(s, options))
  );
  return batches.flat();
}
