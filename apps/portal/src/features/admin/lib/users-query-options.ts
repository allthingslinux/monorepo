/**
 * Users list query options factory.
 * Shared by useUsers (client) and admin page prefetch (server); queryFn is supplied by each caller.
 */

import { keepPreviousData } from "@tanstack/react-query";

import { queryKeys } from "@atl/api/query-keys";
import type { UserListFilters } from "@atl/api/types";
import { QUERY_CACHE } from "@atl/utils/constants";

export function usersListQueryOptions(filters?: UserListFilters) {
  return {
    placeholderData: keepPreviousData,
    queryKey: queryKeys.users.list(filters),
    staleTime: QUERY_CACHE.STALE_TIME_SHORT,
  };
}
