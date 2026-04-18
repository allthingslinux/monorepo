/**
 * Dev-only: wipe public + drizzle schemas and re-apply all SQL migrations.
 * Use when the DB was created with db:push or migration history is out of sync.
 *
 * Requires DATABASE_URL (see apps/portal/.env).
 */
import { execSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "dotenv";
import { Client } from "pg";

const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: resolve(pkgRoot, "../../apps/portal/.env") });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const client = new Client({ connectionString: url });
await client.connect();
try {
  await client.query("DROP SCHEMA IF EXISTS drizzle CASCADE");
  await client.query("DROP SCHEMA IF EXISTS public CASCADE");
  await client.query("CREATE SCHEMA public");
  await client.query("GRANT ALL ON SCHEMA public TO postgres");
  await client.query("GRANT ALL ON SCHEMA public TO public");
  console.log("Reset schemas (drizzle + public). Running migrations…");
} finally {
  await client.end();
}

execSync("pnpm exec drizzle-kit migrate --config src/config.ts", {
  cwd: pkgRoot,
  env: process.env,
  stdio: "inherit",
});
