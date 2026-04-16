"use client";

import { useQuery } from "@tanstack/react-query";

import type {
  RepoError,
  RepoSummary,
  TimelineEntry,
} from "@/features/changelog/lib/types";
import { queryKeys } from "@atl/api/query-keys";

export interface ChangelogLivePayload {
  entries: TimelineEntry[];
  errors: RepoError[];
  repos: RepoSummary[];
}

async function fetchChangelogLive(): Promise<ChangelogLivePayload> {
  const res = await fetch("/api/app/changelog");
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || res.statusText || "Failed to refresh changelog");
  }
  const payload = (await res.json()) as ChangelogLivePayload;
  if (payload.entries.length === 0 && payload.errors.length > 0) {
    throw new Error("Changelog refresh returned only errors");
  }
  return payload;
}

/**
 * SSR-hydrated changelog, then always refetches on mount (e.g. sidebar navigation).
 * Failed refetch keeps the last successful payload.
 */
export function useChangelogLiveQuery(initial: ChangelogLivePayload) {
  return useQuery({
    gcTime: 0,
    initialData: initial,
    queryFn: fetchChangelogLive,
    queryKey: queryKeys.portal.changelog(),
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    staleTime: 0,
  });
}
