import { env } from "@/env";
import { DiscordClient } from "@atl/discord";

// null when DISCORD_BOT_TOKEN is not configured — check before use.
export const discord: DiscordClient | null = env.DISCORD_BOT_TOKEN
  ? new DiscordClient({ token: env.DISCORD_BOT_TOKEN })
  : null;
