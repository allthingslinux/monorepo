import {
  CalendarDays,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  X,
} from "lucide-react";

import type { EventSource } from "@/config/events";
import { Button } from "@atl/ui/components/button";
import { Checkbox } from "@atl/ui/components/checkbox";
import { Input } from "@atl/ui/components/input";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@atl/ui/components/popover";
import { cn } from "@atl/ui/lib/utils";

import type { CalendarViewMode, ListRangePreset } from "./types";

interface CalendarHeaderProps {
  allCategories: string[];
  categoryDenyList: Set<string>;
  hasActiveFilters: boolean;
  listRangePreset: ListRangePreset;
  monthTitle: string;
  onClearFilters: () => void;
  onGoToday: () => void;
  onNextMonth: () => void;
  onPrevMonth: () => void;
  onSearchChange: (v: string) => void;
  onSetListRange: (v: ListRangePreset) => void;
  onToggleCategoryDeny: (cat: string) => void;
  onToggleSource: (id: string) => void;
  onViewChange: (v: CalendarViewMode) => void;
  search: string;
  selectedSourceIds: Set<string>;
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
  allCategories,
  categoryDenyList,
  hasActiveFilters,
  listRangePreset,
  monthTitle,
  onClearFilters,
  onGoToday,
  onNextMonth,
  onPrevMonth,
  onSearchChange,
  onSetListRange,
  onToggleCategoryDeny,
  onToggleSource,
  onViewChange,
  search,
  selectedSourceIds,
  sourcePills,
  viewMode,
}: CalendarHeaderProps) {
  return (
    <div className="border-border/60 bg-muted/20 dark:border-border/40 dark:bg-muted/10 shrink-0 border-b">
      {/* Top bar: Today + nav + title + view switcher */}
      <div className="flex flex-wrap items-center gap-2 px-3 py-2 sm:px-4">
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

        {/* View switcher (button group) */}
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

      {/* Search bar */}
      <div className="border-border/60 dark:border-border/40 relative border-t">
        <Search className="text-muted-foreground absolute top-1/2 left-4 size-4 -translate-y-1/2" />
        <Input
          className="h-10 rounded-none border-0 bg-transparent pl-10 shadow-none focus-visible:ring-0"
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search events…"
          value={search}
        />
      </div>

      {/* Source pills + filters */}
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
              listRangePreset !== "forward-90d") && (
              <span className="bg-primary/15 text-primary rounded-full px-1.5 py-px text-[0.65rem]">
                {categoryDenyList.size +
                  (listRangePreset === "forward-90d" ? 0 : 1)}
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
                  Agenda range
                </p>
                <select
                  className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 h-9 w-full rounded-md border px-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                  onChange={(e) =>
                    onSetListRange(e.target.value as ListRangePreset)
                  }
                  value={listRangePreset}
                >
                  <option value="forward-90d">Next 90 days</option>
                  <option value="visible-month">
                    Calendar month ({monthTitle})
                  </option>
                  <option value="all">All events</option>
                </select>
              </div>
              {allCategories.length > 0 && (
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
                          onCheckedChange={() => onToggleCategoryDeny(cat)}
                        />
                        <span className="truncate">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

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
    </div>
  );
}
