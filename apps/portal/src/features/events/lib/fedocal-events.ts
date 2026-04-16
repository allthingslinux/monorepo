import "server-only";
import { captureException } from "@sentry/nextjs";

import type { EventSource, ManualCalendarEvent } from "@atl/config/events";

import {
  calendarFetchCacheInit,
  CALENDAR_FETCH_TIMEOUT_MS,
  calendarUpstreamHeaders,
} from "./calendar-upstream";
import type { CalendarFetchOptions } from "./calendar-upstream";

/**
 * Shape of a single meeting from the Fedocal JSON API.
 * `GET /api/meetings/?calendar=<name>&start=<date>&end=<date>`
 */
interface FedocalMeeting {
  meeting_date: string;
  meeting_date_end: string;
  meeting_id: number;
  meeting_information: string;
  meeting_location: string | null;
  meeting_name: string;
  meeting_time_start: string;
  meeting_time_stop: string;
  meeting_timezone: string;
}

interface FedocalResponse {
  meetings: FedocalMeeting[];
}

function extractLocationFromInfo(info: string): string {
  const match = /Location:\s*(.+)/iu.exec(info);
  if (match) {
    return match[1].trim().slice(0, 200);
  }
  return "";
}

function extractUrlFromInfo(info: string): string | undefined {
  // Look for "More information available at:" followed by a URL
  const moreInfo =
    /More information available at:\s*\[?(https?:\/\/[^\s\]]+)/iu.exec(info);
  if (moreInfo) {
    return moreInfo[1];
  }
  // Fallback: first URL in the text
  const firstUrl = /https?:\/\/[^\s)]+/u.exec(info);
  return firstUrl?.[0];
}

function buildIsoDateTime(
  date: string,
  time: string,
  timezone: string
): string {
  // date = "2026-01-31", time = "00:00:00", timezone = "UTC" or "America/Los_Angeles"
  // For simplicity, build an ISO string. If timezone is UTC, append Z.
  // Otherwise, append the IANA timezone for downstream consumers.
  if (time === "00:00:00" && timezone === "UTC") {
    return `${date}T00:00:00.000Z`;
  }
  return `${date}T${time}`;
}

function getEndsAt(
  meeting: FedocalMeeting
): { endsAt: string } | Record<string, never> {
  if (meeting.meeting_date_end !== meeting.meeting_date) {
    return {
      endsAt: buildIsoDateTime(
        meeting.meeting_date_end,
        meeting.meeting_time_stop,
        meeting.meeting_timezone
      ),
    };
  }
  if (meeting.meeting_time_stop !== "00:00:00") {
    return {
      endsAt: buildIsoDateTime(
        meeting.meeting_date,
        meeting.meeting_time_stop,
        meeting.meeting_timezone
      ),
    };
  }
  return {};
}

function meetingToEvent(
  meeting: FedocalMeeting,
  source: EventSource
): ManualCalendarEvent {
  const location =
    meeting.meeting_location?.trim() ||
    extractLocationFromInfo(meeting.meeting_information);
  const url = extractUrlFromInfo(meeting.meeting_information);

  // Strip markdown links and Location: lines for a cleaner description
  let description = meeting.meeting_information
    .replaceAll(/\[([^\]]+)\]\([^)]+\)/gu, "$1")
    .replaceAll(/More information available at:\s*.*/giu, "")
    .replaceAll(/Location:\s*.*/giu, "")
    .replaceAll("\r\n", "\n")
    .replaceAll(/\n{3,}/gu, "\n\n")
    .trim();

  if (!description) {
    description = `${meeting.meeting_name} — from ${source.name} community calendar.`;
  }

  return {
    category: source.name,
    description,
    id: `${source.id}:${meeting.meeting_id}`,
    location: location || "—",
    sourceId: source.id,
    startsAt: buildIsoDateTime(
      meeting.meeting_date,
      meeting.meeting_time_start,
      meeting.meeting_timezone
    ),
    title: meeting.meeting_name,
    ...getEndsAt(meeting),
    ...(url ? { url } : {}),
  };
}

/**
 * Fetch events from a Fedocal JSON API endpoint.
 * Queries a 2-year window (1 year back + 1 year forward) to capture
 * both recent and upcoming events.
 */
export async function fetchFedocalEventsForSource(
  source: EventSource,
  options?: CalendarFetchOptions
): Promise<ManualCalendarEvent[]> {
  if (!source.fedocalApiUrl || !source.fedocalCalendar) {
    return [];
  }

  const now = new Date();
  const start = new Date(now.getFullYear() - 1, 0, 1)
    .toISOString()
    .slice(0, 10);
  const end = new Date(now.getFullYear() + 1, 11, 31)
    .toISOString()
    .slice(0, 10);

  const url = `${source.fedocalApiUrl}?calendar=${encodeURIComponent(source.fedocalCalendar)}&start=${start}&end=${end}`;

  try {
    const res = await fetch(url, {
      headers: calendarUpstreamHeaders("application/json"),
      ...calendarFetchCacheInit(options),
      signal: AbortSignal.timeout(CALENDAR_FETCH_TIMEOUT_MS),
    });

    if (!res.ok) {
      throw new Error(`Fedocal fetch failed: HTTP ${res.status}`);
    }

    const data = (await res.json()) as FedocalResponse;
    return (data.meetings ?? []).map((m) => meetingToEvent(m, source));
  } catch (error) {
    captureException(error, {
      level: "warning",
      tags: { calendarSourceId: source.id, calendarTransport: "fedocal" },
    });
    return [];
  }
}
