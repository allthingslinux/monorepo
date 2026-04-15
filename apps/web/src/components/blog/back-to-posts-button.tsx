import { ChevronLeft } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { cn } from "@/lib/utils";

/** Mirrors `@atl/ui` Button `variant="ghost"` + default `size` (must not import from `button.tsx` — it is `"use client"`). */
const ghostButtonClasses =
  "group/button focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:ring-3 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:ring-3 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 h-9 gap-1.5 px-2.5 in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50";

type BackToAllPostsButtonProps = {
  className?: string;
  /** Defaults to the main blog index. */
  href?: Route;
  label?: string;
};

export function BackToAllPostsButton({
  className,
  href = "/blog",
  label = "All posts",
}: BackToAllPostsButtonProps) {
  return (
    <Link className={cn(ghostButtonClasses, "gap-2", className)} href={href}>
      <ChevronLeft aria-hidden className="size-4 shrink-0" />
      {label}
    </Link>
  );
}
