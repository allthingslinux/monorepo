import { cn } from "@atl/utils/utils";

import { COMMIT_TYPE_COLORS } from "../lib/types";
import type { ConventionalCommitType } from "../lib/types";

const COMMIT_TYPES: { label: string; value: ConventionalCommitType }[] = [
  { label: "feat", value: "feat" },
  { label: "fix", value: "fix" },
  { label: "refactor", value: "refactor" },
  { label: "chore", value: "chore" },
  { label: "docs", value: "docs" },
  { label: "style", value: "style" },
  { label: "perf", value: "perf" },
  { label: "test", value: "test" },
  { label: "build", value: "build" },
  { label: "ci", value: "ci" },
];

interface CommitTypeFilterProps {
  onToggle: (type: ConventionalCommitType) => void;
  selectedTypes: Set<ConventionalCommitType>;
}

export function CommitTypeFilter({
  selectedTypes,
  onToggle,
}: CommitTypeFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {COMMIT_TYPES.map((option) => {
        const active = selectedTypes.has(option.value);
        return (
          <button
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
              active
                ? COMMIT_TYPE_COLORS[option.value]
                : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground dark:border-border/40 bg-transparent"
            )}
            key={option.value}
            onClick={() => onToggle(option.value)}
            type="button"
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
