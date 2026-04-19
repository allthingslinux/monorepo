import { ArrowUpRight } from "lucide-react";
import Image from "next/image";

import { parseConventionalCommit } from "../lib/parser";
import type { CommitEntry } from "../lib/types";
import { CommitTypeBadge } from "./commit-type-badge";
import { RepoIcon } from "./repo-icon";

interface CommitRowProps {
  entry: CommitEntry;
}

export function CommitRow({ entry }: CommitRowProps) {
  const parsed = parseConventionalCommit(entry.message);

  const formattedDate = new Date(entry.date).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="border-border/70 bg-card/80 hover:bg-muted/25 dark:bg-card/60 flex items-center gap-2 rounded-lg border px-3 py-2 shadow-xs transition-colors">
      {/* 1. Repo */}
      <span className="border-border/60 dark:border-border/40 mr-2 inline-flex w-32 shrink-0 items-center gap-1.5 border-r pr-3">
        <RepoIcon repoId={entry.repoId} />
        <span className="text-foreground truncate font-mono text-xs">
          {entry.repoDisplayName}
        </span>
      </span>

      {/* 2. Type badge  3. Scope */}
      {parsed.type ? (
        <CommitTypeBadge scope={parsed.scope} type={parsed.type} />
      ) : null}

      {/* 4. Commit description (flexible, takes remaining space) */}
      <span className="text-foreground min-w-0 flex-1 truncate text-sm">
        {parsed.type ? parsed.description : parsed.description}
      </span>

      {/* 5. SHA */}
      <span className="text-muted-foreground shrink-0 font-mono text-xs">
        {entry.shortSha}
      </span>

      {/* 6. Author */}
      <Image
        alt={entry.authorName}
        className="size-5 shrink-0 rounded-full"
        height={20}
        src={entry.authorAvatarUrl}
        width={20}
      />
      <span className="text-muted-foreground shrink-0 text-xs">
        {entry.authorName}
      </span>

      {/* 7. Timestamp */}
      <span className="text-muted-foreground shrink-0 text-xs">
        {formattedDate}
      </span>
      <a
        className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex shrink-0 items-center rounded-md px-1 py-1 text-xs transition-colors"
        href={entry.url}
        rel="noopener noreferrer"
        target="_blank"
      >
        <ArrowUpRight className="size-3" />
      </a>
    </div>
  );
}
