"use client";

import { Button } from "@atl/ui/components/button";

export function PortalActions({
  signInUrl,
  signUpUrl,
}: {
  signInUrl: string;
  signUpUrl: string;
}) {
  return (
    <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-3">
      <Button
        className="w-full sm:w-auto"
        render={<a href={signUpUrl} rel="noopener noreferrer" />}
        size="default"
      >
        Create account
      </Button>
      <Button
        className="border-border/60 w-full sm:w-auto"
        render={<a href={signInUrl} rel="noopener noreferrer" />}
        size="default"
        variant="outline"
      >
        Sign in
      </Button>
    </div>
  );
}
