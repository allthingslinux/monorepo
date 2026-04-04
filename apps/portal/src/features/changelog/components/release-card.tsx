import {
  ArrowUpRight,
  GitCommitHorizontal,
  Minus,
  Plus,
  Tag,
  Users,
} from "lucide-react";

import type { ReleaseEntry } from "../lib/types";
import { RepoIcon } from "./repo-icon";

interface ReleaseCardProps {
  entry: ReleaseEntry;
}

export function ReleaseCard({ entry }: ReleaseCardProps) {
  const formattedDate = new Date(entry.date).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const hasStats =
    (entry.commitCount !== null && entry.commitCount !== undefined) ||
    (entry.contributors !== null && entry.contributors !== undefined);

  return (
    <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/5 px-3 py-2 dark:border-green-500/20 dark:bg-green-500/5">
      <span className="border-border/60 dark:border-border/40 mr-2 inline-flex w-32 shrink-0 items-center gap-1.5 border-r pr-3">
        <RepoIcon className="text-foreground size-4" repoId={entry.repoId} />
        <span className="text-foreground truncate font-mono text-sm">
          {entry.repoDisplayName}
        </span>
      </span>
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-green-800 px-2.5 py-1 text-sm font-medium text-green-100 dark:bg-green-900 dark:text-green-300">
        <Tag className="size-3.5" />
        release
      </span>
      <span className="text-foreground/70 shrink-0 font-mono text-sm">
        {entry.tagName}
      </span>
      {entry.title && entry.title !== entry.tagName ? (
        <span className="text-foreground min-w-0 flex-1 truncate text-base">
          {entry.title}
        </span>
      ) : (
        <span className="flex-1" />
      )}
      {hasStats ? (
        <span className="inline-flex shrink-0 items-center gap-2.5">
          {entry.commitCount === null ||
          entry.commitCount === undefined ? null : (
            <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
              <GitCommitHorizontal className="size-3" />
              {entry.commitCount}
            </span>
          )}
          {entry.contributors === null ||
          entry.contributors === undefined ? null : (
            <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
              <Users className="size-3" />
              {entry.contributors}
            </span>
          )}
          {entry.additions === null || entry.additions === undefined ? null : (
            <span className="inline-flex items-center gap-0.5 font-mono text-xs text-green-600 dark:text-green-400">
              <Plus className="size-3" />
              {entry.additions.toLocaleString()}
            </span>
          )}
          {entry.deletions === null || entry.deletions === undefined ? null : (
            <span className="inline-flex items-center gap-0.5 font-mono text-xs text-red-500 dark:text-red-400">
              <Minus className="size-3" />
              {entry.deletions.toLocaleString()}
            </span>
          )}
        </span>
      ) : null}
      <span className="text-muted-foreground shrink-0 text-sm">
        {formattedDate}
      </span>
      <span className="inline-flex shrink-0 items-center gap-1">
        {entry.compareUrl ? (
          <a
            className="text-muted-foreground inline-flex items-center rounded-md px-1 py-1 text-xs transition-colors hover:bg-green-500/10 hover:text-green-600 dark:hover:text-green-400"
            href={entry.compareUrl}
            rel="noopener noreferrer"
            target="_blank"
            title="View diff"
          >
            <GitCommitHorizontal className="size-3" />
          </a>
        ) : null}
        <a
          className="text-muted-foreground inline-flex items-center rounded-md px-1 py-1 text-xs transition-colors hover:bg-green-500/10 hover:text-green-600 dark:hover:text-green-400"
          href={entry.url}
          rel="noopener noreferrer"
          target="_blank"
          title="View release"
        >
          <ArrowUpRight className="size-3" />
        </a>
      </span>
    </div>
  );
}
