import { History } from "lucide-react";
import { useEffect, useRef } from "react";

import type { TimelineEntry } from "../lib/types";
import { CommitRow } from "./commit-row";
import { ReleaseCard } from "./release-card";

interface TimelineViewProps {
  entries: TimelineEntry[];
  onLoadMore: () => void;
  visibleCount: number;
}

export function TimelineView({
  entries,
  onLoadMore,
  visibleCount,
}: TimelineViewProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const hasMore = visibleCount < entries.length;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!(el && hasMore)) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, onLoadMore]);

  if (entries.length === 0) {
    return (
      <div className="border-border/70 bg-card/95 text-card-foreground ring-foreground/10 flex flex-col items-center justify-center rounded-xl border py-16 shadow-sm ring-1 backdrop-blur-sm">
        <History className="text-muted-foreground/40 mb-3 size-8" />
        <p className="text-foreground font-medium">No activity found</p>
        <p className="text-muted-foreground mt-1 text-sm">
          Try adjusting your filters.
        </p>
      </div>
    );
  }

  const visibleEntries = entries.slice(0, visibleCount);

  return (
    <div className="space-y-3">
      {visibleEntries.map((entry) =>
        entry.type === "release" ? (
          <ReleaseCard entry={entry} key={entry.id} />
        ) : (
          <CommitRow entry={entry} key={entry.id} />
        )
      )}

      {hasMore ? (
        <div className="h-px" ref={sentinelRef} />
      ) : (
        <p className="text-muted-foreground pt-2 text-center text-sm">
          No more entries
        </p>
      )}
    </div>
  );
}
