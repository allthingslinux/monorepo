import "server-only";
import { captureException } from "@sentry/nextjs";

import type { EventSource, ManualCalendarEvent } from "@/config/events";

import {
  CALENDAR_FETCH_REVALIDATE_SECONDS,
  CALENDAR_FETCH_TIMEOUT_MS,
  calendarUpstreamHeaders,
} from "./calendar-upstream";

/**
 * Parse a Linux Foundation date string like "Apr 7–8, 2026" or "Sep 30–Oct 1, 2026"
 * into ISO start/end dates.
 */
function parseLfDateRange(raw: string): {
  endsAt?: string;
  startsAt?: string;
} {
  const trimmed = raw.trim();
  if (trimmed === "TBA" || !trimmed) {
    return {};
  }

  // "May 18–20, 2026" or "May 4, 2026"
  const singleMonth =
    /^([A-Z][a-z]+)\s+(\d{1,2})(?:–(\d{1,2}))?,\s*(\d{4})$/u.exec(trimmed);
  if (singleMonth) {
    const [, month, startDay, endDay, year] = singleMonth;
    const start = new Date(`${month} ${startDay}, ${year}`);
    if (Number.isNaN(start.getTime())) {
      return {};
    }
    const startsAt = start.toISOString();
    if (endDay) {
      const end = new Date(`${month} ${endDay}, ${year}`);
      return {
        endsAt: Number.isNaN(end.getTime()) ? undefined : end.toISOString(),
        startsAt,
      };
    }
    return { startsAt };
  }

  // "Sep 30–Oct 1, 2026" (cross-month)
  const crossMonth =
    /^([A-Z][a-z]+)\s+(\d{1,2})–([A-Z][a-z]+)\s+(\d{1,2}),\s*(\d{4})$/u.exec(
      trimmed
    );
  if (crossMonth) {
    const [, startMonth, startDay, endMonth, endDay, year] = crossMonth;
    const start = new Date(`${startMonth} ${startDay}, ${year}`);
    const end = new Date(`${endMonth} ${endDay}, ${year}`);
    return {
      endsAt: Number.isNaN(end.getTime()) ? undefined : end.toISOString(),
      startsAt: Number.isNaN(start.getTime()) ? undefined : start.toISOString(),
    };
  }

  return {};
}

function stripHtml(s: string): string {
  return s
    .replaceAll(/<[^>]+>/gu, "")
    .replaceAll("&amp;", "&")
    .replaceAll(/&#\d+;/gu, "")
    .replaceAll(/\s+/gu, " ")
    .trim();
}

/**
 * Scrape the Linux Foundation events calendar page.
 * Each event is in an h5 > a block followed by p.event-meta with date/location spans.
 */
export async function fetchLfEventsForSource(
  source: EventSource
): Promise<ManualCalendarEvent[]> {
  const url =
    source.siteUrl ?? "https://events.linuxfoundation.org/about/calendar/";

  try {
    const res = await fetch(url, {
      headers: calendarUpstreamHeaders("text/html"),
      next: { revalidate: CALENDAR_FETCH_REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(CALENDAR_FETCH_TIMEOUT_MS),
    });

    if (!res.ok) {
      throw new Error(`LF Events fetch failed: HTTP ${res.status}`);
    }

    const html = await res.text();
    return parseLfEventsHtml(html, source);
  } catch (error) {
    captureException(error, {
      level: "warning",
      tags: { calendarSourceId: source.id, calendarTransport: "lf-scrape" },
    });
    return [];
  }
}

function parseLfEventsHtml(
  html: string,
  source: EventSource
): ManualCalendarEvent[] {
  const events: ManualCalendarEvent[] = [];

  // Match each event link: <a href="https://events.linuxfoundation.org/SLUG/">NAME</a>
  // followed by date and location in nearby spans
  const eventPattern =
    /<a\s+href="(https:\/\/events\.linuxfoundation\.org\/[^"]+\/)"[^>]*>([\s\S]*?)<\/a>/gu;

  let match;
  while ((match = eventPattern.exec(html)) !== null) {
    const eventUrl = match[1];
    const eventName = stripHtml(match[2]);

    // Skip non-event links (about pages, team pages, etc.)
    if (/\/about\//u.test(eventUrl) || /\/wp-/u.test(eventUrl) || !eventName) {
      continue;
    }

    // Look ahead in the HTML after this match for date and location
    const afterMatch = html.slice(
      match.index,
      Math.min(match.index + 2000, html.length)
    );

    // Extract date from the "date" span
    const dateSpan = /<span\s+class="date[^"]*"[^>]*>[\s\S]*?<\/span>/u.exec(
      afterMatch
    );
    const dateText = dateSpan ? stripHtml(dateSpan[0]) : "";
    const { startsAt, endsAt } = parseLfDateRange(dateText);

    // Extract location from the "location" span
    const locSpan = /<span\s+class="location[^"]*"[^>]*>[\s\S]*?<\/span>/u.exec(
      afterMatch
    );
    let location = locSpan ? stripHtml(locSpan[0]) : "";

    // Check for Virtual marker
    const virtualSpan =
      /<span\s+class="virtual[^"]*"[^>]*>[\s\S]*?<\/span>/u.exec(afterMatch);
    if (virtualSpan) {
      const vText = stripHtml(virtualSpan[0]);
      if (vText && location) {
        location = `${location} + ${vText}`;
      } else if (vText) {
        location = vText;
      }
    }

    const id = `${source.id}:${eventUrl
      .replace("https://events.linuxfoundation.org/", "")
      .replaceAll(/\/$/gu, "")}`;

    events.push({
      category: source.name,
      description: `${eventName} — Linux Foundation event.`,
      id,
      location: location || "—",
      sourceId: source.id,
      title: eventName,
      url: eventUrl,
      ...(startsAt ? { startsAt } : {}),
      ...(endsAt ? { endsAt } : {}),
    });
  }

  return events;
}
