import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { config as loadDotenv } from "dotenv";

import { DiscordClient, toSnowflake } from "@atl/discord";
import type { APIMessage } from "@atl/discord";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
loadDotenv({ path: path.resolve(scriptDir, "..", ".env") });

function usage(): never {
  throw new Error(
    "Usage: pnpm --filter @atl/portal exec tsx scripts/export-discord-channel-messages.ts <channelId> [outputPath]"
  );
}

function escapeMarkdown(input: string): string {
  return input.replaceAll("|", "\\|").replaceAll("\n", "<br>");
}

async function fetchAllChannelMessages(
  client: DiscordClient,
  channelId: string
): Promise<APIMessage[]> {
  const all: APIMessage[] = [];
  let before: string | undefined;

  while (true) {
    const page = await client.getChannelMessages(toSnowflake(channelId), {
      before: before ? toSnowflake(before) : undefined,
      cache: { revalidate: false },
      limit: 100,
    });

    if (!page.ok) {
      throw new Error(
        `Discord API error (${page.error.status}) on ${page.error.route}: ${page.error.message}`
      );
    }

    if (page.value.length === 0) {
      break;
    }

    all.push(...page.value);
    before = page.value.at(-1)?.id;

    if (page.value.length < 100) {
      break;
    }
  }

  // Discord returns newest-first; reverse for audit readability.
  return all.toReversed();
}

function toAuditMarkdown(channelId: string, messages: APIMessage[]): string {
  const header = [
    `# Discord Channel Audit Export`,
    ``,
    `- Channel ID: \`${channelId}\``,
    `- Exported at (UTC): ${new Date().toISOString()}`,
    `- Total messages: ${messages.length}`,
    ``,
    `## Messages`,
    ``,
    `| Timestamp (UTC) | Message ID | Author | Content |`,
    `| --- | --- | --- | --- |`,
  ];

  const rows = messages.map((message) => {
    const author = message.author
      ? `${message.author.username} (${message.author.id})`
      : "unknown";
    const content = message.content.trim().length
      ? message.content.trim()
      : "[no text content]";

    return `| ${message.timestamp} | \`${message.id}\` | ${escapeMarkdown(author)} | ${escapeMarkdown(content)} |`;
  });

  return [...header, ...rows, ""].join("\n");
}

async function main() {
  const [channelId, outputArg] = process.argv.slice(2);
  if (!channelId) {
    usage();
  }

  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) {
    throw new Error("DISCORD_BOT_TOKEN is required in the environment.");
  }

  const client = new DiscordClient({
    defaultRevalidate: false,
    token,
  });

  const messages = await fetchAllChannelMessages(client, channelId);
  const markdown = toAuditMarkdown(channelId, messages);

  const outputPath =
    outputArg ??
    path.resolve(
      process.cwd(),
      "docs",
      `discord-channel-${channelId}-audit.md`
    );

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, markdown, "utf-8");

  console.log(`Exported ${messages.length} messages to ${outputPath}`);
}

await main();
