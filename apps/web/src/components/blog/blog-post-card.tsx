import type { BlogPost } from "contentlayer/generated";
import { ArrowUpRight } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import { blogPostAccentClasses } from "@/lib/blog-utils";
import { cn } from "@/lib/utils";
import { Badge } from "@atl/ui/components/badge";

type BlogPostCardProps = {
  className?: string;
  post: BlogPost;
  variant?: "default" | "featured";
};

export function BlogPostCard({
  post,
  variant = "default",
  className,
}: BlogPostCardProps) {
  const href = `/blog/${post.categorySlug}/${post.slug}` as Route;
  const showImage = Boolean(post.image);
  const accent = blogPostAccentClasses(post.categorySlug, post.slug);
  const featured = variant === "featured";

  return (
    <Link
      className={cn(
        "group border-border/80 bg-card/70 ring-border/50 relative flex flex-col overflow-hidden rounded-2xl border shadow-sm ring-1 backdrop-blur-sm transition-all duration-300",
        "hover:border-primary/35 hover:ring-primary/20 hover:shadow-xl",
        featured
          ? "md:min-h-[min(20rem,48vh)] md:flex-row md:items-stretch"
          : "h-full",
        className
      )}
      href={href}
    >
      <div
        className={cn(
          "bg-muted relative isolate shrink-0 overflow-hidden",
          featured
            ? "aspect-[16/9] w-full md:aspect-auto md:min-h-[14rem] md:w-[46%] md:max-w-[min(52%,28rem)] lg:w-[42%]"
            : "aspect-[2/1] min-h-[6rem] w-full"
        )}
      >
        {showImage ? (
          <Image
            alt=""
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            fill
            sizes={
              featured
                ? "(max-width: 768px) 100vw, 45vw"
                : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            }
            src={post.image as string}
            unoptimized
          />
        ) : (
          <>
            <div aria-hidden className={cn("absolute inset-0", accent)} />
            <div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(var(--foreground)_0.5px,transparent_0.5px)] bg-size-[10px_10px] opacity-40 mix-blend-overlay"
            />
            <div
              aria-hidden
              className={cn(
                "from-background via-background/20 absolute inset-0 bg-linear-to-t to-transparent",
                featured &&
                  "md:via-background/30 md:to-background md:bg-linear-to-r md:from-transparent"
              )}
            />
            <span
              aria-hidden
              className="bg-background/25 text-foreground/90 absolute top-4 right-4 flex size-10 items-center justify-center rounded-full opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100"
            >
              <ArrowUpRight className="size-5" />
            </span>
          </>
        )}
      </div>

      <div
        className={cn(
          "flex flex-grow flex-col p-5 sm:p-6",
          featured && "md:justify-center md:py-8 md:pr-8 md:pl-10 lg:py-10"
        )}
      >
        <Badge
          className="border-border/60 bg-muted/40 mb-3 w-fit px-2.5 py-0.5 font-normal"
          variant="outline"
        >
          {post.category}
        </Badge>
        <h2
          className={cn(
            "group-hover:text-primary leading-snug font-semibold tracking-tight transition-colors",
            featured
              ? "text-foreground mb-3 text-2xl md:text-3xl lg:text-[2rem]"
              : "text-foreground mb-2 text-lg sm:text-xl"
          )}
        >
          {featured ? (
            <span className="inline-flex items-start gap-2">
              {post.title}
              <ArrowUpRight
                aria-hidden
                className="text-muted-foreground group-hover:text-primary mt-1 size-5 shrink-0 opacity-70 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </span>
          ) : (
            post.title
          )}
        </h2>
        {post.description ? (
          <p
            className={cn(
              "text-muted-foreground leading-relaxed",
              featured
                ? "line-clamp-4 text-base md:text-lg"
                : "mb-4 line-clamp-3 text-sm sm:text-base"
            )}
          >
            {post.description}
          </p>
        ) : null}
        <div
          className={cn(
            "text-muted-foreground mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 border-t pt-4 text-sm",
            featured ? "border-border/60" : "border-border/50"
          )}
        >
          <span className="text-foreground font-medium">{post.author}</span>
          <span aria-hidden className="text-muted-foreground/60">
            ·
          </span>
          <time dateTime={post.date}>{post.dateFormatted}</time>
        </div>
      </div>
    </Link>
  );
}
