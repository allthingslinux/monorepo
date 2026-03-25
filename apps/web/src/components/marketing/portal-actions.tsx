"use client";

import { buttonVariants } from "@atl/ui/components/button";

import { cn } from "@/lib/utils";

export function PortalActions({
  signInUrl,
  signUpUrl,
}: {
  signInUrl: string;
  signUpUrl: string;
}) {
  return (
    <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-3">
      <a
        className={cn(buttonVariants({ size: "default" }), "w-full sm:w-auto")}
        href={signUpUrl}
        rel="noopener noreferrer"
      >
        Create account
      </a>
      <a
        className={cn(
          buttonVariants({ size: "default", variant: "outline" }),
          "w-full border-border/60 sm:w-auto"
        )}
        href={signInUrl}
        rel="noopener noreferrer"
      >
        Sign in
      </a>
    </div>
  );
}