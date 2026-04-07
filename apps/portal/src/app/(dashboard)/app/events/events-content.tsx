"use client";

import {
  addDays,
  addMonths,
  endOfMonth,
  format,
  parseISO,
  startOfDay,
  startOfMonth,
  subMonths,
} from "date-fns";
import { useLocale } from "next-intl";
import { useMemo, useState } from "react";

import { getEnabledEventSources } from "@/config/events";
import type { EnrichedCalendarEvent } from "@/config/events";
import { cn } from "@atl/ui/lib/utils";

import { AgendaView } from "./components/agenda-view";
import { CalendarHeader } from "./components/calendar-header";
import { DayDetailSidebar } from "./components/day-detail-sidebar";
import { MonthView } from "./components/month-view";
import type { CalendarViewMode, ListRangePreset } from "./components/types";

const DEFAULT_LIST_RANGE: ListRangePreset = "forward-90d";

interface EventsContentProps {
  events: EnrichedCalendarEvent[];
}

export function EventsContent({ events }: EventsContentProps) {
  const intlLocale = useLocale();
  const sourcePills = getEnabledEventSources();

  // ── State ──────────────────────────────────────────────────────────────
  const [visibleMonth, setVisibleMonth] = useState(() =>
    startOfMonth(new Date())
  );
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(
    () => new Date()
  );
  const [viewMode, setViewMode] = useState<CalendarViewMode>("month");
  const [search, setSearch] = useState("");
  const [selectedEventId, setSelectedEventId] = useState<string | undefined>();
  const [selectedSourceIds, setSelectedSourceIds] = useState<Set<string>>(
    () => new Set()
  );
  const [categoryDenyList, setCategoryDenyList] = useState<Set<string>>(
    () => new Set()
  );
  const [listRangePreset, setListRangePreset] =
    useState<ListRangePreset>(DEFAULT_LIST_RANGE);

  // ── Derived ────────────────────────────────────────────────────────────
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

  /** Events scoped for the agenda view based on range preset. */
  const agendaEvents = useMemo(() => {
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
        return !Number.isNaN(d.getTime()) && d >= start && d <= end;
      });
      const undated = filteredBase.filter(
        (e) => !e.startsAt || Number.isNaN(Date.parse(e.startsAt))
      );
      return [...dated, ...undated];
    }
    // forward-90d
    const start = startOfDay(now);
    const limit = addDays(start, 90);
    return filteredBase.filter((e) => {
      if (!e.startsAt || Number.isNaN(Date.parse(e.startsAt))) {
        return true;
      }
      const d = parseISO(e.startsAt);
      return d >= start && d <= limit;
    });
  }, [filteredBase, listRangePreset, visibleMonth]);

  // ── Handlers ───────────────────────────────────────────────────────────
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

  function handleNavigateToEvent(startsAt: string) {
    const d = parseISO(startsAt);
    if (Number.isNaN(d.getTime())) {
      return;
    }
    setSelectedDay(d);
    setVisibleMonth(startOfMonth(d));
  }

  function handleSelectDay(d: Date) {
    setSelectedDay(d);
  }

  function handleViewChange(v: CalendarViewMode) {
    setViewMode(v);
  }

  const hasActiveFilters =
    !!search.trim() ||
    selectedSourceIds.size > 0 ||
    categoryDenyList.size > 0 ||
    listRangePreset !== DEFAULT_LIST_RANGE;

  const monthTitle = format(visibleMonth, "MMMM yyyy");

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <div
        className={cn(
          "border-border/60 bg-card dark:border-border/40",
          "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border shadow-xs"
        )}
      >
        <CalendarHeader
          allCategories={allCategories}
          categoryDenyList={categoryDenyList}
          hasActiveFilters={hasActiveFilters}
          listRangePreset={listRangePreset}
          monthTitle={monthTitle}
          onClearFilters={clearFilters}
          onGoToday={goToday}
          onNextMonth={() => setVisibleMonth((m) => addMonths(m, 1))}
          onPrevMonth={() => setVisibleMonth((m) => subMonths(m, 1))}
          onSearchChange={setSearch}
          onSetListRange={setListRangePreset}
          onToggleCategoryDeny={toggleCategoryDeny}
          onToggleSource={toggleSource}
          onViewChange={handleViewChange}
          search={search}
          selectedSourceIds={selectedSourceIds}
          sourcePills={sourcePills}
          viewMode={viewMode}
        />

        <div
          className={cn(
            "grid min-h-0 min-w-0 flex-1 gap-0 overflow-hidden",
            "grid-cols-1 grid-rows-[minmax(0,1fr)_auto]",
            "lg:grid-cols-[minmax(0,1fr)_22rem] lg:grid-rows-[minmax(0,1fr)]"
          )}
        >
          {/* Main content area */}
          <div
            className={cn(
              "min-h-0 min-w-0",
              viewMode === "month" ? "flex flex-col" : "overflow-y-auto"
            )}
          >
            {viewMode === "month" && (
              <MonthView
                events={filteredBase}
                onSelectDay={handleSelectDay}
                selectedDay={selectedDay}
                visibleMonth={visibleMonth}
              />
            )}
            {viewMode === "agenda" && (
              <AgendaView
                events={agendaEvents}
                locale={intlLocale}
                onSelectEvent={(e) => {
                  setSelectedEventId(e.id);
                  if (e.startsAt) {
                    handleNavigateToEvent(e.startsAt);
                  }
                }}
                selectedEventId={selectedEventId}
              />
            )}
          </div>

          {/* Sidebar */}
          <DayDetailSidebar
            events={filteredBase}
            locale={intlLocale}
            onNavigateToEvent={handleNavigateToEvent}
            selectedDay={selectedDay}
          />
        </div>
      </div>
    </div>
  );
}
