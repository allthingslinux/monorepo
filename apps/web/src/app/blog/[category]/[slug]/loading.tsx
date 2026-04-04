"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@atl/ui/components/button";
import { Skeleton } from "@atl/ui/components/skeleton";

export default function BlogPostLoading() {
  return (
    <div className="fade-in animate-in fill-mode-forwards opacity-0 delay-300 duration-500">
      <article className="relative container max-w-3xl py-6 lg:py-10">
        <Button
          className="absolute top-14 left-[-200px] hidden xl:inline-flex"
          render={<Link href="/blog" />}
          variant="ghost"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          See all posts
        </Button>

        <Skeleton className="mb-2 h-12 w-3/4 rounded-md" />
        <Skeleton className="mb-6 h-6 w-4/5 rounded-md" />

        <div className="mb-8 flex items-center space-x-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-4 w-40 rounded-md" />
          </div>
        </div>

        <div className="space-y-6">
          {Array.from({ length: 8 }, (_, i) => (
            <div className="space-y-3" key={i}>
              {i % 3 === 0 && <Skeleton className="h-8 w-2/3 rounded-md" />}
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-full rounded-md" />
              {i % 2 === 0 && <Skeleton className="h-4 w-4/5 rounded-md" />}
            </div>
          ))}
        </div>

        <hr className="mt-12" />
        <div className="flex justify-center py-6 lg:py-10">
          <Button disabled variant="ghost">
            <ChevronLeft className="mr-2 h-4 w-4" />
            See all posts
          </Button>
        </div>
      </article>
    </div>
  );
}
