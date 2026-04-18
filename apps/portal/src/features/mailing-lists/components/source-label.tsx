"use client";

import { Badge } from "@atl/ui/components/badge";
import { cn } from "@atl/ui/lib/utils";

export interface SourceLabelFields {
  displayName: string;
  listLabel: string | null;
  sourceLabel: string | null;
}

const sourcePillBase =
  "max-w-[min(8rem,45%)] min-w-0 shrink truncate px-2 py-0.5 font-semibold leading-tight";

/**
 * Outline pill for the origin; list name is plain muted text. Fallback: one outline pill for displayName.
 */
export function SourceLabelText({
  className,
  displayName,
  listLabel,
  sourceLabel,
  variant = "sidebar",
}: SourceLabelFields & {
  className?: string;
  variant?: "inline" | "sidebar";
}) {
  const sourceText = variant === "sidebar" ? "text-xs" : "text-sm";
  const listText =
    variant === "sidebar"
      ? "text-sm font-medium"
      : "text-sm font-medium leading-snug";
  const fallbackText = variant === "sidebar" ? "text-sm" : "text-sm";

  if (sourceLabel && listLabel) {
    return (
      <span
        className={cn(
          "inline-flex min-w-0 flex-1 flex-wrap items-baseline gap-1.5",
          className
        )}
      >
        <Badge
          className={cn(sourcePillBase, sourceText, "h-6 min-h-6")}
          variant="outline"
        >
          {sourceLabel}
        </Badge>
        <span
          className={cn(
            "text-muted-foreground min-w-0 flex-1 truncate",
            listText
          )}
        >
          {listLabel}
        </span>
      </span>
    );
  }
  return (
    <Badge
      className={cn(
        sourcePillBase,
        fallbackText,
        "border-border/80 h-6 min-h-6 w-fit max-w-full font-medium",
        className
      )}
      variant="outline"
    >
      {displayName}
    </Badge>
  );
}
