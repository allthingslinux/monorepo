"use client";

import {
  addDays,
  addMonths,
  endOfMonth,
  format,
  isSameDay,
  parseISO,
  startOfDay,
  startOfMonth,
  subMonths,
} from "date-fns";
import type { Locale } from "date-fns/locale";
import { de, enUS, es, fr, pt, zhCN } from "date-fns/locale";
import {
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Filter,
  Link2,
  List,
  MapPin,
  Search,
  X,
} from "lucide-react";
import { useLocale } from "next-intl";
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import type { ComponentProps, ReactNode } from "react";
import type { DayButton, DayButtonProps, DayProps } from "react-day-picker";

import { getEnabledEventSources } from "@/config/events";
import type { EnrichedCalendarEvent, EventSource } from "@/config/events";
import { Badge } from "@atl/ui/components/badge";
import { Button } from "@atl/ui/components/button";
import { Calendar } from "@atl/ui/components/calendar";
import { Checkbox } from "@atl/ui/components/checkbox";
import { Input } from "@atl/ui/components/input";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@atl/ui/components/popover";
import { Separator } from "@atl/ui/components/separator";
import { Tabs, TabsList, TabsTrigger } from "@atl/ui/components/tabs";
import { cn } from "@atl/ui/lib/utils";

const DATE_FNS_LOCALES: Record<string, Locale> = {
  de,
  en: enUS,
  es,
  fr,
  pt,
  zh: zhCN,
};

type EventsViewMode = "month" | "list";
type ListRangePreset = "visible-month" | "forward-90d" | "all";

const LIST_PAGE_SIZE = 24;
const SIDEBAR_UPCOMING_LIMIT = 8;

function sourceTransportLabel(
  src: Pick<
    EventSource,
    "kind" | "calendarUrl" | "feedUrl" | "discourseEventsUrl"
  >
): string | null {
  if (src.kind === "discourse") {
    return "Discourse";
  }
  if (src.kind === "rss") {
    return "RSS";
  }
  if (src.kind === "ics") {
    if (src.calendarUrl && src.feedUrl) {
      return "ICS+RSS";
    }
    if (src.calendarUrl) {
      return "ICS";
    }
    if (src.feedUrl) {
      return "RSS";
    }
  }
  return null;
}

interface EventsContentProps {
  events: EnrichedCalendarEvent[];
}

const eventMetaChipClassName =
  "rounded-md border border-border/50 px-2 py-0.5 text-muted-foreground text-xs dark:border-border/40";

function formatEventRange(
  startsAt: string | undefined,
  endsAt?: string
): string {
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
  return `${start.toLocaleString(undefined, opts)} – ${end.toLocaleString(
    undefined,
    {
      hour: "numeric",
      minute: "2-digit",
    }
  )}`;
}

function eventMetaBlock(event: EnrichedCalendarEvent) {
  const when = formatEventRange(event.startsAt, event.endsAt);
  const locationTrimmed = event.location.trim();
  const showLocation = Boolean(locationTrimmed) && locationTrimmed !== "—";
  const locationIsUrl = /^https?:\/\//iu.test(locationTrimmed);
  const LocationIcon = locationIsUrl ? Link2 : MapPin;

  let whenNode: ReactNode = null;
  if (when) {
    whenNode = (
      <p className="text-muted-foreground/75 text-[11px] leading-snug tabular-nums">
        {when}
      </p>
    );
  } else if (!event.startsAt) {
    whenNode = (
      <p className="text-muted-foreground/75 text-[11px] leading-snug">
        Date to be announced
      </p>
    );
  }

  const locationNode = showLocation ? (
    <div className="text-muted-foreground/75 flex gap-1.5 text-[11px] leading-snug">
      <span className="flex h-lh shrink-0 items-center justify-center self-start">
        <LocationIcon aria-hidden className="size-3 opacity-70" />
      </span>
      <span className="min-w-0 flex-1 wrap-break-word" title={locationTrimmed}>
        {locationTrimmed}
      </span>
    </div>
  ) : null;

  if (!whenNode && !locationNode) {
    return null;
  }

  return (
    <div className="space-y-1">
      {whenNode}
      {locationNode}
    </div>
  );
}

function EventCard({
  event,
  density = "default",
}: {
  event: EnrichedCalendarEvent;
  density?: "default" | "compact";
}) {
  const categoryTrimmed = event.category.trim();
  const sourceNameTrimmed = event.source.name.trim();
  const showCategoryChip =
    Boolean(categoryTrimmed) && categoryTrimmed !== sourceNameTrimmed;

  const showFooter = showCategoryChip || event.url;
  const isCompact = density === "compact";

  return (
    <div
      className={cn(
        "border-border/60 bg-card/50 dark:border-border/40 dark:bg-card/30 flex flex-col rounded-lg border",
        isCompact ? "gap-2 p-3" : "gap-3 p-4",
        showFooter && "h-full min-h-0",
        event.featured &&
          "border-primary/40 bg-primary/5 dark:border-primary/30"
      )}
    >
      <div className="flex shrink-0 flex-wrap items-start justify-between gap-2 gap-x-3">
        <div className="min-w-0 flex-1 space-y-1">
          <p
            className={cn(
              "text-foreground leading-snug font-semibold tracking-tight wrap-break-word",
              isCompact ? "text-[13px]" : "text-sm"
            )}
          >
            {event.title}
          </p>
          {eventMetaBlock(event)}
        </div>
        <Badge className="shrink-0 font-normal" variant="outline">
          {event.source.name}
        </Badge>
      </div>

      {showFooter ? (
        <>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2">
            {event.description.trim() ? (
              <p
                className={cn(
                  "text-muted-foreground shrink-0 leading-snug",
                  isCompact ? "line-clamp-2 text-xs" : "line-clamp-3 text-sm"
                )}
                title={event.description}
              >
                {event.description}
              </p>
            ) : null}
            <div aria-hidden className="min-h-0 flex-1" />
          </div>
          <div className="border-border/50 dark:border-border/40 flex shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t pt-2">
            <div className="flex min-w-0 flex-1 flex-wrap gap-2">
              {showCategoryChip ? (
                <span className={eventMetaChipClassName}>{event.category}</span>
              ) : null}
            </div>
            {event.url ? (
              <a
                className="text-muted-foreground hover:text-primary inline-flex shrink-0 items-center gap-1 text-sm transition-colors"
                href={event.url}
                rel="noopener noreferrer"
                target="_blank"
              >
                Details
                <ArrowUpRight className="size-3.5 opacity-80" />
              </a>
            ) : null}
          </div>
        </>
      ) : (
        event.description.trim() && (
          <p
            className={cn(
              "text-muted-foreground min-w-0 leading-snug",
              isCompact ? "line-clamp-2 text-xs" : "line-clamp-3 text-sm"
            )}
            title={event.description}
          >
            {event.description}
          </p>
        )
      )}
    </div>
  );
}

function sortEventsByStart(a: EnrichedCalendarEvent, b: EnrichedCalendarEvent) {
  const ta = a.startsAt ? Date.parse(a.startsAt) : Number.POSITIVE_INFINITY;
  const tb = b.startsAt ? Date.parse(b.startsAt) : Number.POSITIVE_INFINITY;
  if (Number.isNaN(ta) && Number.isNaN(tb)) {
    return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
  }
  if (Number.isNaN(ta)) {
    return 1;
  }
  if (Number.isNaN(tb)) {
    return -1;
  }
  return ta - tb;
}

interface ListDayGroup {
  items: EnrichedCalendarEvent[];
  key: string;
  label: string;
  sortKey: number;
}

function buildListDayGroups(
  list: EnrichedCalendarEvent[],
  intlLocale: string
): ListDayGroup[] {
  const map = new Map<string, ListDayGroup>();
  for (const e of list) {
    let key: string;
    let label: string;
    let sortKey: number;
    if (!e.startsAt || Number.isNaN(Date.parse(e.startsAt))) {
      key = "undated";
      label = "Date to be announced";
      sortKey = Number.MAX_SAFE_INTEGER - 1;
    } else {
      const d = startOfDay(parseISO(e.startsAt));
      key = format(d, "yyyy-MM-dd");
      label = d.toLocaleDateString(intlLocale, {
        day: "numeric",
        month: "long",
        weekday: "long",
        year: "numeric",
      });
      sortKey = d.getTime();
    }
    const g = map.get(key);
    if (g) {
      g.items.push(e);
    } else {
      map.set(key, { items: [e], key, label, sortKey });
    }
  }
  for (const g of map.values()) {
    g.items.sort(sortEventsByStart);
  }
  return [...map.values()].toSorted((a, b) => a.sortKey - b.sortKey);
}

const DEFAULT_LIST_RANGE: ListRangePreset = "forward-90d";

/** Max event rows per cell (taller rows + titles need vertical space). */
const MAX_EVENT_BARS_PER_DAY = 4;

/** Minimum day cell height so month rows don’t collapse when flex height is indefinite. */
const DAY_CELL_MIN_H = "min-h-[6.75rem] sm:min-h-[7.25rem]";

function eventBarColor(e: EnrichedCalendarEvent): string {
  const c = e.source.color?.trim();
  if (c && /^#[\dA-Fa-f]{3,8}$/u.test(c)) {
    return c;
  }
  if (c && /^hsl\s*\(/iu.test(c)) {
    return c;
  }
  let h = 0;
  for (let i = 0; i < e.sourceId.length; i += 1) {
    h = Math.trunc(h * 31 + (e.sourceId.codePointAt(i) ?? 0)) % 0x1_00_00_00_00;
  }
  return `hsl(${h % 360} 62% 46%)`;
}

function buildEventsByDay(
  list: EnrichedCalendarEvent[]
): Map<string, EnrichedCalendarEvent[]> {
  const m = new Map<string, EnrichedCalendarEvent[]>();
  for (const e of list) {
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

/**
 * Plain label for the day-of-month — not a control. Selection and clicks use the cell only.
 * Keeps ref/tabIndex contract for react-day-picker focus without receiving pointer events.
 */
const EventsDayLabel = forwardRef<HTMLSpanElement, DayButtonProps>(
  function EventsDayLabel({ children, className, onKeyDown, ..._rest }, ref) {
    return (
      <span
        className={cn(
          "pointer-events-none select-none",
          "inline-flex min-h-0 min-w-0 shrink-0 items-center rounded px-1 py-px",
          "text-foreground text-[0.65rem] leading-tight font-medium tabular-nums",
          "bg-transparent",
          className
        )}
        onKeyDown={onKeyDown}
        ref={ref}
        role="presentation"
        tabIndex={-1}
      >
        {children}
      </span>
    );
  }
) as typeof DayButton;

function createCalendarDayCell(
  eventsByDay: Map<string, EnrichedCalendarEvent[]>,
  selectDay: (d: Date) => void
) {
  return function CalendarDayCell(props: DayProps) {
    const { children, className, day, modifiers, style, ...rest } = props;
    const key = format(startOfDay(day.date), "yyyy-MM-dd");
    const list = eventsByDay.get(key) ?? [];
    const shown = list.slice(0, MAX_EVENT_BARS_PER_DAY);
    const overflow = list.length - shown.length;
    const isSelected = Boolean(modifiers?.selected);

    function handleCellPick() {
      if (modifiers.disabled) {
        return;
      }
      selectDay(startOfDay(day.date));
    }

    return (
      <td
        className={cn(
          className,
          "box-border border-0 p-0 align-top",
          "overflow-hidden",
          DAY_CELL_MIN_H
        )}
        style={style}
        {...(rest as ComponentProps<"td">)}
      >
        <button
          className={cn(
            "flex h-full min-h-0 w-full cursor-pointer flex-col gap-1 p-1",
            DAY_CELL_MIN_H,
            isSelected && "bg-primary/10 dark:bg-primary/15 rounded-[4px]"
          )}
          onClick={handleCellPick}
          type="button"
        >
          <div className="flex w-full shrink-0 justify-start">{children}</div>
          {shown.length > 0 ? (
            <ul className="flex min-h-0 w-full min-w-0 flex-1 list-none flex-col gap-0.5 overflow-y-auto overscroll-contain pb-0.5">
              {shown.map((e) => (
                <li className="min-w-0" key={e.id}>
                  <div
                    className="flex min-h-[1.45rem] w-full min-w-0 items-center rounded-sm px-1.5 py-1 shadow-sm"
                    style={{
                      backgroundColor: eventBarColor(e),
                      color: "#fff",
                      textShadow: "0 1px 2px rgb(0 0 0 / 55%)",
                    }}
                    title={`${e.title} · ${e.source.name}`}
                  >
                    <span className="min-w-0 truncate text-[0.65rem] leading-tight font-medium tracking-tight">
                      {e.title}
                    </span>
                  </div>
                </li>
              ))}
              {overflow > 0 ? (
                <li className="text-muted-foreground text-center text-[0.55rem] leading-none tabular-nums">
                  +{overflow} more
                </li>
              ) : null}
            </ul>
          ) : null}
        </button>
      </td>
    );
  };
}

export function EventsContent({ events }: EventsContentProps) {
  const intlLocale = useLocale();
  const dateLocale = DATE_FNS_LOCALES[intlLocale] ?? enUS;
  const sourcePills = getEnabledEventSources();

  const [visibleMonth, setVisibleMonth] = useState(() =>
    startOfMonth(new Date())
  );
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(
    () => new Date()
  );
  const [viewMode, setViewMode] = useState<EventsViewMode>("month");
  const [search, setSearch] = useState("");
  const [selectedSourceIds, setSelectedSourceIds] = useState<Set<string>>(
    () => new Set()
  );
  const [categoryDenyList, setCategoryDenyList] = useState<Set<string>>(
    () => new Set()
  );
  const [listRangePreset, setListRangePreset] =
    useState<ListRangePreset>(DEFAULT_LIST_RANGE);

  const allCategories = useMemo(() => {
    const s = new Set<string>();
    for (const e of events) {
      s.add(e.category);
    }
    return [...s].toSorted((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" })
    );
  }, [events]);

  const filteredBase = useMemo(() => {
    let list = events;
    if (selectedSourceIds.size > 0) {
      list = list.filter((e) => selectedSourceIds.has(e.sourceId));
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q) ||
          e.source.name.toLowerCase().includes(q)
      );
    }
    if (categoryDenyList.size > 0) {
      list = list.filter((e) => !categoryDenyList.has(e.category));
    }
    return list;
  }, [events, search, selectedSourceIds, categoryDenyList]);

  const listViewEvents = useMemo(() => {
    if (viewMode !== "list") {
      return filteredBase;
    }
    if (listRangePreset === "all") {
      return filteredBase;
    }
    const now = new Date();
    if (listRangePreset === "visible-month") {
      const start = startOfMonth(visibleMonth);
      const end = endOfMonth(visibleMonth);
      const dated = filteredBase.filter((e) => {
        if (!e.startsAt) {
          return false;
        }
        const d = parseISO(e.startsAt);
        if (Number.isNaN(d.getTime())) {
          return false;
        }
        return d >= start && d <= end;
      });
      const undated = filteredBase.filter(
        (e) => !e.startsAt || Number.isNaN(Date.parse(e.startsAt))
      );
      return [...dated, ...undated];
    }
    const start = startOfDay(now);
    const limit = addDays(start, 90);
    return filteredBase.filter((e) => {
      if (!e.startsAt || Number.isNaN(Date.parse(e.startsAt))) {
        return true;
      }
      const d = parseISO(e.startsAt);
      return d >= start && d <= limit;
    });
  }, [filteredBase, viewMode, listRangePreset, visibleMonth]);

  const listDayGroups = useMemo(
    () => buildListDayGroups(listViewEvents, intlLocale),
    [listViewEvents, intlLocale]
  );

  const flatListForScroll = useMemo(() => {
    const out: EnrichedCalendarEvent[] = [];
    for (const g of listDayGroups) {
      for (const e of g.items) {
        out.push(e);
      }
    }
    return out;
  }, [listDayGroups]);

  const [listVisibleCount, setListVisibleCount] = useState(LIST_PAGE_SIZE);
  const listSourcesKey = useMemo(
    () =>
      [
        search,
        [...selectedSourceIds].toSorted().join(","),
        [...categoryDenyList].toSorted().join(","),
        listRangePreset,
        viewMode,
      ].join("|"),
    [search, selectedSourceIds, categoryDenyList, listRangePreset, viewMode]
  );

  useEffect(() => {
    setListVisibleCount(LIST_PAGE_SIZE);
  }, [listSourcesKey]);

  const visibleListKeys = useMemo(() => {
    const keys = new Set<string>();
    let n = 0;
    for (const g of listDayGroups) {
      for (const e of g.items) {
        keys.add(e.id);
        n += 1;
        if (n >= listVisibleCount) {
          return keys;
        }
      }
    }
    return keys;
  }, [listDayGroups, listVisibleCount]);

  const listLoadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewMode !== "list") {
      return;
    }
    const el = listLoadMoreRef.current;
    if (!el || listVisibleCount >= flatListForScroll.length) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((e) => e.isIntersecting);
        if (hit) {
          setListVisibleCount((c) =>
            Math.min(c + LIST_PAGE_SIZE, flatListForScroll.length)
          );
        }
      },
      { root: null, rootMargin: "240px", threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [viewMode, flatListForScroll.length, listVisibleCount]);

  const eventsByDay = useMemo(
    () => buildEventsByDay(filteredBase),
    [filteredBase]
  );

  const CalendarDayCell = useMemo(
    () => createCalendarDayCell(eventsByDay, setSelectedDay),
    [eventsByDay]
  );

  const eventsOnSelectedDay = useMemo(() => {
    if (!selectedDay) {
      return [];
    }
    return filteredBase
      .filter((e) => {
        if (!e.startsAt) {
          return false;
        }
        const d = parseISO(e.startsAt);
        return !Number.isNaN(d.getTime()) && isSameDay(d, selectedDay);
      })
      .toSorted(sortEventsByStart);
  }, [filteredBase, selectedDay]);

  const upcomingSidebar = useMemo(() => {
    const now = Date.now();
    const dated = filteredBase.filter(
      (e) => e.startsAt && !Number.isNaN(Date.parse(e.startsAt))
    );
    const undated = filteredBase.filter(
      (e) => !e.startsAt || Number.isNaN(Date.parse(e.startsAt))
    );
    const upcoming = dated
      .filter((e) => Date.parse(e.startsAt!) >= now)
      .toSorted(sortEventsByStart);
    return [...upcoming, ...undated].slice(0, SIDEBAR_UPCOMING_LIMIT);
  }, [filteredBase]);

  function goToday() {
    const t = new Date();
    setVisibleMonth(startOfMonth(t));
    setSelectedDay(t);
  }

  function toggleSource(id: string) {
    setSelectedSourceIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleCategoryDeny(cat: string) {
    setCategoryDenyList((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  }

  function clearFilters() {
    setSearch("");
    setSelectedSourceIds(new Set());
    setCategoryDenyList(new Set());
    setListRangePreset(DEFAULT_LIST_RANGE);
  }

  const hasActiveFilters =
    !!search.trim() ||
    selectedSourceIds.size > 0 ||
    categoryDenyList.size > 0 ||
    listRangePreset !== DEFAULT_LIST_RANGE;

  const monthTitle = format(visibleMonth, "MMMM yyyy");

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div
        className={cn(
          "border-border/60 bg-card dark:border-border/40 flex min-h-[min(520px,calc(100vh-11rem))] min-w-0 flex-1 flex-col overflow-hidden rounded-xl border shadow-xs"
        )}
      >
        {/* Unified toolbar (Google Calendar–style chrome) */}
        <div className="border-border/60 bg-muted/20 dark:border-border/40 dark:bg-muted/10 shrink-0 border-b">
          <div className="flex flex-wrap items-center gap-2 px-3 py-2 sm:px-4">
            <Button
              className="h-8 shrink-0 text-xs"
              onClick={goToday}
              size="sm"
              type="button"
              variant="outline"
            >
              Today
            </Button>
            <div className="flex items-center gap-0.5">
              <Button
                aria-label="Previous month"
                className="size-8"
                onClick={() => setVisibleMonth((m) => subMonths(m, 1))}
                size="icon-sm"
                type="button"
                variant="ghost"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                aria-label="Next month"
                className="size-8"
                onClick={() => setVisibleMonth((m) => addMonths(m, 1))}
                size="icon-sm"
                type="button"
                variant="ghost"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
            <p className="min-w-32 flex-1 text-center text-sm font-medium sm:min-w-0">
              {monthTitle}
            </p>
            <Tabs
              className="ml-auto w-full min-[480px]:w-auto"
              onValueChange={(v) => {
                if (v === "month" || v === "list") {
                  setViewMode(v);
                }
              }}
              value={viewMode}
            >
              <TabsList className="h-8 w-full min-[480px]:w-auto">
                <TabsTrigger className="gap-1.5 text-xs" value="month">
                  <CalendarDays className="size-3.5" />
                  Month
                </TabsTrigger>
                <TabsTrigger className="gap-1.5 text-xs" value="list">
                  <List className="size-3.5" />
                  List
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="border-border/60 dark:border-border/40 relative border-t">
            <Search className="text-muted-foreground absolute top-1/2 left-4 size-4 -translate-y-1/2" />
            <Input
              className="h-10 rounded-none border-0 bg-transparent pl-10 shadow-none focus-visible:ring-0"
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, description, category, location, source…"
              value={search}
            />
          </div>

          <div className="border-border/60 dark:border-border/40 flex flex-wrap items-center gap-1.5 border-t px-3 py-2 sm:px-4">
            <span className="text-muted-foreground mr-0.5 text-xs font-medium tracking-wider uppercase">
              Sources
            </span>
            {sourcePills.map((src) => {
              const transport = sourceTransportLabel(src);
              return (
                <button
                  className={cn(
                    "rounded-md border px-2 py-1 text-xs font-medium transition-colors",
                    selectedSourceIds.has(src.id)
                      ? "border-primary bg-primary/10 text-primary dark:bg-primary/20"
                      : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground dark:border-border/40"
                  )}
                  key={src.id}
                  onClick={() => toggleSource(src.id)}
                  type="button"
                >
                  {src.name}
                  {transport ? (
                    <span className="ml-1 text-[0.65rem] opacity-70">
                      {transport}
                    </span>
                  ) : null}
                </button>
              );
            })}

            <Popover>
              <PopoverTrigger
                render={
                  <Button
                    className="ml-1 h-7 gap-1 text-xs"
                    size="sm"
                    type="button"
                    variant="outline"
                  />
                }
              >
                <Filter className="size-3.5" />
                Filters
                {(categoryDenyList.size > 0 ||
                  listRangePreset !== DEFAULT_LIST_RANGE) && (
                  <span className="bg-primary/15 text-primary rounded-full px-1.5 py-px text-[0.65rem]">
                    {categoryDenyList.size +
                      (listRangePreset === DEFAULT_LIST_RANGE ? 0 : 1)}
                  </span>
                )}
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80">
                <PopoverHeader>
                  <PopoverTitle>Filters</PopoverTitle>
                </PopoverHeader>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <p className="text-muted-foreground text-xs font-medium">
                      List view range
                    </p>
                    <select
                      className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 h-9 w-full rounded-md border px-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                      onChange={(e) =>
                        setListRangePreset(e.target.value as ListRangePreset)
                      }
                      value={listRangePreset}
                    >
                      <option value="forward-90d">Next 90 days</option>
                      <option value="visible-month">
                        Calendar month ({monthTitle})
                      </option>
                      <option value="all">All (may be long)</option>
                    </select>
                  </div>
                  {allCategories.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-muted-foreground text-xs font-medium">
                        Categories
                      </p>
                      <div className="max-h-40 space-y-2 overflow-y-auto pr-1">
                        {allCategories.map((cat) => (
                          <label
                            className="flex cursor-pointer items-center gap-2 text-sm"
                            key={cat}
                          >
                            <Checkbox
                              checked={!categoryDenyList.has(cat)}
                              onCheckedChange={() => toggleCategoryDeny(cat)}
                            />
                            <span className="truncate">{cat}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </PopoverContent>
            </Popover>

            {hasActiveFilters ? (
              <button
                className="text-muted-foreground hover:text-foreground ml-auto flex items-center gap-1 rounded-md px-2 py-1 text-xs"
                onClick={clearFilters}
                type="button"
              >
                <X className="size-3" />
                Clear
              </button>
            ) : null}
          </div>
        </div>

        {/* Grid + minmax(0,1fr): flex-1 often leaves a dead band next to the sidebar when the table has wide min-content */}
        <div
          className={cn(
            "grid min-h-0 min-w-0 flex-1 gap-0",
            "grid-cols-1 grid-rows-[minmax(0,1fr)_auto]",
            "lg:grid-cols-[minmax(0,1fr)_22rem] lg:grid-rows-1"
          )}
        >
          <div className="relative isolate min-h-0 min-w-0 overflow-x-hidden overflow-y-auto lg:h-full lg:min-h-0">
            {viewMode === "month" ? (
              <div className="flex min-h-[min(520px,55vh)] w-full min-w-0 flex-col lg:min-h-[min(560px,65vh)]">
                <Calendar
                  className={cn(
                    "w-full! max-w-full min-w-0 shrink-0 grow self-stretch p-0!",
                    "[--cell-size:clamp(2.25rem,calc(100%/7),4.5rem)]",
                    "[&_.rdp-months]:w-full [&_.rdp-months]:max-w-none!",
                    "[&_.rdp-month]:w-full! [&_.rdp-month]:min-w-0",
                    "[&_table]:w-full [&_table]:min-w-0 [&_table]:table-fixed",
                    "[&_table]:max-w-full"
                  )}
                  components={{
                    Day: CalendarDayCell,
                    DayButton: EventsDayLabel,
                  }}
                  classNames={{
                    day: cn(
                      "rdp-day group/day relative flex h-auto min-h-0 w-full min-w-0 flex-1 basis-0 flex-col rounded-none p-0 text-left select-none"
                    ),
                    month:
                      "flex w-full min-w-0 flex-col gap-4 rdp-month [&:last-child]:mb-0",
                    month_caption: "hidden",
                    months:
                      "relative flex w-full max-w-none min-w-0 flex-col gap-4 md:flex-row rdp-months",
                    nav: "hidden",
                    root: "rdp-root flex w-full! min-w-0 max-w-full flex-col self-stretch",
                    week: "mt-2 flex w-full min-h-0 min-w-0 items-stretch rdp-week",
                    weekday:
                      "rdp-weekday box-border min-h-(--cell-size) min-w-0 flex-1 basis-0 py-2 text-center font-normal text-[0.8rem] text-muted-foreground select-none",
                    weekdays: "flex w-full min-w-0 rdp-weekdays",
                  }}
                  locale={dateLocale}
                  mode="single"
                  month={visibleMonth}
                  onMonthChange={setVisibleMonth}
                  onSelect={setSelectedDay}
                  selected={selectedDay}
                  showOutsideDays
                />
              </div>
            ) : (
              <div className="min-h-[min(400px,50vh)] space-y-0 p-3 sm:p-4">
                {listDayGroups.length === 0 ? (
                  <p className="border-border/60 text-muted-foreground dark:border-border/40 rounded-lg border border-dashed px-4 py-12 text-center text-sm">
                    No events match this view and filters.
                  </p>
                ) : (
                  <div className="space-y-6">
                    {listDayGroups.map((group) => {
                      const visibleInGroup = group.items.filter((e) =>
                        visibleListKeys.has(e.id)
                      );
                      if (visibleInGroup.length === 0) {
                        return null;
                      }
                      return (
                        <section className="space-y-2" key={group.key}>
                          <h3 className="border-border/40 bg-card/95 text-muted-foreground dark:bg-card/90 sticky top-0 z-10 border-b py-1 text-xs font-medium backdrop-blur-sm">
                            {group.label}
                          </h3>
                          <div className="space-y-2">
                            {visibleInGroup.map((e) => (
                              <EventCard
                                density="compact"
                                event={e}
                                key={e.id}
                              />
                            ))}
                          </div>
                        </section>
                      );
                    })}
                    {listVisibleCount < flatListForScroll.length ? (
                      <div
                        aria-hidden
                        className="h-4 w-full shrink-0"
                        ref={listLoadMoreRef}
                      />
                    ) : null}
                  </div>
                )}
              </div>
            )}
          </div>

          <aside
            className={cn(
              "border-border/60 bg-muted/10 dark:border-border/40 flex w-full min-w-0 flex-col self-start border-t",
              "max-h-[min(42vh,22rem)] overflow-y-auto lg:max-h-[min(85vh,calc(100vh-10rem))]",
              "min-w-0 overflow-x-hidden lg:w-full lg:max-w-full lg:border-t-0 lg:border-l"
            )}
          >
            <div className="border-border/60 dark:border-border/40 min-w-0 shrink-0 border-b px-3 py-2">
              <p className="text-foreground text-sm font-medium">
                {selectedDay
                  ? selectedDay.toLocaleDateString(intlLocale, {
                      day: "numeric",
                      month: "long",
                      weekday: "long",
                      year: "numeric",
                    })
                  : "Pick a day"}
              </p>
              <p className="text-muted-foreground text-xs">
                {eventsOnSelectedDay.length}{" "}
                {eventsOnSelectedDay.length === 1 ? "event" : "events"}
              </p>
            </div>
            <div className="min-w-0 space-y-3 p-3">
              {eventsOnSelectedDay.length > 0 ? (
                eventsOnSelectedDay.map((e) => (
                  <EventCard density="compact" event={e} key={e.id} />
                ))
              ) : (
                <p className="text-muted-foreground text-xs">
                  No events on this day for the current filters.
                </p>
              )}
              <Separator className="my-2" />
              <div className="space-y-2">
                <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  Upcoming
                </p>
                {upcomingSidebar.length > 0 ? (
                  <ul className="space-y-2">
                    {upcomingSidebar.map((e) => (
                      <li key={`side-${e.id}`}>
                        <button
                          className="hover:border-border/60 hover:bg-muted/40 dark:hover:border-border/40 w-full rounded-md border border-transparent px-1 py-1 text-left transition-colors"
                          onClick={() => {
                            if (e.startsAt) {
                              const d = parseISO(e.startsAt);
                              if (!Number.isNaN(d.getTime())) {
                                setSelectedDay(d);
                                setVisibleMonth(startOfMonth(d));
                              }
                            }
                          }}
                          type="button"
                        >
                          <p className="text-foreground text-xs leading-snug font-medium">
                            {e.title}
                          </p>
                          <p className="text-muted-foreground text-[0.65rem]">
                            {formatEventRange(e.startsAt, e.endsAt) ||
                              "Date TBA"}{" "}
                            · {e.source.name}
                          </p>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-xs">
                    No upcoming items.
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
