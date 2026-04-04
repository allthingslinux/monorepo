import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { defineConfig } from "vitest/config";

function loadEnv(dir: string): Record<string, string> {
  const env: Record<string, string> = {};
  try {
    const contents = readFileSync(resolve(dir, ".env"), "utf8");
    for (const line of contents.split("\n")) {
      const eqIdx = line.indexOf("=");
      if (eqIdx === -1) {
        continue;
      }
      const key = line.slice(0, eqIdx).trim();
      const val = line.slice(eqIdx + 1).trim();
      if (key) {
        env[key] = val;
      }
    }
  } catch {
    // no .env file — rely on process.env
  }
  return env;
}

const dotenv = loadEnv(import.meta.dirname);

export default defineConfig({
  test: {
    env: dotenv,
    fileParallelism: false,
    hookTimeout: 60_000,
    include: ["tests/**/*.test.ts"],
    // Run files sequentially to stay within Fibery's 3 req/sec rate limit
    testTimeout: 15_000,
  },
});
