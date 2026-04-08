import "server-only";
import type {
  APIGuildMember,
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

import { DiscordHttpError } from "./errors.js";
import { err, ok, toSnowflake } from "./types.js";
import type {
  CacheOptions,
  DiscordClientConfig,
  ListAuditLogOptions,
  ListMembersOptions,
  MembersPage,
  Result,
  SearchMembersOptions,
  Snowflake,
} from "./types.js";

const DISCORD_API = "https://discord.com/api/v10";

export class DiscordClient {
  private readonly defaultRevalidate: number | false;
  private readonly token: string;

  constructor(config: DiscordClientConfig) {
    if (!config.token) {
      throw new Error(
        "DiscordClient: token must be a non-empty string. " +
          "Check that DISCORD_BOT_TOKEN is set in your environment."
      );
    }
    this.token = config.token;
    this.defaultRevalidate = config.defaultRevalidate ?? 60;
  }

  private async fetch<T>(
    path: string,
    cache?: CacheOptions
  ): Promise<Result<T>> {
    // `next` is a Next.js extension to RequestInit for data cache control.
    // Typed locally to avoid a hard dependency on Next.js types.
    const init: RequestInit & { next?: CacheOptions } = {
      headers: {
        Authorization: `Bot ${this.token}`,
        "Content-Type": "application/json",
      },
      next: { revalidate: this.defaultRevalidate, ...cache },
    };

    let res: Response;
    try {
      res = await fetch(`${DISCORD_API}${path}`, init as RequestInit);
    } catch (error) {
      // Network-level failure (DNS, connection refused, etc.)
      return err(new DiscordHttpError(0, String(error), path));
    }

    if (!res.ok) {
      return err(new DiscordHttpError(res.status, await res.text(), path));
    }

    return ok((await res.json()) as T);
  }

  // ---------------------------------------------------------------------------
  // Guild
  // ---------------------------------------------------------------------------

  async getGuild(
    guildId: Snowflake,
    withCounts = true
  ): Promise<Result<RESTGetAPIGuildResult>> {
    return this.fetch(`/guilds/${guildId}?with_counts=${withCounts}`);
  }

  async getGuildPreview(
    guildId: Snowflake
  ): Promise<Result<RESTGetAPIGuildPreviewResult>> {
    return this.fetch(`/guilds/${guildId}/preview`);
  }

  async getGuildWidget(
    guildId: Snowflake
  ): Promise<Result<RESTGetAPIGuildWidgetJSONResult>> {
    return this.fetch(`/guilds/${guildId}/widget.json`);
  }

  // ---------------------------------------------------------------------------
  // Channels
  // ---------------------------------------------------------------------------

  async getGuildChannels(
    guildId: Snowflake
  ): Promise<Result<RESTGetAPIGuildChannelsResult>> {
    return this.fetch(`/guilds/${guildId}/channels`);
  }

  // ---------------------------------------------------------------------------
  // Roles
  // ---------------------------------------------------------------------------

  async getGuildRoles(
    guildId: Snowflake
  ): Promise<Result<RESTGetAPIGuildRolesResult>> {
    return this.fetch(`/guilds/${guildId}/roles`);
  }

  // ---------------------------------------------------------------------------
  // Members
  // ---------------------------------------------------------------------------

  async getGuildMember(
    guildId: Snowflake,
    userId: Snowflake
  ): Promise<Result<RESTGetAPIGuildMemberResult>> {
    return this.fetch(`/guilds/${guildId}/members/${userId}`);
  }

  async listGuildMembers(
    guildId: Snowflake,
    options: ListMembersOptions = {}
  ): Promise<Result<MembersPage>> {
    const limit = Math.min(options.limit ?? 100, 1000);
    const params = new URLSearchParams({ limit: String(limit) });
    if (options.after !== undefined) {
      params.set("after", options.after);
    }

    const result = await this.fetch<RESTGetAPIGuildMembersResult>(
      `/guilds/${guildId}/members?${params.toString()}`
    );
    if (!result.ok) {
      return result;
    }

    const members = result.value;
    const hasMore = members.length === limit;
    const lastId = members.at(-1)?.user?.id;

    return ok({
      hasMore,
      members,
      nextCursor: hasMore && lastId ? toSnowflake(lastId) : undefined,
    });
  }

  async searchGuildMembers(
    guildId: Snowflake,
    options: SearchMembersOptions
  ): Promise<Result<RESTGetAPIGuildMembersSearchResult>> {
    const params = new URLSearchParams({ query: options.query });
    if (options.limit !== undefined) {
      params.set("limit", String(Math.min(options.limit, 1000)));
    }
    return this.fetch(`/guilds/${guildId}/members/search?${params.toString()}`);
  }

  /**
   * Fetch all members by auto-paginating sequentially (1000/page).
   * Does not use Next.js data cache — use listGuildMembers for cached pages.
   */
  async listAllGuildMembers(
    guildId: Snowflake
  ): Promise<Result<APIGuildMember[]>> {
    const all: APIGuildMember[] = [];
    let after: Snowflake | undefined;

    while (true) {
      const result = await this.listGuildMembers(guildId, {
        after,
        limit: 1000,
      });
      if (!result.ok) {
        return result;
      }

      const { hasMore, members, nextCursor } = result.value;
      all.push(...members);
      if (!hasMore) {
        break;
      }
      after = nextCursor;
    }

    return ok(all);
  }

  // ---------------------------------------------------------------------------
  // Bans
  // ---------------------------------------------------------------------------

  async getGuildBans(
    guildId: Snowflake
  ): Promise<Result<RESTGetAPIGuildBansResult>> {
    return this.fetch(`/guilds/${guildId}/bans`);
  }

  async getGuildBan(
    guildId: Snowflake,
    userId: Snowflake
  ): Promise<Result<RESTGetAPIGuildBanResult>> {
    return this.fetch(`/guilds/${guildId}/bans/${userId}`);
  }

  // ---------------------------------------------------------------------------
  // Audit Log
  // ---------------------------------------------------------------------------

  async getAuditLog(
    guildId: Snowflake,
    options: ListAuditLogOptions = {}
  ): Promise<Result<RESTGetAPIAuditLogResult>> {
    const params = new URLSearchParams();
    if (options.action_type !== undefined) {
      params.set("action_type", String(options.action_type));
    }
    if (options.user_id !== undefined) {
      params.set("user_id", options.user_id);
    }
    if (options.before !== undefined) {
      params.set("before", options.before);
    }
    if (options.after !== undefined) {
      params.set("after", options.after);
    }
    if (options.limit !== undefined) {
      params.set("limit", String(Math.min(options.limit, 100)));
    }
    const qs = params.size > 0 ? `?${params.toString()}` : "";
    // Audit logs change frequently — shorter revalidation than the default.
    return this.fetch(`/guilds/${guildId}/audit-logs${qs}`, {
      revalidate: 30,
    });
  }

  // ---------------------------------------------------------------------------
  // Invites
  // ---------------------------------------------------------------------------

  async getGuildInvites(
    guildId: Snowflake
  ): Promise<Result<RESTGetAPIGuildInvitesResult>> {
    return this.fetch(`/guilds/${guildId}/invites`);
  }

  // ---------------------------------------------------------------------------
  // Emojis & Stickers
  // ---------------------------------------------------------------------------

  async getGuildEmojis(
    guildId: Snowflake
  ): Promise<Result<RESTGetAPIGuildEmojisResult>> {
    return this.fetch(`/guilds/${guildId}/emojis`);
  }

  async getGuildStickers(
    guildId: Snowflake
  ): Promise<Result<RESTGetAPIGuildStickersResult>> {
    return this.fetch(`/guilds/${guildId}/stickers`);
  }

  // ---------------------------------------------------------------------------
  // Scheduled Events
  // ---------------------------------------------------------------------------

  async getGuildScheduledEvents(
    guildId: Snowflake,
    withUserCount = false
  ): Promise<Result<RESTGetAPIGuildScheduledEventsResult>> {
    return this.fetch(
      `/guilds/${guildId}/scheduled-events?with_user_count=${withUserCount}`
    );
  }
}

export { DiscordHttpError } from "./errors.js";
