// ============================================================================
// Query Keys Factory
// ============================================================================
// Centralized query key factory for type-safe query key management.
// Follows TanStack Query best practices for hierarchical query keys.

import type {
  OAuthClientListFilters,
  SessionListFilters,
  UserListFilters,
} from "./types";

export const queryKeys = {
  // Admin queries
  admin: {
    all: ["admin"] as const,
    dashboard: () => [...queryKeys.admin.all, "dashboard"] as const,
    ircAccounts: {
      list: (filters?: { status?: string; limit?: number; offset?: number }) =>
        [...queryKeys.admin.ircAccounts.lists(), { filters }] as const,
      lists: () => [...queryKeys.admin.all, "ircAccounts", "list"] as const,
    },
    mailcowAccounts: {
      list: (filters?: { status?: string; limit?: number; offset?: number }) =>
        [...queryKeys.admin.mailcowAccounts.lists(), { filters }] as const,
      lists: () => [...queryKeys.admin.all, "mailcowAccounts", "list"] as const,
    },
    mediawikiAccounts: {
      list: (filters?: { status?: string; limit?: number; offset?: number }) =>
        [...queryKeys.admin.mediawikiAccounts.lists(), { filters }] as const,
      lists: () =>
        [...queryKeys.admin.all, "mediawikiAccounts", "list"] as const,
    },
    stats: () => [...queryKeys.admin.all, "stats"] as const,
    xmppAccounts: {
      list: (filters?: { status?: string; limit?: number; offset?: number }) =>
        [...queryKeys.admin.xmppAccounts.lists(), { filters }] as const,
      lists: () => [...queryKeys.admin.all, "xmppAccounts", "list"] as const,
    },
  },

  // API Key queries
  apiKeys: {
    all: ["apiKeys"] as const,
    detail: (id: string) => [...queryKeys.apiKeys.details(), id] as const,
    details: () => [...queryKeys.apiKeys.all, "detail"] as const,
    list: (userId?: string) =>
      [...queryKeys.apiKeys.lists(), { userId }] as const,
    lists: () => [...queryKeys.apiKeys.all, "list"] as const,
    user: (userId: string) =>
      [...queryKeys.apiKeys.all, "user", userId] as const,
  },

  // Integration queries
  integrations: {
    accounts: {
      all: (integrationId: string) =>
        [...queryKeys.integrations.all, integrationId, "accounts"] as const,
      current: (integrationId: string) =>
        [
          ...queryKeys.integrations.accounts.all(integrationId),
          "current",
        ] as const,
      detail: (integrationId: string, id: string) =>
        [
          ...queryKeys.integrations.accounts.details(integrationId),
          id,
        ] as const,
      details: (integrationId: string) =>
        [
          ...queryKeys.integrations.accounts.all(integrationId),
          "detail",
        ] as const,
    },
    all: ["integrations"] as const,
    list: () => [...queryKeys.integrations.lists()] as const,
    lists: () => [...queryKeys.integrations.all, "list"] as const,
  },

  // OAuth Client queries
  oauthClients: {
    all: ["oauthClients"] as const,
    detail: (id: string) => [...queryKeys.oauthClients.details(), id] as const,
    details: () => [...queryKeys.oauthClients.all, "detail"] as const,
    list: (filters?: OAuthClientListFilters) =>
      [...queryKeys.oauthClients.lists(), { filters }] as const,
    lists: () => [...queryKeys.oauthClients.all, "list"] as const,
    user: (userId: string) =>
      [...queryKeys.oauthClients.all, "user", userId] as const,
  },

  // Dashboard (portal app) — client refetch after navigation
  portal: {
    all: ["portal"] as const,
    changelog: () => [...queryKeys.portal.all, "changelog"] as const,
    events: () => [...queryKeys.portal.all, "events"] as const,
    feed: () => [...queryKeys.portal.all, "feed"] as const,
  },

  // Session queries
  sessions: {
    all: ["sessions"] as const,
    current: () => [...queryKeys.sessions.all, "current"] as const,
    detail: (id: string) => [...queryKeys.sessions.details(), id] as const,
    details: () => [...queryKeys.sessions.all, "detail"] as const,
    list: (filters?: SessionListFilters) =>
      [...queryKeys.sessions.lists(), { filters }] as const,
    lists: () => [...queryKeys.sessions.all, "list"] as const,
    user: (userId: string) =>
      [...queryKeys.sessions.all, "user", userId] as const,
  },

  // User queries
  users: {
    all: ["users"] as const,
    current: () => [...queryKeys.users.all, "current"] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
    details: () => [...queryKeys.users.all, "detail"] as const,
    list: (filters?: UserListFilters) =>
      [...queryKeys.users.lists(), { filters }] as const,
    lists: () => [...queryKeys.users.all, "list"] as const,
    stats: () => [...queryKeys.users.all, "stats"] as const,
  },
} as const;
