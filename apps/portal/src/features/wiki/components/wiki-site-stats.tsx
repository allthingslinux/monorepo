import { BookOpen } from "lucide-react";
import { Suspense } from "react";

import { isWikiApiConfigured } from "@/features/integrations/lib/mediawiki/keys";
import { fetchWikiStats } from "@/shared/wiki";
import { Skeleton } from "@atl/ui/components/skeleton";

async function WikiSiteStatsContent() {
  if (!isWikiApiConfigured()) {
    return (
      <div className="border-border/60 bg-card/50 dark:border-border/40 dark:bg-card/30 rounded-xl border p-4">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 flex size-9 shrink-0 items-center justify-center rounded-lg">
            <BookOpen className="text-primary size-4" />
          </div>
          <span className="text-muted-foreground text-sm font-medium">
            Wiki Stats
          </span>
        </div>
        <div className="mt-3">
          <div className="text-foreground text-2xl font-bold tabular-nums">
            —
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">Not configured</p>
        </div>
      </div>
    );
  }

  const stats = await fetchWikiStats();

  if (!stats) {
    return (
      <div className="border-border/60 bg-card/50 dark:border-border/40 dark:bg-card/30 rounded-xl border p-4">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 flex size-9 shrink-0 items-center justify-center rounded-lg">
            <BookOpen className="text-primary size-4" />
          </div>
          <span className="text-muted-foreground text-sm font-medium">
            Wiki Stats
          </span>
        </div>
        <div className="mt-3">
          <div className="text-foreground text-2xl font-bold tabular-nums">
            —
          </div>
          <p className="text-destructive mt-0.5 text-xs">Failed to load</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border-border/60 bg-card/50 dark:border-border/40 dark:bg-card/30 rounded-xl border p-4">
      <div className="flex items-center gap-2">
        <div className="bg-primary/10 flex size-9 shrink-0 items-center justify-center rounded-lg">
          <BookOpen className="text-primary size-4" />
        </div>
        <span className="text-muted-foreground text-sm font-medium">
          Wiki Stats
        </span>
      </div>
      <div className="mt-3">
        <div className="text-foreground text-2xl font-bold tabular-nums">
          {stats.articles.toLocaleString()}
        </div>
        <p className="text-muted-foreground mt-0.5 text-xs">
          {stats.edits.toLocaleString()} edits ·{" "}
          {stats.activeUsers.toLocaleString()} active users
        </p>
      </div>
    </div>
  );
}

export function WikiSiteStats() {
  return (
    <Suspense
      fallback={
        <div className="border-border/60 bg-card/50 dark:border-border/40 dark:bg-card/30 rounded-xl border p-4">
          <div className="flex items-center gap-2">
            <Skeleton className="size-9 rounded-lg" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="mt-3 space-y-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      }
    >
      <WikiSiteStatsContent />
    </Suspense>
  );
}
