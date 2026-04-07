"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createIntegrationAccount,
  deleteIntegrationAccount,
  fetchIntegrationAccount,
  fetchIntegrationAccountById,
  fetchIntegrations,
  resetIntegrationPassword,
  updateIntegrationAccount,
} from "@/features/integrations/api/integrations";
import { queryKeys } from "@atl/api/query-keys";
import { QUERY_CACHE } from "@atl/utils/constants";

/**
 * Fetch available integrations.
 */
export function useIntegrations() {
  return useQuery({
    queryFn: fetchIntegrations,
    queryKey: queryKeys.integrations.list(),
    staleTime: QUERY_CACHE.STALE_TIME_DEFAULT,
  });
}

/**
 * Fetch current user's integration account.
 */
export function useIntegrationAccount<TAccount>(integrationId: string) {
  return useQuery({
    enabled: !!integrationId,
    queryFn: () => fetchIntegrationAccount<TAccount>(integrationId),
    queryKey: queryKeys.integrations.accounts.current(integrationId),
    staleTime: QUERY_CACHE.STALE_TIME_SHORT,
  });
}

/**
 * Fetch a specific integration account by ID.
 */
export function useIntegrationAccountById<TAccount>(
  integrationId: string,
  id: string
) {
  return useQuery({
    enabled: !!integrationId && !!id,
    queryFn: () => fetchIntegrationAccountById<TAccount>(integrationId, id),
    queryKey: queryKeys.integrations.accounts.detail(integrationId, id),
    staleTime: QUERY_CACHE.STALE_TIME_DEFAULT,
  });
}

/**
 * Create a new integration account for the current user.
 */
export function useCreateIntegrationAccount<
  TAccount,
  TCreateInput = Record<string, unknown>,
>(integrationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: TCreateInput) =>
      createIntegrationAccount<TAccount, TCreateInput>(integrationId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.integrations.accounts.current(integrationId),
      });
    },
  });
}

/**
 * Update an integration account.
 */
export function useUpdateIntegrationAccount<
  TAccount,
  TUpdateInput = Record<string, unknown>,
>(integrationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: TUpdateInput }) =>
      updateIntegrationAccount<TAccount, TUpdateInput>(
        integrationId,
        id,
        input
      ),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        queryKeys.integrations.accounts.detail(integrationId, variables.id),
        data
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.integrations.accounts.current(integrationId),
      });
    },
  });
}

/**
 * Delete an integration account.
 */
export function useDeleteIntegrationAccount(integrationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteIntegrationAccount(integrationId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.integrations.accounts.all(integrationId),
      });
    },
  });
}

/**
 * Reset the password for an integration account.
 * For XMPP: pass the user's chosen password.
 * For IRC: no password needed — Atheme generates one.
 */
export function useResetIntegrationPassword(integrationId: string) {
  return useMutation({
    mutationFn: ({ id, password }: { id: string; password?: string }) =>
      resetIntegrationPassword(integrationId, id, password),
  });
}
