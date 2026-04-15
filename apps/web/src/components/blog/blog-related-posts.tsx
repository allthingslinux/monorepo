import type { BlogPost } from "contentlayer/generated";
import { ArrowUpRight } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { cn } from "@/lib/utils";

type BlogRelatedPostsProps = {
  categoryLabel: string;
  className?: string;
  posts: BlogPost[];
};

export function BlogRelatedPosts({
  posts,
  categoryLabel,
  className,
}: BlogRelatedPostsProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="related-posts-heading"
      className={cn("mt-16 border-t pt-12", className)}
    >
      <h2
        className="font-display mb-6 text-xl font-semibold tracking-tight"
        id="related-posts-heading"
      >
        More in {categoryLabel}
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {posts.map((p) => (
          <li key={p.slug}>
            <Link
              className="group bg-card hover:bg-muted/50 flex items-start gap-2 rounded-lg border p-4 transition-colors"
              href={`/blog/${p.categorySlug}/${p.slug}` as Route}
            >
              <span className="min-w-0 flex-1">
                <span className="group-hover:text-primary line-clamp-2 font-medium transition-colors">
                  {p.title}
                </span>
                <span className="text-muted-foreground mt-1 block text-sm">
                  {p.dateFormatted}
                </span>
              </span>
              <ArrowUpRight
                aria-hidden
                className="text-muted-foreground group-hover:text-primary size-4 shrink-0 transition-colors"
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
