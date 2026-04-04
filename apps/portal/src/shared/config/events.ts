// ============================================================================
// Events & calendar sources configuration
// ============================================================================
// Manual events plus remote calendars: enabled `ics` / `rss` / `discourse` sources
// are fetched on the server (see features/events/lib/ics-events). manual rows use
// sourceId; remote rows use synthetic ids from each parser.

/** Who operates the calendar source */
export type EventOwnerType = "atl" | "external";

/** manual = EVENTS_CONFIG; remote kinds use the matching URL fields below */
export type EventSourceKind = "manual" | "ics" | "rss" | "discourse";

export interface EventSource {
  /** Optional accent for UI (Tailwind-friendly token or hex) */
  color?: string;
  /** ICS (iCalendar) URL when kind is ics */
  calendarUrl?: string;
  /** RSS / Atom XML listing (e.g. Hugo index.xml); merged with ICS, deduped by event URL */
  feedUrl?: string;
  /**
   * Discourse `GET …/discourse-post-event/events?…` JSON URL.
   * Discourse may return at most ~200 events per request.
   */
  discourseEventsUrl?: string;
  description: string;
  enabled: boolean;
  id: string;
  kind: EventSourceKind;
  name: string;
  ownerType: EventOwnerType;
  /** Organizer / conference homepage when helpful */
  siteUrl?: string;
}

/**
 * Normalized event shape for manual config and remote calendar merge.
 * `startsAt` / `endsAt` are ISO 8601 when known; omit `startsAt` for TBD (no calendar dot, listed last in Upcoming).
 */
export interface NormalizedCalendarEvent {
  category: string;
  description: string;
  endsAt?: string;
  featured?: boolean;
  id: string;
  location: string;
  sourceId: string;
  startsAt?: string;
  tags?: string[];
  timezone?: string;
  title: string;
  url?: string;
}

export type ManualCalendarEvent = NormalizedCalendarEvent;

/** Curated events (v1). Each must reference an enabled manual source, or any enabled source if you add ICS-backed ids later. */
export const EVENT_SOURCES: EventSource[] = [
  {
    description: "Official All Things Linux community events",
    enabled: true,
    id: "atl",
    kind: "manual",
    name: "All Things Linux",
    ownerType: "atl",
  },
  {
    calendarUrl: "https://kde.org/community/calendar/calendar.ics",
    description: "Official KDE community events calendar",
    enabled: true,
    feedUrl: "https://kde.org/community/calendar/index.xml",
    id: "kde-community",
    kind: "ics",
    name: "KDE",
    ownerType: "external",
    siteUrl: "https://kde.org/community/calendar/",
  },
  {
    calendarUrl: "webcal://events.opensuse.org/calendar.ics?full=true",
    description: "openSUSE community events calendar (OSEM)",
    enabled: true,
    id: "opensuse-events",
    kind: "ics",
    name: "openSUSE",
    ownerType: "external",
    siteUrl: "https://events.opensuse.org/",
  },
  {
    description:
      "Ubuntu Community Hub — Discourse calendar (events plugin JSON API)",
    discourseEventsUrl:
      "https://discourse.ubuntu.com/discourse-post-event/events?category_id=11&include_subcategories=true&include_expired=true",
    enabled: true,
    id: "ubuntu-discourse",
    kind: "discourse",
    name: "Ubuntu",
    ownerType: "external",
    siteUrl: "https://discourse.ubuntu.com/",
  },
  {
    calendarUrl: undefined,
    description:
      "Placeholder for a public ICS feed (e.g. conference calendar). Enable and set calendarUrl when ingestion is implemented.",
    enabled: false,
    id: "external-conference",
    kind: "ics",
    name: "External conference (ICS)",
    ownerType: "external",
    siteUrl: undefined,
  },
];

export const EVENTS_CONFIG: ManualCalendarEvent[] = [
  {
    category: "Community",
    description:
      "Open office hours for questions about Linux, ATL services, and contributing.",
    featured: true,
    id: "sample-office-hours",
    location: "Discord",
    sourceId: "atl",
    startsAt: "2026-06-01T17:00:00.000Z",
    title: "Community office hours",
    url: "https://discord.gg/allthingslinux",
  },
];

export function getEnabledEventSources(): EventSource[] {
  return EVENT_SOURCES.filter((s) => s.enabled);
}

function sourceById(): Map<string, EventSource> {
  return new Map(EVENT_SOURCES.map((s) => [s.id, s]));
}

/** Manual entries whose source exists and is enabled */
export function getManualEvents(): ManualCalendarEvent[] {
  const map = sourceById();
  return EVENTS_CONFIG.filter((e) => {
    const src = map.get(e.sourceId);
    return Boolean(src?.enabled);
  });
}

export function getUpcomingEvents(
  now: Date = new Date()
): ManualCalendarEvent[] {
  const t = now.getTime();
  const manual = getManualEvents();
  const dated = manual.filter(
    (e) => e.startsAt && !Number.isNaN(Date.parse(e.startsAt))
  );
  const undated = manual.filter(
    (e) => !e.startsAt || Number.isNaN(Date.parse(e.startsAt))
  );
  const datedUpcoming = dated
    .filter((e) => Date.parse(e.startsAt!) >= t)
    .toSorted((a, b) => Date.parse(a.startsAt!) - Date.parse(b.startsAt!));
  const undatedSorted = undated.toSorted((a, b) =>
    a.title.localeCompare(b.title, undefined, { sensitivity: "base" })
  );
  return [...datedUpcoming, ...undatedSorted];
}

export interface EnrichedCalendarEvent extends ManualCalendarEvent {
  source: Pick<EventSource, "id" | "name" | "ownerType" | "color">;
}

export function enrichEventsWithSources(
  events: ManualCalendarEvent[]
): EnrichedCalendarEvent[] {
  const map = sourceById();
  const out: EnrichedCalendarEvent[] = [];
  for (const e of events) {
    const src = map.get(e.sourceId);
    if (!src?.enabled) {
      continue;
    }
    out.push({
      ...e,
      source: {
        color: src.color,
        id: src.id,
        name: src.name,
        ownerType: src.ownerType,
      },
    });
  }
  return out;
}
