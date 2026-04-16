"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@atl/api/query-keys";
import type { EnrichedCalendarEvent } from "@atl/config/events";

export interface EventsLivePayload {
  events: EnrichedCalendarEvent[];
}

async function fetchEventsLive(): Promise<EventsLivePayload> {
  const res = await fetch("/api/app/events");
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || res.statusText || "Failed to refresh events");
  }
  const payload = (await res.json()) as EventsLivePayload;
  if (payload.events.length === 0) {
    throw new Error("Events refresh returned no items");
  }
  return payload;
}

export function useEventsLiveQuery(initial: EventsLivePayload) {
  return useQuery({
    gcTime: 0,
    initialData: initial,
    queryFn: fetchEventsLive,
    queryKey: queryKeys.portal.events(),
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    staleTime: 0,
  });
}
