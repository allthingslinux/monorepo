import type { Route } from "next";
import Link from "next/link";

import { slugifyCategory } from "@/lib/blog-utils";
import { cn } from "@/lib/utils";

import {
  blogCategoryPillActiveClassName,
  blogCategoryPillBaseClassName,
  blogCategoryPillMutedClassName,
} from "./blog-shell";

type BlogCategoryNavProps = {
  activeCategorySlug: string | null;
  categories: string[];
};

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
          blogCategoryPillBaseClassName,
          activeCategorySlug === null
            ? blogCategoryPillActiveClassName
            : blogCategoryPillMutedClassName
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
              blogCategoryPillBaseClassName,
              active
                ? blogCategoryPillActiveClassName
                : blogCategoryPillMutedClassName
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
