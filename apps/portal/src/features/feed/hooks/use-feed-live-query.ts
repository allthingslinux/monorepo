"use client";

import { useQuery } from "@tanstack/react-query";

import type { FeedArticle, FeedSourceResult } from "@/shared/feed";
import { queryKeys } from "@atl/api/query-keys";

export interface FeedLivePayload {
  articles: FeedArticle[];
  results: FeedSourceResult[];
}

async function fetchFeedLive(): Promise<FeedLivePayload> {
  const res = await fetch("/api/app/feed");
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || res.statusText || "Failed to refresh feed");
  }
  const payload = (await res.json()) as FeedLivePayload;
  const allSourcesFailed =
    payload.articles.length === 0 &&
    payload.results.length > 0 &&
    payload.results.every((r) => Boolean(r.error));
  if (allSourcesFailed) {
    throw new Error("Feed refresh returned only source errors");
  }
  return payload;
}

/**
 * SSR-hydrated feed data, then always refetches on mount (e.g. sidebar navigation).
 * Failed refetch keeps the last successful payload (initial SSR or prior refetch).
 */
export function useFeedLiveQuery(initial: FeedLivePayload) {
  return useQuery({
    gcTime: 0,
    initialData: initial,
    queryFn: fetchFeedLive,
    queryKey: queryKeys.portal.feed(),
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    staleTime: 0,
  });
}
