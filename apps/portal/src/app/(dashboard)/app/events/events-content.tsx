"use client";

import {
  addDays,
  addMonths,
  format,
  parseISO,
  startOfDay,
  startOfMonth,
  subMonths,
} from "date-fns";
import { useLocale } from "next-intl";
import { useMemo, useState } from "react";

import { useEventsLiveQuery } from "@/features/events/hooks/use-events-live-query";
import { getEnabledEventSources } from "@atl/config/events";
import type { EnrichedCalendarEvent } from "@atl/config/events";
import { cn } from "@atl/ui/lib/utils";

import { AgendaView } from "./components/agenda-view";
import { CalendarHeader } from "./components/calendar-header";
import { DayDetailSidebar } from "./components/day-detail-sidebar";
import { MonthView } from "./components/month-view";
import type { CalendarViewMode, ListRangePreset } from "./components/types";

const DEFAULT_LIST_RANGE: ListRangePreset = "all";

interface EventsContentProps {
  events: EnrichedCalendarEvent[];
}

export function EventsContent({ events }: EventsContentProps) {
  const live = useEventsLiveQuery({ events });
  const liveEvents = live.data.events;
  const intlLocale = useLocale();
  const sourcePills = getEnabledEventSources();

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
  const [listRangePreset, setListRangePreset] =
    useState<ListRangePreset>(DEFAULT_LIST_RANGE);
  const [showEnded, setShowEnded] = useState(false);

  const filteredBase = useMemo(() => {
    let list = liveEvents;
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
    return list;
  }, [liveEvents, search, selectedSourceIds]);

  const agendaEvents = useMemo(() => {
    let list = filteredBase;

    // Filter out past events unless "Ended" is toggled on
    if (!showEnded) {
      const now = startOfDay(new Date());
      list = list.filter((e) => {
        if (!e.startsAt || Number.isNaN(Date.parse(e.startsAt))) {
          return true;
        }
        const end = e.endsAt ? parseISO(e.endsAt) : parseISO(e.startsAt);
        return end >= now;
      });
    }

    if (listRangePreset === "all") {
      return list;
    }
    const now = new Date();
    const start = startOfDay(now);
    const daysMap: Record<string, number> = {
      "forward-1y": 365,
      "forward-30d": 30,
      "forward-6mo": 180,
      "forward-7d": 7,
      "forward-90d": 90,
    };
    const days = daysMap[listRangePreset] ?? 90;
    const limit = addDays(start, days);
    return list.filter((e) => {
      if (!e.startsAt || Number.isNaN(Date.parse(e.startsAt))) {
        return true;
      }
      const d = parseISO(e.startsAt);
      return d >= start && d <= limit;
    });
  }, [filteredBase, listRangePreset, showEnded]);

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

  function clearFilters() {
    setSearch("");
    setSelectedSourceIds(new Set());
    setListRangePreset(DEFAULT_LIST_RANGE);
    setShowEnded(false);
  }

  function handleNavigateToEvent(startsAt: string) {
    const d = parseISO(startsAt);
    if (Number.isNaN(d.getTime())) {
      return;
    }
    setSelectedDay(d);
    setVisibleMonth(startOfMonth(d));
  }

  const hasActiveFilters =
    !!search.trim() ||
    selectedSourceIds.size > 0 ||
    listRangePreset !== DEFAULT_LIST_RANGE ||
    showEnded;

  const monthTitle = format(visibleMonth, "MMMM yyyy");

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <div
        className={cn(
          "border-border/60 bg-card dark:border-border/40",
          "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border shadow-xs"
        )}
      >
        {live.isError ? (
          <div className="border-warning/30 bg-warning/5 mx-3 mt-3 rounded-lg border px-4 py-2.5 sm:mx-4 md:mx-6">
            <p className="text-warning text-xs">
              Could not refresh events. Showing the last loaded calendar.
            </p>
          </div>
        ) : null}

        <CalendarHeader
          hasActiveFilters={hasActiveFilters}
          listRangePreset={listRangePreset}
          monthTitle={monthTitle}
          onClearFilters={clearFilters}
          onGoToday={goToday}
          onNextMonth={() => setVisibleMonth((m) => addMonths(m, 1))}
          onPrevMonth={() => setVisibleMonth((m) => subMonths(m, 1))}
          onSearchChange={setSearch}
          onSetListRange={setListRangePreset}
          onToggleShowEnded={() => setShowEnded((v) => !v)}
          onToggleSource={toggleSource}
          onViewChange={setViewMode}
          search={search}
          selectedSourceIds={selectedSourceIds}
          showEnded={showEnded}
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
          <div
            className={cn(
              "min-h-0 min-w-0",
              viewMode === "month" ? "flex flex-col" : "overflow-y-auto"
            )}
          >
            {viewMode === "month" && (
              <MonthView
                events={filteredBase}
                onSelectDay={setSelectedDay}
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
