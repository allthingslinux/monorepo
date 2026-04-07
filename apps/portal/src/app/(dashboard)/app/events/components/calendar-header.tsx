import {
  CalendarDays,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from "lucide-react";

import type { EventSource } from "@/config/events";
import { Button } from "@atl/ui/components/button";
import { Input } from "@atl/ui/components/input";
import { cn } from "@atl/ui/lib/utils";

import type { CalendarViewMode, ListRangePreset } from "./types";

interface CalendarHeaderProps {
  hasActiveFilters: boolean;
  listRangePreset: ListRangePreset;
  monthTitle: string;
  onClearFilters: () => void;
  onGoToday: () => void;
  onNextMonth: () => void;
  onPrevMonth: () => void;
  onSearchChange: (v: string) => void;
  onSetListRange: (v: ListRangePreset) => void;
  onToggleShowEnded: () => void;
  onToggleSource: (id: string) => void;
  onViewChange: (v: CalendarViewMode) => void;
  search: string;
  selectedSourceIds: Set<string>;
  showEnded: boolean;
  sourcePills: EventSource[];
  viewMode: CalendarViewMode;
}

function sourceTransportLabel(
  src: Pick<
    EventSource,
    "kind" | "calendarUrl" | "feedUrl" | "discourseEventsUrl"
  >
): string | null {
  if (src.kind === "discourse") {
    return "Discourse";
  }
  if (src.kind === "fedocal") {
    return "Fedocal";
  }
  if (src.kind === "lf-scrape") {
    return "Web";
  }
  if (src.kind === "dev-events") {
    return "Web";
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

const VIEW_OPTIONS: {
  icon: typeof CalendarDays;
  label: string;
  value: CalendarViewMode;
}[] = [
  { icon: CalendarDays, label: "Month", value: "month" },
  { icon: CalendarRange, label: "Agenda", value: "agenda" },
];

export function CalendarHeader({
  hasActiveFilters,
  listRangePreset,
  monthTitle,
  onClearFilters,
  onGoToday,
  onNextMonth,
  onPrevMonth,
  onSearchChange,
  onSetListRange,
  onToggleShowEnded,
  onToggleSource,
  onViewChange,
  search,
  selectedSourceIds,
  showEnded,
  sourcePills,
  viewMode,
}: CalendarHeaderProps) {
  const isMonth = viewMode === "month";

  return (
    <div className="border-border/60 bg-muted/20 dark:border-border/40 dark:bg-muted/10 shrink-0 border-b">
      {/* Search bar */}
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-4 size-4 -translate-y-1/2" />
        <Input
          className="h-10 rounded-none border-0 bg-transparent pl-10 shadow-none focus-visible:ring-0"
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search events…"
          value={search}
        />
      </div>

      {/* Source pills */}
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
              onClick={() => onToggleSource(src.id)}
              type="button"
            >
              {src.name}
              {transport && (
                <span className="ml-1 text-[0.65rem] opacity-70">
                  {transport}
                </span>
              )}
            </button>
          );
        })}

        {hasActiveFilters && (
          <button
            className="text-muted-foreground hover:text-foreground ml-auto flex items-center gap-1 rounded-md px-2 py-1 text-xs"
            onClick={onClearFilters}
            type="button"
          >
            <X className="size-3" />
            Clear
          </button>
        )}
      </div>

      {/* Top bar */}
      <div className="border-border/60 dark:border-border/40 flex flex-wrap items-center gap-2 border-t px-3 py-2 sm:px-4">
        {isMonth && (
          <>
            <Button
              className="h-8 shrink-0 text-xs"
              onClick={onGoToday}
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
                onClick={onPrevMonth}
                size="icon-sm"
                type="button"
                variant="ghost"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                aria-label="Next month"
                className="size-8"
                onClick={onNextMonth}
                size="icon-sm"
                type="button"
                variant="ghost"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>

            <p className="min-w-32 flex-1 text-center text-sm font-semibold sm:min-w-0">
              {monthTitle}
            </p>
          </>
        )}

        {!isMonth && (
          <>
            <span className="text-muted-foreground text-xs font-medium">
              Range
            </span>
            <div className="inline-flex">
              {(
                [
                  { label: "7d", value: "forward-7d" },
                  { label: "30d", value: "forward-30d" },
                  { label: "90d", value: "forward-90d" },
                  { label: "6mo", value: "forward-6mo" },
                  { label: "1y", value: "forward-1y" },
                  { label: "All", value: "all" },
                ] as const
              ).map((opt, i, arr) => (
                <button
                  className={cn(
                    "border px-2.5 py-1 text-xs font-medium transition-colors",
                    i === 0 && "rounded-l-md",
                    i === arr.length - 1 && "rounded-r-md",
                    i > 0 && "-ml-px",
                    listRangePreset === opt.value
                      ? "border-primary bg-primary/10 text-primary dark:bg-primary/20"
                      : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground dark:border-border/40"
                  )}
                  key={opt.value}
                  onClick={() => onSetListRange(opt.value)}
                  type="button"
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {listRangePreset === "all" && (
              <button
                className={cn(
                  "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                  showEnded
                    ? "border-primary bg-primary/10 text-primary dark:bg-primary/20"
                    : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground dark:border-border/40"
                )}
                onClick={onToggleShowEnded}
                type="button"
              >
                Ended
              </button>
            )}
            <div className="flex-1" />
          </>
        )}

        {/* View switcher */}
        <div className="ml-auto inline-flex">
          {VIEW_OPTIONS.map((opt, i) => {
            const Icon = opt.icon;
            const isActive = viewMode === opt.value;
            return (
              <Button
                aria-label={`View by ${opt.label}`}
                className={cn(
                  "gap-1.5 text-xs",
                  i === 0 && "rounded-r-none",
                  i === VIEW_OPTIONS.length - 1 && "-ml-px rounded-l-none",
                  i > 0 && i < VIEW_OPTIONS.length - 1 && "-ml-px rounded-none"
                )}
                key={opt.value}
                onClick={() => onViewChange(opt.value)}
                size="sm"
                type="button"
                variant={isActive ? "default" : "outline"}
              >
                <Icon className="size-3.5" />
                <span className="hidden min-[480px]:inline">{opt.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
