import { CalendarX2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { EnrichedCalendarEvent } from "@/config/events";

import { buildAgendaGroups } from "../helpers/calendar-helpers";
import { EventCard } from "./event-card";

const PAGE_SIZE = 24;

interface AgendaViewProps {
  events: EnrichedCalendarEvent[];
  locale: string;
  onSelectEvent?: (event: EnrichedCalendarEvent) => void;
  selectedEventId?: string;
}

export function AgendaView({
  events,
  locale,
  onSelectEvent,
  selectedEventId,
}: AgendaViewProps) {
  const groups = useMemo(
    () => buildAgendaGroups(events, locale),
    [events, locale]
  );

  const flatCount = useMemo(
    () => groups.reduce((n, g) => n + g.events.length, 0),
    [groups]
  );

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Reset pagination when data changes
  const dataKey = useMemo(() => events.map((e) => e.id).join(","), [events]);
  useEffect(() => setVisibleCount(PAGE_SIZE), [dataKey]);

  // Infinite scroll
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || visibleCount >= flatCount) {
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisibleCount((c) => Math.min(c + PAGE_SIZE, flatCount));
        }
      },
      { rootMargin: "240px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [flatCount, visibleCount]);

  if (groups.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 py-20">
        <CalendarX2 className="size-10" />
        <p className="text-sm">No events match the current filters.</p>
      </div>
    );
  }

  let rendered = 0;

  return (
    <div className="space-y-4 p-3 sm:p-4">
      {groups.map((group) => {
        if (rendered >= visibleCount) {
          return null;
        }
        const items = group.events.filter(() => {
          if (rendered >= visibleCount) {
            return false;
          }
          rendered += 1;
          return true;
        });
        if (items.length === 0) {
          return null;
        }

        return (
          <section className="space-y-2" key={group.key}>
            <h3 className="border-border/40 bg-card/95 text-muted-foreground dark:bg-card/90 sticky top-0 z-10 border-b py-1 text-xs font-medium backdrop-blur-sm">
              {group.label}
            </h3>
            <div className="space-y-2">
              {items.map((e) => (
                <EventCard
                  event={e}
                  key={e.id}
                  onSelect={onSelectEvent}
                  selected={selectedEventId === e.id}
                />
              ))}
            </div>
          </section>
        );
      })}

      {visibleCount < flatCount && (
        <div aria-hidden className="h-4 w-full" ref={sentinelRef} />
      )}
    </div>
  );
}
