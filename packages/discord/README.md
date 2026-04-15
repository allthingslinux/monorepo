# `@atl/discord`

Thin **Discord REST API v10** client for server-side TypeScript. It wraps `fetch` with a bot token, returns a **`Result<T>`** instead of throwing on HTTP errors, and passes **Next.js `fetch` cache** options (`next: { revalidate, tags }`) without depending on the `next` package at type level.

## Requirements

- **Node 18+** (global `fetch`)
- A **Discord bot token** with the permissions your calls need
- **Server-only** — the entry module imports `server-only`. Use only in server components (no client hooks), route handlers, server actions, or other server-only modules.

## Install (monorepo)

```json
{
  "dependencies": {
    "@atl/discord": "workspace:*"
  }
}
```

## Quick start

```ts
import { DiscordClient, toSnowflake } from "@atl/discord";

const client = new DiscordClient({
  token: process.env.DISCORD_BOT_TOKEN!,
  // optional: default revalidate in seconds for Next.js data cache (default 60)
  defaultRevalidate: 60,
});

const guildId = toSnowflake(process.env.DISCORD_GUILD_ID!);

const result = await client.getGuild(guildId);

if (result.ok) {
  console.log(result.value.name);
} else {
  console.error(result.error.status, result.error.message);
}
```

## Configuration

| Field               | Description                                                                                    |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| `token`             | Bot token from the Discord Developer Portal (`Bot ...` in `Authorization`).                    |
| `defaultRevalidate` | Default `revalidate` (seconds) for cached `fetch` calls. Default `60`. Use `false` to disable. |

## `Result<T>` and errors

Successful responses use **`{ ok: true, value: T }`**. Failures use **`{ ok: false, error: DiscordHttpError }`** (HTTP status, body text, route). Network failures use status `0`.

Helpers **`ok`** / **`err`** are exported for advanced use.

## API surface

All methods are on **`DiscordClient`**:

| Area              | Methods                                                                           |
| ----------------- | --------------------------------------------------------------------------------- |
| Guild             | `getGuild`, `getGuildPreview`, `getGuildWidget`                                   |
| Channels          | `getGuildChannels`                                                                |
| Roles             | `getGuildRoles`                                                                   |
| Members           | `getGuildMember`, `listGuildMembers`, `searchGuildMembers`, `listAllGuildMembers` |
| Bans              | `getGuildBans`, `getGuildBan`                                                     |
| Audit log         | `getAuditLog`                                                                     |
| Invites           | `getGuildInvites`                                                                 |
| Emojis / stickers | `getGuildEmojis`, `getGuildStickers`                                              |
| Scheduled events  | `getGuildScheduledEvents`                                                         |

Response types are re-exported from **`discord-api-types/v10`** (e.g. `RESTGetAPIGuildResult`, `APIGuildMember`).

## Snowflakes

Use **`toSnowflake(string)`** at boundaries (env vars, user input) to satisfy the branded **`Snowflake`** type.

## Next.js caching

`fetch` calls include `next: { revalidate, ...cache }`. Per-call overrides are supported on methods that accept a second cache argument (see `client.ts`). Audit log uses a shorter default revalidation than guild reads.

## In this repo

**Portal** wires a singleton in `apps/portal/src/features/integrations/lib/discord/client.ts` when `DISCORD_BOT_TOKEN` is set.

## Scripts

```bash
pnpm --filter @atl/discord type-check
```
