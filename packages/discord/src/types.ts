import type { APIGuildMember } from "discord-api-types/v10";

import type { DiscordHttpError } from "./errors";

export type {
  APIMessage,
  APIGuildMember,
  AuditLogEvent,
  RESTGetAPIChannelMessagesResult,
  RESTGetAPIAuditLogResult,
  RESTGetAPIGuildBanResult,
  RESTGetAPIGuildBansResult,
  RESTGetAPIGuildChannelsResult,
  RESTGetAPIGuildEmojisResult,
  RESTGetAPIGuildInvitesResult,
  RESTGetAPIGuildMemberResult,
  RESTGetAPIGuildMembersResult,
  RESTGetAPIGuildMembersSearchResult,
  RESTGetAPIGuildPreviewResult,
  RESTGetAPIGuildResult,
  RESTGetAPIGuildRolesResult,
  RESTGetAPIGuildScheduledEventsResult,
  RESTGetAPIGuildStickersResult,
  RESTGetAPIGuildWidgetJSONResult,
} from "discord-api-types/v10";

// ---------------------------------------------------------------------------
// Branded types
// ---------------------------------------------------------------------------

type Brand<T, B extends string> = T & { readonly __brand: B };

/** A Discord ID (snowflake) — a 64-bit unsigned integer encoded as a string. */
export type Snowflake = Brand<string, "Snowflake">;

/** Cast a plain string to Snowflake. Use only at system boundaries (env vars, user input). */
export function toSnowflake(id: string): Snowflake {
  return id as Snowflake;
}

// ---------------------------------------------------------------------------
// Result type
// ---------------------------------------------------------------------------

export type Result<T, E = DiscordHttpError> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E>(error: E): Result<never, E> {
  return { error, ok: false };
}

// ---------------------------------------------------------------------------
// Config & options
// ---------------------------------------------------------------------------

export interface DiscordClientConfig {
  /** Bot token from the Discord Developer Portal. Must be non-empty. */
  token: string;
  /** Default revalidation time in seconds for Next.js data cache. Defaults to 60. */
  defaultRevalidate?: number | false;
}

/** Next.js fetch cache options — typed locally to avoid a hard next dependency. */
export interface CacheOptions {
  revalidate?: number | false;
  tags?: string[];
}

export interface ListMembersOptions {
  /** Max members per page. Discord cap is 1000. Defaults to 100. */
  limit?: number;
  /** Paginate after this user ID (snowflake). */
  after?: Snowflake;
}

export interface ListAuditLogOptions {
  /** Filter by action type (use the AuditLogEvent enum). */
  action_type?: number;
  /** Filter by user ID. */
  user_id?: Snowflake;
  /** Paginate before this entry ID. */
  before?: Snowflake;
  /** Paginate after this entry ID. */
  after?: Snowflake;
  /** Max entries to return. Discord cap is 100. Defaults to 50. */
  limit?: number;
}

export interface SearchMembersOptions {
  /** Username or nickname to search. */
  query: string;
  /** Max results. Discord cap is 1000. Defaults to 1. */
  limit?: number;
}

export interface ListChannelMessagesOptions {
  /** One of `around`, `before`, or `after` can be used for pagination anchors. */
  around?: Snowflake;
  /** Return messages before this message id. */
  before?: Snowflake;
  /** Return messages after this message id. */
  after?: Snowflake;
  /** Max messages to return. Discord cap is 100. Defaults to 50. */
  limit?: number;
  /** Per-request Next.js cache controls. */
  cache?: CacheOptions;
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

export interface MembersPage {
  members: APIGuildMember[];
  /** True if there are more pages. Use nextCursor to fetch the next page. */
  hasMore: boolean;
  /** Pass as `after` in the next listGuildMembers call to continue pagination. */
  nextCursor?: Snowflake;
}
