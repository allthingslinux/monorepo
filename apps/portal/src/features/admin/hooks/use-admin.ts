"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  deleteApiKey,
  deleteOAuthClient,
  deleteSession,
  deleteUser,
  fetchAdminStats,
  fetchApiKeyById,
  fetchApiKeys,
  fetchIrcAccounts,
  fetchMailcowAccounts,
  fetchMediawikiAccounts,
  fetchOAuthClientById,
  fetchOAuthClients,
  fetchSessionById,
  fetchSessions,
  fetchUserById,
  fetchUsers,
  fetchXmppAccounts,
  updateUser,
} from "@/features/admin/api/admin";
import { usersListQueryOptions } from "@/features/admin/lib/users-query-options";
import { queryKeys } from "@atl/api/query-keys";
import type {
  AdminUserDetailResponse,
  SessionListFilters,
  UpdateUserInput,
  UserListFilters,
} from "@atl/api/types";
import { QUERY_CACHE } from "@atl/utils/constants";

// ============================================================================
// Admin Hooks
// ============================================================================
// TanStack Query hooks for admin operations

// Users
export function useUsers(filters?: UserListFilters) {
  return useQuery({
    ...usersListQueryOptions(filters),
    queryFn: () => fetchUsers(filters),
  });
}

export function useUser(userId: string | null) {
  return useQuery<AdminUserDetailResponse, Error>({
    enabled: !!userId,
    queryFn: () => {
      if (!userId) {
        throw new Error("No userId");
      }
      return fetchUserById(userId);
    },
    queryKey: queryKeys.users.detail(userId ?? ""),
    staleTime: QUERY_CACHE.STALE_TIME_DEFAULT,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserInput }) =>
      updateUser(id, data),
    onSuccess: (data, variables) => {
      // Merge updated user into existing user detail cache (preserve ircAccount, mailcowAccount, xmppAccount)
      // Only merge when prev exists; avoid creating incomplete cache entries with null integrations
      queryClient.setQueryData<AdminUserDetailResponse>(
        queryKeys.users.detail(variables.id),
        (prev) =>
          prev
            ? ({
                ...prev,
                user: data as unknown as AdminUserDetailResponse["user"],
              } as AdminUserDetailResponse)
            : undefined
      );
      // Invalidate users list to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: (_, userId) => {
      // Remove deleted user from cache
      queryClient.removeQueries({ queryKey: queryKeys.users.detail(userId) });
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() });
    },
  });
}

// Sessions
export function useSessions(filters?: SessionListFilters) {
  return useQuery({
    queryFn: () => fetchSessions(filters),
    queryKey: queryKeys.sessions.list(filters),
    staleTime: QUERY_CACHE.STALE_TIME_SHORT,
  });
}

export function useSession(sessionId: string) {
  return useQuery({
    enabled: !!sessionId,
    queryFn: () => fetchSessionById(sessionId),
    queryKey: queryKeys.sessions.detail(sessionId),
    staleTime: QUERY_CACHE.STALE_TIME_DEFAULT,
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSession,
    onSuccess: (_, sessionId) => {
      // Remove deleted session from cache
      queryClient.removeQueries({
        queryKey: queryKeys.sessions.detail(sessionId),
      });
      // Invalidate sessions list
      queryClient.invalidateQueries({
        queryKey: queryKeys.sessions.lists(),
      });
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() });
    },
  });
}

// Stats
export function useAdminStats() {
  return useQuery({
    queryFn: fetchAdminStats,
    queryKey: queryKeys.admin.stats(),
    staleTime: QUERY_CACHE.STALE_TIME_DEFAULT,
  });
}

// API Keys (Admin - all users)
export function useAdminApiKeys(filters?: {
  userId?: string;
  enabled?: boolean;
}) {
  return useQuery({
    queryFn: () => fetchApiKeys(filters),
    queryKey: queryKeys.apiKeys.list(filters?.userId),
    staleTime: QUERY_CACHE.STALE_TIME_SHORT,
  });
}

export function useAdminApiKey(keyId: string) {
  return useQuery({
    enabled: !!keyId,
    queryFn: () => fetchApiKeyById(keyId),
    queryKey: queryKeys.apiKeys.detail(keyId),
    staleTime: QUERY_CACHE.STALE_TIME_DEFAULT,
  });
}

export function useDeleteAdminApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteApiKey,
    onSuccess: (_data, keyId) => {
      // Remove deleted API key from cache
      queryClient.removeQueries({
        queryKey: queryKeys.apiKeys.detail(keyId),
      });
      // Invalidate API keys list
      queryClient.invalidateQueries({
        queryKey: queryKeys.apiKeys.lists(),
      });
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() });
    },
  });
}

// OAuth Clients (Admin - all users)
export function useAdminOAuthClients(filters?: {
  userId?: string;
  disabled?: boolean;
}) {
  return useQuery({
    queryFn: () => fetchOAuthClients(filters),
    queryKey: queryKeys.oauthClients.list(filters),
    staleTime: QUERY_CACHE.STALE_TIME_SHORT,
  });
}

export function useAdminOAuthClient(clientId: string) {
  return useQuery({
    enabled: !!clientId,
    queryFn: () => fetchOAuthClientById(clientId),
    queryKey: queryKeys.oauthClients.detail(clientId),
    staleTime: QUERY_CACHE.STALE_TIME_DEFAULT,
  });
}

export function useDeleteAdminOAuthClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteOAuthClient,
    onSuccess: (_data, clientId) => {
      // Remove deleted OAuth client from cache
      queryClient.removeQueries({
        queryKey: queryKeys.oauthClients.detail(clientId),
      });
      // Invalidate OAuth clients list
      queryClient.invalidateQueries({
        queryKey: queryKeys.oauthClients.lists(),
      });
    },
  });
}

// IRC accounts (admin list)
export function useAdminIrcAccounts(filters?: {
  status?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryFn: () => fetchIrcAccounts(filters),
    queryKey: queryKeys.admin.ircAccounts.list(filters),
    staleTime: QUERY_CACHE.STALE_TIME_SHORT,
  });
}

// XMPP accounts (admin list)
export function useAdminXmppAccounts(filters?: {
  status?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryFn: () => fetchXmppAccounts(filters),
    queryKey: queryKeys.admin.xmppAccounts.list(filters),
    staleTime: QUERY_CACHE.STALE_TIME_SHORT,
  });
}

// mailcow accounts (admin list)
export function useAdminMailcowAccounts(filters?: {
  status?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryFn: () => fetchMailcowAccounts(filters),
    queryKey: queryKeys.admin.mailcowAccounts.list(filters),
    staleTime: QUERY_CACHE.STALE_TIME_SHORT,
  });
}

// MediaWiki accounts (admin list)
export function useAdminMediawikiAccounts(filters?: {
  status?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryFn: () => fetchMediawikiAccounts(filters),
    queryKey: queryKeys.admin.mediawikiAccounts.list(filters),
    staleTime: QUERY_CACHE.STALE_TIME_SHORT,
  });
}
