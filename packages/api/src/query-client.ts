import { QUERY_CACHE } from "@atl/utils/constants";
import {
  defaultShouldDehydrateQuery,
  isServer,
  QueryClient,
} from "@tanstack/react-query";

/**
 * Create a new QueryClient instance with default options for SSR
 * This configuration supports streaming with pending queries
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      dehydrate: {
        // Include pending queries in dehydration for streaming support
        // This allows us to kick off prefetches without awaiting them
        // The data will stream to the client as queries resolve
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
        shouldRedactErrors: () => false,
      },
      queries: {
        gcTime: QUERY_CACHE.GC_TIME_DEFAULT,
        // Refetch on window focus is good for keeping data fresh
        refetchOnWindowFocus: true,
        retry: 0, // No retries by default
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: QUERY_CACHE.STALE_TIME_DEFAULT,
      },
    },
  });
}

// Browser QueryClient singleton (client-side only)
let browserQueryClient: QueryClient | undefined;

/**
 * Get QueryClient instance
 * - Server: Creates a new instance for each request (isolated cache)
 *   This ensures data is not shared between different users and requests
 * - Client: Returns singleton instance (shared cache)
 *
 * This function can be called from both Server Components and Client Components.
 * In Server Components, it creates a fresh QueryClient per request.
 * In Client Components, it returns a singleton that persists across renders.
 */
export function getQueryClient() {
  if (isServer) {
    // Server: always return a fresh QueryClient
    // This ensures data is not shared between different users and requests
    return makeQueryClient();
  }
  // Client: return singleton instance
  // This is very important, so we don't re-make a new client if React
  // suspends during the initial render. This may not be needed if we
  // have a suspense boundary BELOW the creation of the query client
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}
