import type { BlogPost } from "contentlayer/generated";
import type { Route } from "next";
import Link from "next/link";

import { cn } from "@/lib/utils";

import {
  blogArticleSidePanelClassName,
  blogArticleSideRailWidthClassName,
  blogCategoryPillActiveClassName,
  blogCategoryPillBaseClassName,
  blogCategoryPillDenseClassName,
} from "./blog-shell";

type BlogArticleMetaAsideProps = {
  post: BlogPost;
};

export function BlogArticleMetaAside({ post }: BlogArticleMetaAsideProps) {
  return (
    <aside
      aria-label="Article details"
      className={cn(
        blogArticleSideRailWidthClassName,
        "order-2 lg:sticky lg:top-24 lg:order-none lg:self-start"
      )}
    >
      <div
        className={cn(
          blogArticleSidePanelClassName,
          "flex h-fit flex-col gap-6"
        )}
      >
        <div>
          <h2 className="text-sm font-semibold">Category</h2>
          <Link
            className={cn(
              blogCategoryPillBaseClassName,
              blogCategoryPillDenseClassName,
              blogCategoryPillActiveClassName,
              "mt-2"
            )}
            href={`/blog/${post.categorySlug}` as Route}
          >
            {post.category}
          </Link>
        </div>
        <div>
          <h2 className="text-sm font-semibold">Published</h2>
          <time
            className="text-muted-foreground mt-2 block text-sm"
            dateTime={post.date}
          >
            {post.dateFormatted}
          </time>
        </div>
        <div>
          <h2 className="text-sm font-semibold">Author</h2>
          <p className="text-muted-foreground mt-2 text-sm">{post.author}</p>
        </div>
      </div>
    </aside>
  );
}
