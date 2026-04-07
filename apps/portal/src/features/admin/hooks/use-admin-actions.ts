"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { queryKeys } from "@atl/api/query-keys";
import { authClient } from "@atl/auth/client";

// ============================================================================
// Admin Action Hooks
// ============================================================================
// TanStack Query hooks wrapping Better Auth admin methods
// These are for admin-only actions that use Better Auth's admin plugin

/**
 * Set user role mutation
 */
export function useSetUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role: "user" | "staff" | "admin";
    }) => {
      const result = await authClient.admin.setRole({
        role,
        userId,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      return result.data;
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update user role");
    },
    onSuccess: (_, variables) => {
      // Invalidate user detail
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(variables.userId),
      });
      // Invalidate users list
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.lists(),
      });
      // Invalidate stats
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.stats(),
      });
      toast.success("User role updated");
    },
  });
}

/**
 * Ban user mutation
 */
export function useBanUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      banReason,
    }: {
      userId: string;
      banReason?: string;
    }) => {
      const result = await authClient.admin.banUser({
        banReason: banReason || "Banned by admin",
        userId,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      return result.data;
    },
    onError: (error) => {
      toast.error(error.message || "Failed to ban user");
    },
    onSuccess: (_, variables) => {
      // Invalidate user detail
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(variables.userId),
      });
      // Invalidate users list
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.lists(),
      });
      // Invalidate stats
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.stats(),
      });
      toast.success("User banned");
    },
  });
}

/**
 * Unban user mutation
 */
export function useUnbanUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const result = await authClient.admin.unbanUser({
        userId,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      return result.data;
    },
    onError: (error) => {
      toast.error(error.message || "Failed to unban user");
    },
    onSuccess: (_, userId) => {
      // Invalidate user detail
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(userId),
      });
      // Invalidate users list
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.lists(),
      });
      // Invalidate stats
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.stats(),
      });
      toast.success("User unbanned");
    },
  });
}
