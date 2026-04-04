"use client";

import Link from "next/link";

import { Button } from "@atl/ui/components/button";

const DISCORD = "https://discord.gg/linux";

export function HomeActions({ className }: { className?: string }) {
  return (
    <div
      className={`mt-8 flex flex-col gap-2.5 sm:mt-9 sm:flex-row sm:flex-wrap sm:gap-3 ${className ?? ""}`}
    >
      <Button
        className="w-full sm:w-auto"
        render={<a href={DISCORD} rel="noopener noreferrer" target="_blank" />}
        size="lg"
      >
        Join Discord
      </Button>
      <Button
        className="border-border/60 w-full bg-transparent sm:w-auto"
        render={<Link href="#portal" />}
        size="lg"
        variant="outline"
      >
        Create Account
      </Button>
    </div>
  );
}
