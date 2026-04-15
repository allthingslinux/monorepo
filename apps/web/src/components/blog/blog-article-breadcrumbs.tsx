import type { BlogPost } from "contentlayer/generated";
import type { Route } from "next";
import Link from "next/link";

import { cn } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@atl/ui/components/breadcrumb";

const linkClass = "hover:text-foreground transition-colors";

type BlogArticleBreadcrumbsProps = {
  post: BlogPost;
};

export function BlogArticleBreadcrumbs({ post }: BlogArticleBreadcrumbsProps) {
  return (
    <Breadcrumb className="flex justify-center">
      <BreadcrumbList className="justify-center">
        <BreadcrumbItem>
          <Link className={cn(linkClass)} href={"/" as Route}>
            Home
          </Link>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <Link className={cn(linkClass)} href={"/blog" as Route}>
            Blog
          </Link>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <Link
            className={cn(linkClass)}
            href={`/blog/${post.categorySlug}` as Route}
          >
            {post.category}
          </Link>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className="line-clamp-2 max-w-[min(100%,22rem)] text-center">
            {post.title}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
