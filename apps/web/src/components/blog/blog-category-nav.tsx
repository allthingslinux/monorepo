import type { Route } from "next";
import Link from "next/link";

import { slugifyCategory } from "@/lib/blog-utils";
import { cn } from "@/lib/utils";

type BlogCategoryNavProps = {
  activeCategorySlug: string | null;
  categories: string[];
};

const pillBase =
  "inline-flex items-center justify-center rounded-full border px-4 py-2.5 text-sm font-medium transition-colors duration-200 focus-visible:ring-ring focus-visible:ring-offset-background outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

export function BlogCategoryNav({
  categories,
  activeCategorySlug,
}: BlogCategoryNavProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Blog categories"
      className="mb-10 flex flex-wrap justify-center gap-2 md:mb-12"
    >
      <Link
        className={cn(
          pillBase,
          activeCategorySlug === null
            ? "border-primary/45 bg-primary/12 text-foreground shadow-sm"
            : "border-border/70 bg-muted/35 text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground"
        )}
        href="/blog"
      >
        All
      </Link>
      {categories.map((cat) => {
        const catSlug = slugifyCategory(cat);
        const active = activeCategorySlug === catSlug;
        return (
          <Link
            className={cn(
              pillBase,
              active
                ? "border-primary/45 bg-primary/12 text-foreground shadow-sm"
                : "border-border/70 bg-muted/35 text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground"
            )}
            href={`/blog/${catSlug}` as Route}
            key={catSlug}
          >
            {cat}
          </Link>
        );
      })}
    </nav>
  );
}
