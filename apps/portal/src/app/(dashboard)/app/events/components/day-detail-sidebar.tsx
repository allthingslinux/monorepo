import type { EnrichedCalendarEvent } from "@atl/config/events";
import { Separator } from "@atl/ui/components/separator";
import { cn } from "@atl/ui/lib/utils";

import { eventsForDay, formatEventRange } from "../helpers/calendar-helpers";
import { EventCard } from "./event-card";

const UPCOMING_LIMIT = 8;

interface DayDetailSidebarProps {
  events: EnrichedCalendarEvent[];
  locale: string;
  onNavigateToEvent: (startsAt: string) => void;
  selectedDay: Date | undefined;
}

export function DayDetailSidebar({
  events,
  locale,
  onNavigateToEvent,
  selectedDay,
}: DayDetailSidebarProps) {
  const dayEvents = selectedDay ? eventsForDay(events, selectedDay) : [];

  const upcoming = (() => {
    const now = Date.now();
    const dated = events.filter(
      (e) => e.startsAt && !Number.isNaN(Date.parse(e.startsAt))
    );
    const undated = events.filter(
      (e) => !e.startsAt || Number.isNaN(Date.parse(e.startsAt))
    );
    const future = dated
      .filter((e) => Date.parse(e.startsAt!) >= now)
      .toSorted((a, b) => Date.parse(a.startsAt!) - Date.parse(b.startsAt!));
    return [...future, ...undated].slice(0, UPCOMING_LIMIT);
  })();

  return (
    <aside
      className={cn(
        "border-border/60 bg-muted/10 dark:border-border/40 flex min-h-0 w-full min-w-0 flex-col border-t",
        "lg:h-full lg:border-t-0 lg:border-l"
      )}
    >
      {/* Selected day header — always visible */}
      <div className="border-border/60 dark:border-border/40 min-w-0 shrink-0 border-b px-3 py-2">
        <p className="text-foreground text-sm font-medium">
          {selectedDay
            ? selectedDay.toLocaleDateString(locale, {
                day: "numeric",
                month: "long",
                weekday: "long",
                year: "numeric",
              })
            : "Pick a day"}
        </p>
        <p className="text-muted-foreground text-xs">
          {dayEvents.length} {dayEvents.length === 1 ? "event" : "events"}
        </p>
      </div>

      {/* Scrollable content */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="min-w-0 space-y-3 p-3">
          {dayEvents.length > 0 ? (
            dayEvents.map((e) => <EventCard compact event={e} key={e.id} />)
          ) : (
            <p className="text-muted-foreground text-xs">
              No events on this day.
            </p>
          )}

          <Separator className="my-2" />

          <div className="space-y-2">
            <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              Upcoming
            </p>
            {upcoming.length > 0 ? (
              <ul className="space-y-2">
                {upcoming.map((e) => (
                  <li key={`side-${e.id}`}>
                    <button
                      className="hover:border-border/60 hover:bg-muted/40 dark:hover:border-border/40 w-full rounded-md border border-transparent px-1 py-1 text-left transition-colors"
                      onClick={() => {
                        if (e.startsAt) {
                          onNavigateToEvent(e.startsAt);
                        }
                      }}
                      type="button"
                    >
                      <p className="text-foreground text-xs leading-snug font-medium">
                        {e.title}
                      </p>
                      <p className="text-muted-foreground text-[0.65rem]">
                        {formatEventRange(e.startsAt, e.endsAt) || "Date TBA"} ·{" "}
                        {e.source.name}
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
      </div>
    </aside>
  );
}
