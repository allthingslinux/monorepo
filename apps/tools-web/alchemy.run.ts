import path from "node:path";

import alchemy from "alchemy";
import type { Scope } from "alchemy";
import { Nextjs } from "alchemy/cloudflare";
import { CloudflareStateStore, FileSystemStateStore } from "alchemy/state";

const cwd = import.meta.dirname;

function createStateStore(scope: Scope) {
  if (process.env.ALCHEMY_STATE_TOKEN) {
    return new CloudflareStateStore(scope);
  }
  return new FileSystemStateStore(scope, {
    rootDir: path.join(cwd, ".alchemy"),
  });
}

const app = await alchemy("tools-web", {
  password: process.env.ALCHEMY_PASSWORD,
  rootDir: cwd,
  stateStore: createStateStore,
});

const stage =
  process.env.ALCHEMY_STAGE ?? process.env.STAGE ?? process.env.USER ?? "local";

export const website = await Nextjs("tools", {
  adopt: true,
  domains:
    stage === "prod" ? [{ adopt: true, domainName: "atl.tools" }] : undefined,
  name:
    stage === "prod" ? "allthingslinux-tools" : `allthingslinux-tools-${stage}`,
  url: stage !== "prod",
});

console.log({ url: website.url });
await app.finalize();
