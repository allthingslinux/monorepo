"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import type { Post } from "@/types/blog";
import { Badge } from "@atl/ui/components/badge";
import { Button } from "@atl/ui/components/button";
import { Separator } from "@atl/ui/components/separator";

interface BlogPostsProps {
  categories: string[];
  currentCategory: string;
  initialPosts: Post[];
  page: number;
  totalPages: number;
}

// Memoized BlogPost item component
const BlogPostItem = React.memo(
  ({ post, onNavigate }: { post: Post; onNavigate: () => void }) => (
    <>
      <Link
        className="flex flex-col gap-3 transition-opacity hover:opacity-90"
        href={`/blog/${post.categorySlug}/${post.slug}`}
        onClick={onNavigate}
      >
        <p className="text-muted-foreground text-sm font-semibold">
          {post.category}
        </p>
        <h3 className="text-2xl font-semibold text-balance lg:text-3xl">
          {post.title}
        </h3>
        {post.description && (
          <p className="text-muted-foreground">{post.description}</p>
        )}
        <div className="mt-3 flex items-center gap-2 text-sm">
          <span className="font-medium">{post.author}</span>
          <span className="text-muted-foreground">on {post.dateFormatted}</span>
        </div>
      </Link>
      <Separator className="my-8" />
    </>
  )
);

BlogPostItem.displayName = "BlogPostItem";

// Memoized category button component
const CategoryButton = React.memo(
  ({
    category,
    isActive,
    disabled,
    onClick,
  }: {
    category: string;
    isActive: boolean;
    disabled: boolean;
    onClick: () => void;
  }) => (
    <Button
      className={cn(
        "justify-start text-left",
        isActive &&
          "bg-secondary text-secondary-foreground hover:bg-secondary/80"
      )}
      disabled={disabled}
      onClick={onClick}
      variant="ghost"
    >
      {category}
    </Button>
  )
);

CategoryButton.displayName = "CategoryButton";

export default function BlogPosts({
  initialPosts,
  categories,
  currentCategory,
  page = 1,
  totalPages = 1,
}: BlogPostsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [shouldScrollTop, setShouldScrollTop] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const [currentContent, setCurrentContent] = useState({
    category: currentCategory,
    page,
    posts: initialPosts,
  });

  // Update current content when props change and scroll if needed
  useEffect(() => {
    if (!(isNavigating || loadingPosts)) {
      // Update the current content first
      setCurrentContent({
        category: currentCategory,
        page,
        posts: initialPosts,
      });

      // If shouldScrollTop flag is set, scroll after content update
      if (shouldScrollTop && typeof window !== "undefined") {
        // Use a slight delay to ensure content has updated in the DOM
        const scrollTimer = setTimeout(() => {
          window.scrollTo({
            behavior: "smooth",
            top: 0,
          });
          setShouldScrollTop(false);
        }, 100);

        return () => clearTimeout(scrollTimer);
      }
    }
  }, [
    initialPosts,
    currentCategory,
    page,
    isNavigating,
    loadingPosts,
    shouldScrollTop,
  ]);

  // Reset navigation state when posts or category changes
  useEffect(() => {
    if (isNavigating || loadingPosts) {
      // Use a longer delay to ensure content is loaded before transition ends
      const timer = setTimeout(() => {
        setIsNavigating(false);
        setLoadingPosts(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [initialPosts, currentCategory, page, isNavigating, loadingPosts]);

  // Memoized category change handler
  const handleCategoryChange = useCallback(
    (category: string) => {
      if (category === currentCategory) {
        return;
      }

      // Start transition state
      setIsNavigating(true);
      setLoadingPosts(true);
      setShouldScrollTop(true); // Set flag to scroll on next content update

      // If "All Posts" is selected, go to the main blog page
      if (category === "All Posts") {
        router.prefetch("/blog");
        setTimeout(() => {
          router.push("/blog", { scroll: false });
        }, 50);
        return;
      }

      // For other categories, use the category slug
      const categorySlug = category.toLowerCase().replaceAll(" ", "-");

      // Use shallow routing to avoid full page reload
      router.prefetch(`/blog/${categorySlug}`);

      // Use a slight delay to ensure prefetching happens
      setTimeout(() => {
        router.push(`/blog/${categorySlug}`, { scroll: false });
      }, 50);
    },
    [currentCategory, router]
  );

  // Memoized page change handler
  const handlePageChange = useCallback(
    (newPage: number) => {
      setIsNavigating(true);
      setLoadingPosts(true);
      setShouldScrollTop(true); // Set flag to scroll on next content update

      // Prefetch the new page
      router.prefetch(`${pathname}?page=${newPage}` as Route);

      // Use a slight delay to ensure prefetching happens
      setTimeout(() => {
        // Preserve the current URL path and only update the page parameter
        router.push(`${pathname}?page=${newPage}` as Route, { scroll: false });
      }, 50);
    },
    [pathname, router]
  );

  return (
    <section className="py-16 md:py-24 lg:py-32">
      <div className="container">
        <div className="flex flex-col items-center gap-4 text-center md:gap-6">
          <Badge variant="secondary">Blog</Badge>
          <h1 className="text-3xl font-bold md:text-5xl lg:text-7xl">
            Latest Insights & Updates
          </h1>
          <p className="text-balance md:text-lg lg:text-xl">
            Stay up to date with the latest news, tutorials, and updates from
            the All Things Linux community. Our contributors share their
            knowledge to help you master Linux and open source.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-screen-xl grid-cols-1 gap-10 md:mt-20 md:gap-20 lg:grid-cols-4">
          <div className="hidden flex-col gap-2 lg:flex">
            {categories.map((category) => (
              <CategoryButton
                category={category}
                disabled={isNavigating}
                isActive={currentCategory === category}
                key={category}
                onClick={() => handleCategoryChange(category)}
              />
            ))}
          </div>

          <div
            className="relative min-h-[300px] lg:col-span-3"
            ref={contentRef}
          >
            {currentContent.posts.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground text-lg">
                  No posts found in this category.
                </p>
              </div>
            ) : (
              <>
                {currentContent.posts.map((post) => (
                  <BlogPostItem
                    key={post.slug}
                    onNavigate={() => setIsNavigating(true)}
                    post={post}
                  />
                ))}

                {/* Pagination controls */}
                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center gap-2">
                    <Button
                      disabled={page <= 1 || isNavigating}
                      onClick={() => handlePageChange(page - 1)}
                      variant="outline"
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-4">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      disabled={page >= totalPages || isNavigating}
                      onClick={() => handlePageChange(page + 1)}
                      variant="outline"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* Fixed overlay that stays in position during loading */}
            {(isNavigating || loadingPosts) && (
              <div
                className="bg-background/70 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
                style={{
                  opacity: isNavigating || loadingPosts ? 1 : 0,
                  transition: "opacity 0.3s ease",
                }}
              >
                <div className="bg-background/40 rounded-lg p-8 shadow-lg backdrop-blur-md">
                  <div className="flex flex-col items-center">
                    <svg
                      className="mb-4 h-10 w-10 animate-spin text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        fill="currentColor"
                      />
                    </svg>
                    <p className="text-neutral-200">Loading posts...</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
