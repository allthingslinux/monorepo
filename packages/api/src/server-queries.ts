// ============================================================================
// Server-Side Query Functions
// ============================================================================
// Server-side query functions for prefetching in Server Components
// These directly query the database instead of making HTTP requests

import "server-only";
import { and, count, desc, eq, gt, ilike, ne, or, sql } from "drizzle-orm";

import type { AuthGetSessionReturn } from "@atl/auth";
import { db } from "@atl/db/client";
import { apikey } from "@atl/db/schema/api-keys";
import { session, user } from "@atl/db/schema/auth";
import { ircAccount } from "@atl/db/schema/irc";
import { mailcowAccount } from "@atl/db/schema/mailcow";
import { mediawikiAccount } from "@atl/db/schema/mediawiki";
import { oauthClient } from "@atl/db/schema/oauth";
import { xmppAccount } from "@atl/db/schema/xmpp";

import type {
  AdminStats,
  ApiKeyListFilters,
  ApiKeyListResponse,
  OAuthClientListFilters,
  OAuthClientListResponse,
  SessionListFilters,
  SessionListResponse,
  User,
  UserListFilters,
  UserListResponse,
  UserListWithIntegrationsResponse,
} from "./types";

/**
 * Fetch users list (server-side)
 */
export async function fetchUsersServer(
  filters?: UserListFilters
): Promise<UserListResponse | UserListWithIntegrationsResponse> {
  const role = filters?.role;
  const banned = filters?.banned;
  const search = filters?.search;
  const limit = filters?.limit ?? 50;
  const offset = filters?.offset ?? 0;
  const expandIntegrations = filters?.expandIntegrations ?? false;

  const conditions: ReturnType<typeof eq | typeof or>[] = [];
  if (role) {
    conditions.push(eq(user.role, role));
  }
  if (banned !== undefined) {
    conditions.push(eq(user.banned, banned));
  }
  if (search) {
    const searchCondition = or(
      ilike(user.email, `%${search}%`),
      ilike(user.name, `%${search}%`),
      ilike(user.username, `%${search}%`)
    );
    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  if (expandIntegrations) {
    const [rows, [totalResult]] = await Promise.all([
      db
        .select({
          banExpires: user.banExpires,
          banReason: user.banReason,
          banned: user.banned,
          createdAt: user.createdAt,
          email: user.email,
          emailVerified: user.emailVerified,
          id: user.id,
          image: user.image,
          ircNick: ircAccount.nick,
          ircStatus: ircAccount.status,
          mailcowEmail: mailcowAccount.email,
          mailcowStatus: mailcowAccount.status,
          mediawikiStatus: mediawikiAccount.status,
          mediawikiWikiUsername: mediawikiAccount.wikiUsername,
          name: user.name,
          role: user.role,
          twoFactorEnabled: user.twoFactorEnabled,
          updatedAt: user.updatedAt,
          username: user.username,
          xmppJid: xmppAccount.jid,
          xmppStatus: xmppAccount.status,
          xmppUsername: xmppAccount.username,
        })
        .from(user)
        .leftJoin(
          ircAccount,
          and(eq(ircAccount.userId, user.id), ne(ircAccount.status, "deleted"))
        )
        .leftJoin(
          xmppAccount,
          and(
            eq(xmppAccount.userId, user.id),
            ne(xmppAccount.status, "deleted")
          )
        )
        .leftJoin(
          mailcowAccount,
          and(
            eq(mailcowAccount.userId, user.id),
            ne(mailcowAccount.status, "deleted")
          )
        )
        .leftJoin(
          mediawikiAccount,
          and(
            eq(mediawikiAccount.userId, user.id),
            ne(mediawikiAccount.status, "deleted")
          )
        )
        .where(whereClause)
        .orderBy(desc(user.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: count() }).from(user).where(whereClause),
    ]);

    const total = totalResult?.count ?? 0;
    const users = rows.map((row) => ({
      banExpires: row.banExpires,
      banReason: row.banReason,
      banned: row.banned,
      createdAt: row.createdAt,
      email: row.email,
      emailVerified: row.emailVerified,
      id: row.id,
      image: row.image,
      ircAccount: row.ircNick
        ? { nick: row.ircNick, status: row.ircStatus }
        : null,
      mailcowAccount: row.mailcowEmail
        ? { email: row.mailcowEmail, status: row.mailcowStatus }
        : null,
      mediawikiAccount: row.mediawikiWikiUsername
        ? {
            status: row.mediawikiStatus,
            wikiUsername: row.mediawikiWikiUsername,
          }
        : null,
      name: row.name,
      role: row.role,
      twoFactorEnabled: row.twoFactorEnabled,
      updatedAt: row.updatedAt,
      username: row.username,
      xmppAccount: row.xmppJid
        ? {
            jid: row.xmppJid,
            status: row.xmppStatus,
            username: row.xmppUsername,
          }
        : null,
    }));

    return {
      pagination: {
        hasMore: offset + limit < total,
        limit,
        offset,
        total: Number(total),
      },
      users,
    };
  }

  const users = await db
    .select()
    .from(user)
    .where(whereClause)
    .orderBy(desc(user.createdAt))
    .limit(limit)
    .offset(offset);

  const [totalResult] = await db
    .select({ count: count() })
    .from(user)
    .where(whereClause);

  const total = totalResult?.count ?? 0;

  return {
    pagination: {
      hasMore: offset + limit < total,
      limit,
      offset,
      total: Number(total),
    },
    users,
  };
}

/**
 * Fetch sessions list (server-side)
 */
export async function fetchSessionsServer(
  filters?: SessionListFilters
): Promise<SessionListResponse> {
  const userIdParam = filters?.userId;
  const active = filters?.active;
  const limit = filters?.limit ?? 100;
  const offset = filters?.offset ?? 0;

  // Build where conditions
  const conditions: ReturnType<typeof eq>[] = [];
  if (userIdParam) {
    conditions.push(eq(session.userId, userIdParam));
  }
  if (active === true) {
    conditions.push(gt(session.expiresAt, new Date()));
  }
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Fetch sessions and join with users
  const sessionsData = await db
    .select({
      session,
      user: {
        email: user.email,
        id: user.id,
        name: user.name,
      },
    })
    .from(session)
    .leftJoin(user, eq(session.userId, user.id))
    .where(whereClause)
    .orderBy(desc(session.createdAt))
    .limit(limit)
    .offset(offset);

  // Transform to match expected format
  const sessions = sessionsData.map((row) => ({
    ...row.session,
    user: row.user?.id ? row.user : undefined,
  }));

  return { sessions };
}

/**
 * Fetch admin statistics (server-side)
 */
export async function fetchAdminStatsServer(): Promise<AdminStats> {
  // Get user stats
  const [userStats] = await db
    .select({
      admins: sql<number>`COUNT(*) FILTER (WHERE ${user.role} = 'admin')`,
      banned: sql<number>`COUNT(*) FILTER (WHERE ${user.banned} = true)`,
      staff: sql<number>`COUNT(*) FILTER (WHERE ${user.role} = 'staff')`,
      total: count(user.id),
    })
    .from(user);

  // Get active sessions count
  const [sessionStats] = await db
    .select({
      active: sql<number>`COUNT(*) FILTER (WHERE ${session.expiresAt} > NOW())`,
      total: count(session.id),
    })
    .from(session);

  // Get API keys count
  const [apiKeyStats] = await db
    .select({
      enabled: sql<number>`COUNT(*) FILTER (WHERE ${apikey.enabled} = true)`,
      total: count(apikey.id),
    })
    .from(apikey);

  // Get OAuth clients count
  const [oauthClientStats] = await db
    .select({
      disabled: sql<number>`COUNT(*) FILTER (WHERE ${oauthClient.disabled} = true)`,
      total: count(oauthClient.id),
    })
    .from(oauthClient);

  return {
    apiKeys: {
      enabled: Number(apiKeyStats.enabled),
      total: Number(apiKeyStats.total),
    },
    oauthClients: {
      disabled: Number(oauthClientStats.disabled),
      total: Number(oauthClientStats.total),
    },
    sessions: {
      active: Number(sessionStats.active),
      total: Number(sessionStats.total),
    },
    users: {
      admins: Number(userStats.admins),
      banned: Number(userStats.banned),
      regular:
        Number(userStats.total) -
        Number(userStats.admins) -
        Number(userStats.staff),
      staff: Number(userStats.staff),
      total: Number(userStats.total),
    },
  };
}

/**
 * Fetch API keys list (server-side)
 */
export async function fetchApiKeysServer(
  filters?: ApiKeyListFilters
): Promise<ApiKeyListResponse> {
  const userIdParam = filters?.userId;
  const enabled = filters?.enabled;
  const limit = filters?.limit ?? 50;
  const offset = filters?.offset ?? 0;

  // Build where conditions
  const conditions: ReturnType<typeof eq>[] = [];
  if (userIdParam) {
    conditions.push(eq(apikey.referenceId, userIdParam));
  }
  if (enabled !== undefined) {
    conditions.push(eq(apikey.enabled, enabled));
  }
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Fetch API keys and join with users
  const apiKeysData = await db
    .select({
      apikey,
      user: {
        email: user.email,
        id: user.id,
        name: user.name,
      },
    })
    .from(apikey)
    .leftJoin(user, eq(apikey.referenceId, user.id))
    .where(whereClause)
    .orderBy(desc(apikey.createdAt))
    .limit(limit)
    .offset(offset);

  // Transform to match expected format
  const apiKeys = apiKeysData.map((row) => ({
    ...row.apikey,
    user: row.user?.id ? row.user : undefined,
  }));

  return { apiKeys };
}

/**
 * Fetch current user's profile (server-side)
 * Used for prefetching user data in Server Components to reduce loading flash
 * Returns a DTO with only necessary fields matching the API route response
 *
 * @param providedSession - Optional session object to avoid duplicate getSession calls.
 *                          If provided, uses this session instead of fetching a new one.
 */
export async function fetchCurrentUserServer(
  providedSession?: AuthGetSessionReturn
): Promise<
  Pick<
    User,
    "id" | "name" | "email" | "image" | "role" | "emailVerified" | "createdAt"
  >
> {
  // If session not provided, fetch it (but prefer passing from verifySession)
  let userSession = providedSession;
  if (!userSession) {
    // Import here to avoid circular dependencies
    const { headers } = await import("next/headers");
    const { auth } = await import("@/auth");

    const requestHeaders = await headers();
    userSession = await auth.api.getSession({
      headers: requestHeaders,
    });
  }

  if (!userSession?.user?.id) {
    throw new Error("Not authenticated");
  }

  // DTO: Only return necessary fields, not entire user object
  const [userData] = await db
    .select({
      createdAt: user.createdAt,
      email: user.email,
      emailVerified: user.emailVerified,
      id: user.id,
      image: user.image,
      name: user.name,
      role: user.role,
    })
    .from(user)
    .where(eq(user.id, userSession.user.id))
    .limit(1);

  if (!userData) {
    throw new Error("User not found");
  }

  return userData;
}

/**
 * Fetch OAuth clients list (server-side)
 */
export async function fetchOAuthClientsServer(
  filters?: OAuthClientListFilters
): Promise<OAuthClientListResponse> {
  const userIdParam = filters?.userId;
  const disabled = filters?.disabled;
  const limit = filters?.limit ?? 50;
  const offset = filters?.offset ?? 0;

  // Build where conditions
  const conditions: ReturnType<typeof eq>[] = [];
  if (userIdParam) {
    conditions.push(eq(oauthClient.userId, userIdParam));
  }
  if (disabled !== undefined) {
    conditions.push(eq(oauthClient.disabled, disabled));
  }
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Fetch OAuth clients and join with users
  const oauthClientsData = await db
    .select({
      oauthClient,
      user: {
        email: user.email,
        id: user.id,
        name: user.name,
      },
    })
    .from(oauthClient)
    .leftJoin(user, eq(oauthClient.userId, user.id))
    .where(whereClause)
    .orderBy(desc(oauthClient.createdAt))
    .limit(limit)
    .offset(offset);

  // Transform to match expected format
  // Note: OAuth client response uses "clients" not "oauthClients"
  // Don't expose client secret in list view (matches API route behavior)
  const clients: OAuthClientListResponse["clients"] = oauthClientsData.map(
    (row) => ({
      ...row.oauthClient,
      clientSecret: undefined as never,
      user: row.user?.id ? row.user : undefined,
    })
  );

  return { clients };
}
