import { format, isToday, startOfDay } from "date-fns";

import type { EnrichedCalendarEvent } from "@atl/config/events";
import { cn } from "@atl/ui/lib/utils";

import {
  eventsByDay,
  getCalendarCells,
  sourceBadgeColor,
} from "../helpers/calendar-helpers";
import type { CalendarCell } from "../helpers/calendar-helpers";
import { EventBadge } from "./event-badge";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MAX_VISIBLE = 3;

interface MonthViewProps {
  events: EnrichedCalendarEvent[];
  onSelectDay: (d: Date) => void;
  selectedDay: Date | undefined;
  visibleMonth: Date;
}

export function MonthView({
  events,
  onSelectDay,
  selectedDay,
  visibleMonth,
}: MonthViewProps) {
  const cells = getCalendarCells(visibleMonth);
  const byDay = eventsByDay(events);
  const rowCount = cells.length / 7;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Weekday header */}
      <div className="grid grid-cols-7 border-b">
        {WEEKDAYS.map((d) => (
          <div
            className="text-muted-foreground flex items-center justify-center py-2 text-xs font-medium"
            key={d}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div
        className="grid min-h-0 flex-1 grid-cols-7"
        style={{ gridTemplateRows: `repeat(${rowCount}, minmax(0, 1fr))` }}
      >
        {cells.map((cell) => (
          <DayCell
            byDay={byDay}
            cell={cell}
            key={cell.date.toISOString()}
            onSelect={onSelectDay}
            selected={
              selectedDay !== undefined &&
              format(startOfDay(selectedDay), "yyyy-MM-dd") ===
                format(startOfDay(cell.date), "yyyy-MM-dd")
            }
          />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DayCell
// ---------------------------------------------------------------------------

function DayCell({
  cell,
  byDay,
  onSelect,
  selected,
}: {
  byDay: Map<string, EnrichedCalendarEvent[]>;
  cell: CalendarCell;
  onSelect: (d: Date) => void;
  selected: boolean;
}) {
  const key = format(startOfDay(cell.date), "yyyy-MM-dd");
  const list = byDay.get(key) ?? [];
  const shown = list.slice(0, MAX_VISIBLE);
  const overflow = list.length - shown.length;
  const today = isToday(cell.date);
  const isSunday = cell.date.getDay() === 0;

  return (
    <button
      className={cn(
        "flex min-h-26 flex-col gap-1 overflow-hidden border-t py-1.5 text-left sm:min-h-29 lg:pt-1 lg:pb-2",
        !isSunday && "border-l",
        selected &&
          "bg-primary/5 ring-primary/20 dark:bg-primary/10 dark:ring-primary/30 ring-2 ring-inset",
        !cell.currentMonth && "opacity-40"
      )}
      onClick={() => onSelect(startOfDay(cell.date))}
      type="button"
    >
      {/* Day number */}
      <span
        className={cn(
          "ml-1 flex size-6 items-center justify-center rounded-full text-xs font-semibold",
          today && "bg-primary text-primary-foreground font-bold"
        )}
      >
        {cell.day}
      </span>

      {/* Event badges (desktop) / dots (mobile) */}
      <div className="flex min-h-0 flex-1 flex-col gap-0.5 px-0.5 lg:px-0">
        {/* Mobile: dots only */}
        <div className="flex gap-1 px-1 lg:hidden">
          {shown.map((e) => (
            <svg
              aria-hidden
              className={cn("shrink-0", sourceBadgeColor(e.sourceId).dot)}
              height="6"
              key={e.id}
              viewBox="0 0 6 6"
              width="6"
            >
              <circle cx="3" cy="3" r="3" />
            </svg>
          ))}
          {overflow > 0 && (
            <span className="text-muted-foreground text-[0.55rem]">
              +{overflow}
            </span>
          )}
        </div>

        {/* Desktop: full badges */}
        <div className="hidden flex-col gap-0.5 lg:flex">
          {shown.map((e) => (
            <EventBadge event={e} key={e.id} showTime />
          ))}
          {overflow > 0 && (
            <span className="text-muted-foreground px-2 text-[0.65rem] tabular-nums">
              +{overflow} more
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
