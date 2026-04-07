import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";

import type { EnrichedCalendarEvent } from "@atl/config/events";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CalendarCell {
  currentMonth: boolean;
  date: Date;
  day: number;
}

export interface DayGroup {
  date: Date;
  events: EnrichedCalendarEvent[];
  key: string;
  label: string;
}

// ---------------------------------------------------------------------------
// Source → colour mapping
// ---------------------------------------------------------------------------

const SOURCE_COLORS: Record<
  string,
  { bg: string; border: string; dot: string; text: string }
> = {
  atl: {
    bg: "bg-card/50 dark:bg-card/30",
    border: "border-border/60 dark:border-border/40",
    dot: "fill-violet-500 dark:fill-violet-400",
    text: "text-violet-700 dark:text-violet-300/80",
  },
  "dev-events-linux": {
    bg: "bg-card/50 dark:bg-card/30",
    border: "border-border/60 dark:border-border/40",
    dot: "fill-rose-500 dark:fill-rose-400",
    text: "text-rose-700 dark:text-rose-300/80",
  },
  "dev-events-oss": {
    bg: "bg-card/50 dark:bg-card/30",
    border: "border-border/60 dark:border-border/40",
    dot: "fill-pink-500 dark:fill-pink-400",
    text: "text-pink-700 dark:text-pink-300/80",
  },
  "fedora-events": {
    bg: "bg-card/50 dark:bg-card/30",
    border: "border-border/60 dark:border-border/40",
    dot: "fill-sky-500 dark:fill-sky-400",
    text: "text-sky-700 dark:text-sky-300/80",
  },
  "gnome-events": {
    bg: "bg-card/50 dark:bg-card/30",
    border: "border-border/60 dark:border-border/40",
    dot: "fill-emerald-500 dark:fill-emerald-400",
    text: "text-emerald-700 dark:text-emerald-300/80",
  },
  "kde-community": {
    bg: "bg-card/50 dark:bg-card/30",
    border: "border-border/60 dark:border-border/40",
    dot: "fill-blue-500 dark:fill-blue-400",
    text: "text-blue-700 dark:text-blue-300/80",
  },
  "lf-events": {
    bg: "bg-card/50 dark:bg-card/30",
    border: "border-border/60 dark:border-border/40",
    dot: "fill-indigo-500 dark:fill-indigo-400",
    text: "text-indigo-700 dark:text-indigo-300/80",
  },
  "nixos-discourse": {
    bg: "bg-card/50 dark:bg-card/30",
    border: "border-border/60 dark:border-border/40",
    dot: "fill-cyan-500 dark:fill-cyan-400",
    text: "text-cyan-700 dark:text-cyan-300/80",
  },
  "opensuse-events": {
    bg: "bg-card/50 dark:bg-card/30",
    border: "border-border/60 dark:border-border/40",
    dot: "fill-green-500 dark:fill-green-400",
    text: "text-green-700 dark:text-green-300/80",
  },
  "ubuntu-discourse": {
    bg: "bg-card/50 dark:bg-card/30",
    border: "border-border/60 dark:border-border/40",
    dot: "fill-orange-500 dark:fill-orange-400",
    text: "text-orange-700 dark:text-orange-300/80",
  },
};

const FALLBACK_COLORS = [
  {
    bg: "bg-card/50 dark:bg-card/30",
    border: "border-border/60 dark:border-border/40",
    dot: "fill-red-500 dark:fill-red-400",
    text: "text-red-700 dark:text-red-300/80",
  },
  {
    bg: "bg-card/50 dark:bg-card/30",
    border: "border-border/60 dark:border-border/40",
    dot: "fill-yellow-500 dark:fill-yellow-400",
    text: "text-yellow-700 dark:text-yellow-300/80",
  },
  {
    bg: "bg-card/50 dark:bg-card/30",
    border: "border-border/60 dark:border-border/40",
    dot: "fill-purple-500 dark:fill-purple-400",
    text: "text-purple-700 dark:text-purple-300/80",
  },
  {
    bg: "bg-card/50 dark:bg-card/30",
    border: "border-border/60 dark:border-border/40",
    dot: "fill-teal-500 dark:fill-teal-400",
    text: "text-teal-700 dark:text-teal-300/80",
  },
];

export function sourceColor(sourceId: string) {
  if (SOURCE_COLORS[sourceId]) {
    return SOURCE_COLORS[sourceId];
  }
  let h = 0;
  for (let i = 0; i < sourceId.length; i += 1) {
    h = Math.trunc(h * 31 + (sourceId.codePointAt(i) ?? 0)) % 0x1_00_00_00_00;
  }
  return FALLBACK_COLORS[Math.abs(h) % FALLBACK_COLORS.length];
}

// Colored badge variants for month view pills
const BADGE_COLORS: Record<
  string,
  { bg: string; border: string; dot: string; text: string }
> = {
  atl: {
    bg: "bg-violet-500/10 dark:bg-violet-400/15",
    border: "border-violet-300/30 dark:border-violet-400/25",
    dot: "fill-violet-500 dark:fill-violet-400",
    text: "text-violet-700 dark:text-violet-300",
  },
  "dev-events-linux": {
    bg: "bg-rose-500/10 dark:bg-rose-400/15",
    border: "border-rose-300/30 dark:border-rose-400/25",
    dot: "fill-rose-500 dark:fill-rose-400",
    text: "text-rose-700 dark:text-rose-300",
  },
  "dev-events-oss": {
    bg: "bg-pink-500/10 dark:bg-pink-400/15",
    border: "border-pink-300/30 dark:border-pink-400/25",
    dot: "fill-pink-500 dark:fill-pink-400",
    text: "text-pink-700 dark:text-pink-300",
  },
  "fedora-events": {
    bg: "bg-sky-500/10 dark:bg-sky-400/15",
    border: "border-sky-300/30 dark:border-sky-400/25",
    dot: "fill-sky-500 dark:fill-sky-400",
    text: "text-sky-700 dark:text-sky-300",
  },
  "gnome-events": {
    bg: "bg-emerald-500/10 dark:bg-emerald-400/15",
    border: "border-emerald-300/30 dark:border-emerald-400/25",
    dot: "fill-emerald-500 dark:fill-emerald-400",
    text: "text-emerald-700 dark:text-emerald-300",
  },
  "kde-community": {
    bg: "bg-blue-500/10 dark:bg-blue-400/15",
    border: "border-blue-300/30 dark:border-blue-400/25",
    dot: "fill-blue-500 dark:fill-blue-400",
    text: "text-blue-700 dark:text-blue-300",
  },
  "lf-events": {
    bg: "bg-indigo-500/10 dark:bg-indigo-400/15",
    border: "border-indigo-300/30 dark:border-indigo-400/25",
    dot: "fill-indigo-500 dark:fill-indigo-400",
    text: "text-indigo-700 dark:text-indigo-300",
  },
  "nixos-discourse": {
    bg: "bg-cyan-500/10 dark:bg-cyan-400/15",
    border: "border-cyan-300/30 dark:border-cyan-400/25",
    dot: "fill-cyan-500 dark:fill-cyan-400",
    text: "text-cyan-700 dark:text-cyan-300",
  },
  "opensuse-events": {
    bg: "bg-green-500/10 dark:bg-green-400/15",
    border: "border-green-300/30 dark:border-green-400/25",
    dot: "fill-green-500 dark:fill-green-400",
    text: "text-green-700 dark:text-green-300",
  },
  "ubuntu-discourse": {
    bg: "bg-orange-500/10 dark:bg-orange-400/15",
    border: "border-orange-300/30 dark:border-orange-400/25",
    dot: "fill-orange-500 dark:fill-orange-400",
    text: "text-orange-700 dark:text-orange-300",
  },
};

const FALLBACK_BADGE_COLORS = [
  {
    bg: "bg-red-500/10 dark:bg-red-400/15",
    border: "border-red-300/30 dark:border-red-400/25",
    dot: "fill-red-500 dark:fill-red-400",
    text: "text-red-700 dark:text-red-300",
  },
  {
    bg: "bg-yellow-500/10 dark:bg-yellow-400/15",
    border: "border-yellow-300/30 dark:border-yellow-400/25",
    dot: "fill-yellow-500 dark:fill-yellow-400",
    text: "text-yellow-700 dark:text-yellow-300",
  },
  {
    bg: "bg-purple-500/10 dark:bg-purple-400/15",
    border: "border-purple-300/30 dark:border-purple-400/25",
    dot: "fill-purple-500 dark:fill-purple-400",
    text: "text-purple-700 dark:text-purple-300",
  },
  {
    bg: "bg-teal-500/10 dark:bg-teal-400/15",
    border: "border-teal-300/30 dark:border-teal-400/25",
    dot: "fill-teal-500 dark:fill-teal-400",
    text: "text-teal-700 dark:text-teal-300",
  },
];

/** Colored variant for month view badges/pills. */
export function sourceBadgeColor(sourceId: string) {
  if (BADGE_COLORS[sourceId]) {
    return BADGE_COLORS[sourceId];
  }
  let h = 0;
  for (let i = 0; i < sourceId.length; i += 1) {
    h = Math.trunc(h * 31 + (sourceId.codePointAt(i) ?? 0)) % 0x1_00_00_00_00;
  }
  return FALLBACK_BADGE_COLORS[Math.abs(h) % FALLBACK_BADGE_COLORS.length];
}

/** Solid hex colour for inline-style bars (month view). */
export function sourceHex(sourceId: string): string {
  const map: Record<string, string> = {
    atl: "#7c3aed",
    "kde-community": "#2563eb",
    "opensuse-events": "#16a34a",
    "ubuntu-discourse": "#ea580c",
  };
  if (map[sourceId]) {
    return map[sourceId];
  }
  let h = 0;
  for (let i = 0; i < sourceId.length; i += 1) {
    h = Math.trunc(h * 31 + (sourceId.codePointAt(i) ?? 0)) % 0x1_00_00_00_00;
  }
  return `hsl(${Math.abs(h) % 360} 62% 46%)`;
}

// ---------------------------------------------------------------------------
// Calendar grid helpers
// ---------------------------------------------------------------------------

export function getCalendarCells(date: Date): CalendarCell[] {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(monthEnd);

  const cells: CalendarCell[] = [];
  let cursor = gridStart;
  while (cursor <= gridEnd) {
    cells.push({
      currentMonth: isSameMonth(cursor, date),
      date: new Date(cursor),
      day: cursor.getDate(),
    });
    cursor = addDays(cursor, 1);
  }
  return cells;
}

export function getWeekDays(date: Date): Date[] {
  const start = startOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

// ---------------------------------------------------------------------------
// Event grouping
// ---------------------------------------------------------------------------

export function eventsByDay(
  events: EnrichedCalendarEvent[]
): Map<string, EnrichedCalendarEvent[]> {
  const m = new Map<string, EnrichedCalendarEvent[]>();
  for (const e of events) {
    if (!e.startsAt) {
      continue;
    }
    const d = parseISO(e.startsAt);
    if (Number.isNaN(d.getTime())) {
      continue;
    }
    const key = format(startOfDay(d), "yyyy-MM-dd");
    const arr = m.get(key);
    if (arr) {
      arr.push(e);
    } else {
      m.set(key, [e]);
    }
  }
  for (const arr of m.values()) {
    arr.sort((a, b) => Date.parse(a.startsAt!) - Date.parse(b.startsAt!));
  }
  return m;
}

export function eventsForDay(
  events: EnrichedCalendarEvent[],
  day: Date
): EnrichedCalendarEvent[] {
  return events
    .filter((e) => {
      if (!e.startsAt) {
        return false;
      }
      const d = parseISO(e.startsAt);
      return !Number.isNaN(d.getTime()) && isSameDay(d, day);
    })
    .toSorted((a, b) => Date.parse(a.startsAt!) - Date.parse(b.startsAt!));
}

export function buildAgendaGroups(
  events: EnrichedCalendarEvent[],
  locale: string
): DayGroup[] {
  const map = new Map<string, DayGroup>();
  for (const e of events) {
    let key: string;
    let label: string;
    let date: Date;
    if (!e.startsAt || Number.isNaN(Date.parse(e.startsAt))) {
      key = "undated";
      label = "Date to be announced";
      date = new Date(8_640_000_000_000_000); // far future for sorting
    } else {
      const d = startOfDay(parseISO(e.startsAt));
      key = format(d, "yyyy-MM-dd");
      label = d.toLocaleDateString(locale, {
        day: "numeric",
        month: "long",
        weekday: "long",
        year: "numeric",
      });
      date = d;
    }
    const g = map.get(key);
    if (g) {
      g.events.push(e);
    } else {
      map.set(key, { date, events: [e], key, label });
    }
  }
  for (const g of map.values()) {
    g.events.sort((a, b) => {
      const ta = a.startsAt ? Date.parse(a.startsAt) : Infinity;
      const tb = b.startsAt ? Date.parse(b.startsAt) : Infinity;
      return ta - tb;
    });
  }
  return [...map.values()].toSorted(
    (a, b) => a.date.getTime() - b.date.getTime()
  );
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

export function formatEventTime(startsAt?: string, endsAt?: string): string {
  if (!startsAt) {
    return "";
  }
  const start = new Date(startsAt);
  if (Number.isNaN(start.getTime())) {
    return "";
  }
  const timeFmt: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
  };
  if (!endsAt) {
    return start.toLocaleTimeString(undefined, timeFmt);
  }
  const end = new Date(endsAt);
  if (Number.isNaN(end.getTime())) {
    return start.toLocaleTimeString(undefined, timeFmt);
  }
  return `${start.toLocaleTimeString(undefined, timeFmt)} – ${end.toLocaleTimeString(undefined, timeFmt)}`;
}

export function formatEventRange(startsAt?: string, endsAt?: string): string {
  if (!startsAt) {
    return "";
  }
  const start = new Date(startsAt);
  if (Number.isNaN(start.getTime())) {
    return "";
  }
  const opts: Intl.DateTimeFormatOptions = {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  };
  if (!endsAt) {
    return start.toLocaleString(undefined, opts);
  }
  const end = new Date(endsAt);
  if (Number.isNaN(end.getTime())) {
    return start.toLocaleString(undefined, opts);
  }
  return `${start.toLocaleString(undefined, opts)} – ${end.toLocaleString(undefined, { hour: "numeric", minute: "2-digit" })}`;
}
