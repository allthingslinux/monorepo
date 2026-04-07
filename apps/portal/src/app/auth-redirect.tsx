"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Client component that redirects immediately when rendered.
 * Used inside <SignedIn> to send authenticated users to /app.
 */
export function AuthRedirect({ to }: { to: string }) {
  const router = useRouter();

  useEffect(() => {
    router.replace(to as Route);
  }, [router, to]);

  return null;
}
