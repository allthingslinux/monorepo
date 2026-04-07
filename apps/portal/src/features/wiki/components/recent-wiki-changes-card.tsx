import { formatRelativeTime } from "@atl/utils/date";
import { ArrowUpRight, BookOpen } from "lucide-react";

import { env } from "@/env";
import { fetchRecentWikiChanges } from "@/shared/wiki";

const API_PATH_REGEX = /\/w\/api\.php$/;
const ROOT_API_REGEX = /\/api\.php$/;

function getWikiBaseUrl(): string {
  const api = env.WIKI_API_URL;
  return api.replace(API_PATH_REGEX, "").replace(ROOT_API_REGEX, "") || api;
}

function formatDiff(diff: number): string {
  if (diff === 0) {
    return "±0";
  }
  return diff > 0 ? `+${diff}` : String(diff);
}

export async function RecentWikiChangesCard() {
  const changes = await fetchRecentWikiChanges();
  const wikiBaseUrl = getWikiBaseUrl();

  if (changes.length === 0) {
    return (
      <div className="border-border/60 bg-card/50 dark:border-border/40 dark:bg-card/30 rounded-xl border p-4">
        <div className="flex items-center gap-2">
          <BookOpen className="text-muted-foreground size-4" />
          <h3 className="text-foreground font-medium">Recent Wiki Changes</h3>
        </div>
        <p className="text-muted-foreground mt-3 text-sm">
          No recent changes. Check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="border-border/60 bg-card/50 dark:border-border/40 dark:bg-card/30 rounded-xl border p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="text-muted-foreground size-4" />
          <h3 className="text-foreground font-medium">Recent Wiki Changes</h3>
        </div>
        <a
          className="text-primary text-xs font-medium hover:underline"
          href={wikiBaseUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          View all
        </a>
      </div>
      <ul className="flex flex-col gap-2">
        {changes.map((item) => (
          <li key={`${item.pageId}-${item.title}-${item.timestamp}`}>
            <a
              className="group border-border/60 hover:bg-muted/50 dark:border-border/40 flex flex-col gap-0.5 rounded-lg border px-3 py-2 transition-colors"
              href={item.url}
              rel="noopener noreferrer"
              target="_blank"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-foreground group-hover:text-primary line-clamp-2 text-sm font-medium">
                  {item.title}
                </span>
                <ArrowUpRight className="text-muted-foreground mt-0.5 size-3.5 shrink-0 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
              </div>
              <span className="text-muted-foreground text-xs">
                by {item.user} · {formatRelativeTime(item.timestamp)}
                {item.diff !== 0 && (
                  <span
                    className={
                      item.diff > 0
                        ? "text-success ml-1"
                        : "text-destructive ml-1"
                    }
                  >
                    · {formatDiff(item.diff)}
                  </span>
                )}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
