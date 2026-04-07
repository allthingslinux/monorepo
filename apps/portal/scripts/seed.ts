import "dotenv/config";
import { user } from "@atl/db/schema/auth";
import { ircAccount } from "@atl/db/schema/irc";
import { xmppAccount } from "@atl/db/schema/xmpp";
import { sql } from "drizzle-orm";

import { db } from "./lib/db";

// ============================================================================
// Database Seeding Script
// ============================================================================
// This script inserts mock users and IRC/XMPP accounts for testing.
// drizzle-seed is not used due to instanceof incompatibility with drizzle-orm 1.0 beta.
//
// Usage:
//   pnpm tsx scripts/seed.ts          - Seed database with default options
//   pnpm tsx scripts/seed.ts reset    - Reset database before seeding
//
const XMPP_DOMAIN = "xmpp.atl.chat";
const IRC_SERVER = "irc.atl.chat";
const IRC_PORT = 6697;

/** All Portal tables (for TRUNCATE CASCADE). Bypasses drizzle-seed reset due to drizzle-orm 1.0 beta instanceof incompatibility. Reserved words quoted. */
const TABLE_NAMES = [
  "oauth_access_token",
  "oauth_refresh_token",
  "oauth_consent",
  "oauth_client",
  "session",
  "account",
  "passkey",
  "two_factor",
  "verification",
  "apikey",
  "jwks",
  "integration_accounts",
  "irc_account",
  "xmpp_account",
  '"user"',
] as const;

async function resetDatabase() {
  const tables = TABLE_NAMES.join(", ");
  await db.execute(sql.raw(`TRUNCATE ${tables} CASCADE`));
}

/** Insert IRC and XMPP accounts for existing users (mock data for testing) */
async function seedIntegrationAccounts() {
  const users = await db.select({ id: user.id }).from(user).limit(8);

  const statuses = ["active", "suspended", "deleted"] as const;
  const ircStatuses = ["active", "pending", "suspended", "deleted"] as const;

  for (let i = 0; i < users.length; i += 1) {
    const u = users[i];
    if (!u?.id) {
      continue;
    }

    const suffix = `seed${i + 1}`;
    const nick = `atl_${suffix}`;
    const xmppUsername = `atl_${suffix}`;
    const jid = `${xmppUsername}@${XMPP_DOMAIN}`;
    const status = statuses[i % statuses.length];
    const ircStatus = ircStatuses[i % ircStatuses.length];

    await db.insert(ircAccount).values({
      nick,
      port: IRC_PORT,
      server: IRC_SERVER,
      status: ircStatus,
      userId: u.id,
    });

    await db.insert(xmppAccount).values({
      id: crypto.randomUUID(),
      jid,
      status,
      userId: u.id,
      username: xmppUsername,
    });
  }

  console.log(`Seeded ${users.length} IRC and XMPP accounts.`);
}

const MOCK_NAMES = [
  "Alice Johnson",
  "Bob Smith",
  "Carol Williams",
  "David Brown",
  "Eve Davis",
  "Frank Miller",
  "Grace Wilson",
  "Henry Moore",
  "Ivy Taylor",
  "Jack Anderson",
] as const;

/** Insert mock users for testing (minimal required fields) */
async function seedUsers() {
  const now = new Date();
  const users = MOCK_NAMES.map((name, i) => {
    const id = crypto.randomUUID();
    const email = `user${i + 1}@example.com`;
    return {
      banExpires: null,
      banReason: null,
      banned: false,
      createdAt: now,
      email,
      emailVerified: false,
      id,
      image: null,
      name,
      role: i === 0 ? "admin" : "user",
      twoFactorEnabled: null,
      updatedAt: now,
    };
  });
  await db.insert(user).values(users);
  console.log(`Seeded ${users.length} users.`);
}

async function main() {
  const args = process.argv.slice(2);
  const shouldReset = args.includes("reset");

  if (shouldReset) {
    console.log("Resetting database...");
    await resetDatabase();
    console.log("Database reset complete.");
  }

  console.log("Seeding database...");

  await seedUsers();
  await seedIntegrationAccounts();

  console.log("Database seeding complete.");
  process.exit(0);
}

(async () => {
  try {
    await main();
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
})();
