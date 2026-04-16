/** Wider than default marketing `Container` (`max-w-6xl`) for blog index, categories, and posts. */
export const blogContainerClassName =
  "max-w-7xl xl:max-w-[85rem] 2xl:max-w-[92rem] xl:px-8 2xl:px-12";

/** Card-style shell for article side rails (meta aside, TOC) — keep in sync visually. */
export const blogArticleSidePanelClassName =
  "border-border/50 bg-card/30 rounded-lg border p-4 backdrop-blur-sm";

/** Column width for meta aside and TOC at lg+ (TOC also prepends `hidden lg:block`). */
export const blogArticleSideRailWidthClassName =
  "w-full max-w-full shrink-0 lg:w-52 lg:max-w-none xl:w-60 2xl:w-64";

/** Pill chrome for category links — shared with `BlogCategoryNav`. */
export const blogCategoryPillBaseClassName =
  "inline-flex w-fit max-w-full items-center justify-center rounded-full border px-4 py-2.5 text-sm font-medium transition-colors duration-200 focus-visible:ring-ring focus-visible:ring-offset-background outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

export const blogCategoryPillActiveClassName =
  "border-primary/45 bg-primary/12 text-foreground shadow-sm";

export const blogCategoryPillMutedClassName =
  "border-border/70 bg-muted/35 text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground";

/** Tighter pill sizing for the article meta rail (overrides base padding/type). */
export const blogCategoryPillDenseClassName =
  "px-2.5 py-1 text-xs leading-tight";
