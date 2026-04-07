import type { EnrichedCalendarEvent } from "@atl/config/events";
import { cn } from "@atl/ui/lib/utils";

import { sourceBadgeColor } from "../helpers/calendar-helpers";

interface EventBadgeProps {
  className?: string;
  event: EnrichedCalendarEvent;
  showTime?: boolean;
}

/**
 * Compact coloured badge for month/week cells.
 * Uses source-based colour with a dot indicator.
 */
export function EventBadge({ event, showTime, className }: EventBadgeProps) {
  const colors = sourceBadgeColor(event.sourceId);

  return (
    <div
      className={cn(
        "flex h-6.5 min-w-0 items-center gap-1.5 rounded-md border px-2 text-xs select-none",
        "focus-visible:ring-ring focus-visible:ring-1 focus-visible:outline-none",
        colors.bg,
        colors.border,
        colors.text,
        className
      )}
    >
      <svg
        aria-hidden
        className={cn("event-dot shrink-0", colors.dot)}
        height="8"
        viewBox="0 0 8 8"
        width="8"
      >
        <circle cx="4" cy="4" r="4" />
      </svg>
      <span className="min-w-0 flex-1 truncate font-medium">{event.title}</span>
      {showTime && event.startsAt && (
        <span className="shrink-0 tabular-nums opacity-75">
          {new Date(event.startsAt).toLocaleTimeString(undefined, {
            hour: "numeric",
            minute: "2-digit",
          })}
        </span>
      )}
    </div>
  );
}
