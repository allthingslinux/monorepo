import path from "node:path";

import alchemy from "alchemy";
import type { Scope } from "alchemy";
import {
  DurableObjectNamespace,
  Images,
  Nextjs,
  R2Bucket,
  Self,
} from "alchemy/cloudflare";
import type { WranglerJsonSpec } from "alchemy/cloudflare";
import { GitHubComment } from "alchemy/github";
import { CloudflareStateStore, FileSystemStateStore } from "alchemy/state";

/** Must match `alchemy deploy --app <id>` / Turbo `--filter` conventions. */
export const ALCHEMY_APP_ID = "web";

const cwd = import.meta.dirname;

const phase =
  (process.env.PHASE as "up" | "destroy" | "read" | undefined) ?? "up";

function resolveStage(): string {
  return (
    process.env.ALCHEMY_STAGE ??
    process.env.STAGE ??
    process.env.USER ??
    process.env.USERNAME ??
    "local"
  );
}

interface StageProfile {
  workerName: string;
  r2BucketName: string;
  kvNamespaceId: string;
  nextPublicUrl: string;
  nextPublicApiUrl: string;
  /** Enable workers.dev + preview subdomains (PR preview workers). */
  previewUrls: boolean;
  domains: { domainName: string; adopt?: boolean }[] | undefined;
  adoptWorker: boolean;
}

function getStageProfile(stage: string): StageProfile {
  if (stage === "prod") {
    return {
      workerName: "allthingslinux-prod",
      r2BucketName: "atl-cache-prod",
      kvNamespaceId: "7bfc722d19ea48b0b35422ac27029dfa",
      nextPublicUrl: "https://allthingslinux.org",
      nextPublicApiUrl: "https://allthingslinux.org/api",
      previewUrls: false,
      domains: [{ domainName: "allthingslinux.org", adopt: true }],
      adoptWorker: true,
    };
  }
  if (stage === "dev") {
    return {
      workerName: "allthingslinux-dev",
      r2BucketName: "atl-cache-dev",
      kvNamespaceId: "a7e7f8796625426c8355ec8bd60b75c1",
      nextPublicUrl: "https://allthingslinux.dev",
      nextPublicApiUrl: "https://allthingslinux.dev/api",
      previewUrls: false,
      domains: [{ domainName: "allthingslinux.dev", adopt: true }],
      adoptWorker: true,
    };
  }
  if (stage.startsWith("pr-")) {
    return {
      workerName: `allthingslinux-${stage}`,
      r2BucketName: "atl-cache-dev",
      kvNamespaceId: "a7e7f8796625426c8355ec8bd60b75c1",
      nextPublicUrl: "https://allthingslinux.dev",
      nextPublicApiUrl: "https://allthingslinux.dev/api",
      previewUrls: true,
      domains: undefined,
      adoptWorker: true,
    };
  }
  return {
    workerName: "allthingslinux-local",
    r2BucketName: "atl-cache-local",
    kvNamespaceId: "b58a50d9090b46a181322eb96d0c8c90",
    nextPublicUrl: "http://localhost:8788",
    nextPublicApiUrl: "http://localhost:8788/api",
    previewUrls: true,
    domains: undefined,
    adoptWorker: true,
  };
}

/** Matches `apps/web/wrangler.jsonc` — OpenNext DO cache classes. */
const MIGRATIONS: WranglerJsonSpec["migrations"] = [
  {
    tag: "v1",
    new_sqlite_classes: [
      "DOQueueHandler",
      "DOShardedTagCache",
      "BucketCachePurge",
    ],
  },
];

const OPENNEXT_DO_BINDINGS = [
  { name: "NEXT_CACHE_DO_QUEUE", class_name: "DOQueueHandler" },
  { name: "NEXT_TAG_CACHE_DO_SHARDED", class_name: "DOShardedTagCache" },
  { name: "NEXT_CACHE_DO_PURGE", class_name: "BucketCachePurge" },
] as const;

function mergeWrangler(spec: WranglerJsonSpec): WranglerJsonSpec {
  return {
    ...spec,
    find_additional_modules: true,
    logpush: true,
    limits: { cpu_ms: 300_000 },
    observability: {
      enabled: true,
      logs: { invocation_logs: true },
      head_sampling_rate: 1,
    },
    migrations: MIGRATIONS,
    durable_objects: {
      bindings: [...OPENNEXT_DO_BINDINGS],
    },
  };
}

function createStateStore(scope: Scope) {
  if (process.env.ALCHEMY_STATE_TOKEN) {
    return new CloudflareStateStore(scope);
  }
  return new FileSystemStateStore(scope, {
    rootDir: path.join(cwd, ".alchemy"),
  });
}

const app = await alchemy(ALCHEMY_APP_ID, {
  phase,
  password: process.env.ALCHEMY_PASSWORD,
  stateStore: createStateStore,
  rootDir: cwd,
  ...(process.env.ALCHEMY_PROFILE
    ? { profile: process.env.ALCHEMY_PROFILE }
    : {}),
});

const stage = resolveStage();
const profile = getStageProfile(stage);

const r2 = await R2Bucket("next-inc-cache", {
  name: profile.r2BucketName,
  adopt: true,
});

const website = await Nextjs("website", {
  cwd: path.resolve(cwd),
  name: profile.workerName,
  adopt: profile.adoptWorker,
  compatibilityDate: "2025-01-02",
  compatibilityFlags: ["nodejs_compat", "global_fetch_strictly_public"],
  limits: { cpu_ms: 300_000 },
  logpush: true,
  observability: {
    enabled: true,
    headSamplingRate: 1,
    logs: { invocationLogs: true },
  },
  url: profile.previewUrls,
  previewSubdomains: profile.previewUrls,
  domains: profile.domains,
  bindings: {
    NEXT_INC_CACHE_R2_BUCKET: r2,
    KV_QUICKBOOKS: { type: "kv_namespace", id: profile.kvNamespaceId },
    NEXT_CACHE_DO_QUEUE: DurableObjectNamespace("next-cache-do-queue", {
      className: "DOQueueHandler",
      sqlite: true,
    }),
    NEXT_TAG_CACHE_DO_SHARDED: DurableObjectNamespace(
      "next-tag-cache-do-sharded",
      {
        className: "DOShardedTagCache",
        sqlite: true,
      }
    ),
    NEXT_CACHE_DO_PURGE: DurableObjectNamespace("next-cache-do-purge", {
      className: "BucketCachePurge",
      sqlite: true,
    }),
    WORKER_SELF_REFERENCE: Self,
    IMAGES: Images(),
    NEXT_PUBLIC_URL: profile.nextPublicUrl,
    NEXT_PUBLIC_API_URL: profile.nextPublicApiUrl,
    NEXT_PUBLIC_GITHUB_REPO_OWNER: "allthingslinux",
    NEXT_PUBLIC_GITHUB_REPO_NAME: "applications",
  },
  wrangler: {
    path: ".alchemy/local/wrangler.jsonc",
    secrets: true,
    transform: mergeWrangler,
  },
  build: {
    command:
      "WRANGLER_BUILD_PLATFORM=node pnpm exec opennextjs-cloudflare build",
    env: { NEXTJS_ENV: "production" },
    memoize: process.env.CI ? false : undefined,
  },
});

export { website };

if (
  phase === "up" &&
  process.env.PULL_REQUEST === "true" &&
  process.env.GITHUB_REPOSITORY
) {
  const prRaw = process.env.GITHUB_PR_NUMBER ?? "";
  const prNumber = Number.parseInt(prRaw, 10);
  const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
  if (owner && repo && Number.isFinite(prNumber) && prNumber > 0) {
    await GitHubComment("deploy-preview", {
      owner,
      repository: repo,
      issueNumber: prNumber,
      body: `## Deployment preview

Preview URL: ${website.url ?? "(no workers.dev URL — check Cloudflare dashboard)"}
`,
    });
  }
}

await app.finalize();