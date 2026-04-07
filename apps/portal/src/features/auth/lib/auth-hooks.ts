"use client";

import { createAuthHooks } from "@daveyplate/better-auth-tanstack";

import { authClient } from "./client";

/**
 * TanStack Query-backed auth hooks.
 * Uses AuthQueryProvider's staleTime (default 60s) to avoid
 * redundant /api/auth/get-session calls on every re-render.
 */
const authHooks = createAuthHooks(authClient);
export const { useSession: useAuthSession } = authHooks;
