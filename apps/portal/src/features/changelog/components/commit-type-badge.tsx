import { cn } from "@portal/utils/utils";

import { COMMIT_TYPE_COLORS } from "../lib/types";
import type { ConventionalCommitType } from "../lib/types";

interface CommitTypeBadgeProps {
  scope?: string | null;
  type: ConventionalCommitType;
}

export function CommitTypeBadge({ type, scope }: CommitTypeBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1">
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-xs font-medium",
          COMMIT_TYPE_COLORS[type]
        )}
      >
        {type}
      </span>
      {scope ? (
        <span className="border-border/50 text-muted-foreground dark:border-border/40 rounded-full border px-1.5 py-0.5 text-xs">
          {scope}
        </span>
      ) : null}
    </span>
  );
}
