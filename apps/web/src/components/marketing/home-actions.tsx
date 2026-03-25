"use client";

import { buttonVariants } from "@atl/ui/components/button";
import Link from "next/link";

import { cn } from "@/lib/utils";

const DISCORD = "https://discord.gg/linux";

export function HomeActions({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "mt-8 flex flex-col gap-2.5 sm:mt-9 sm:flex-row sm:flex-wrap sm:gap-3",
        className
      )}
    >
      <a
        className={cn(buttonVariants({ size: "default" }), "w-full sm:w-auto")}
        href={DISCORD}
        rel="noopener noreferrer"
        target="_blank"
      >
        Join Discord
      </a>
      <Link
        className={cn(
          buttonVariants({ size: "default", variant: "outline" }),
          "w-full border-border/60 bg-transparent sm:w-auto"
        )}
        href="#portal"
      >
        Portal
      </Link>
      <Link
        className={cn(
          buttonVariants({ size: "default", variant: "ghost" }),
          "w-full text-muted-foreground sm:w-auto"
        )}
        href="#ecosystem"
      >
        Explore projects
      </Link>
    </div>
  );
}