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
  nextPublicPortalUrl: string;
  /** Enable workers.dev + preview subdomains (PR preview workers). */
  previewUrls: boolean;
  domains: { domainName: string; adopt?: boolean }[] | undefined;
  adoptWorker: boolean;
}

function getStageProfile(stage: string): StageProfile {
  if (stage === "prod") {
    return {
      adoptWorker: true,
      domains: [{ adopt: true, domainName: "allthingslinux.org" }],
      kvNamespaceId: "7bfc722d19ea48b0b35422ac27029dfa",
      nextPublicApiUrl: "https://allthingslinux.org/api",
      nextPublicPortalUrl: "https://portal.allthingslinux.org",
      nextPublicUrl: "https://allthingslinux.org",
      previewUrls: false,
      r2BucketName: "atl-cache-prod",
      workerName: "allthingslinux-prod",
    };
  }
  if (stage === "dev") {
    return {
      adoptWorker: true,
      domains: [{ adopt: true, domainName: "allthingslinux.dev" }],
      kvNamespaceId: "a7e7f8796625426c8355ec8bd60b75c1",
      nextPublicApiUrl: "https://allthingslinux.dev/api",
      nextPublicPortalUrl: "https://portal.allthingslinux.org",
      nextPublicUrl: "https://allthingslinux.dev",
      previewUrls: false,
      r2BucketName: "atl-cache-dev",
      workerName: "allthingslinux-dev",
    };
  }
  if (stage.startsWith("pr-")) {
    return {
      adoptWorker: true,
      domains: undefined,
      kvNamespaceId: "a7e7f8796625426c8355ec8bd60b75c1",
      nextPublicApiUrl: "https://allthingslinux.dev/api",
      nextPublicPortalUrl: "https://portal.allthingslinux.org",
      nextPublicUrl: "https://allthingslinux.dev",
      previewUrls: true,
      r2BucketName: "atl-cache-dev",
      workerName: `allthingslinux-${stage}`,
    };
  }
  return {
    adoptWorker: true,
    domains: undefined,
    kvNamespaceId: "b58a50d9090b46a181322eb96d0c8c90",
    nextPublicApiUrl: "http://localhost:8788/api",
    nextPublicPortalUrl: "http://localhost:3000",
    nextPublicUrl: "http://localhost:8788",
    previewUrls: true,
    r2BucketName: "atl-cache-local",
    workerName: "allthingslinux-local",
  };
}

/** Matches `apps/web/wrangler.jsonc` — OpenNext DO cache classes. */
const MIGRATIONS: WranglerJsonSpec["migrations"] = [
  {
    new_sqlite_classes: [
      "DOQueueHandler",
      "DOShardedTagCache",
      "BucketCachePurge",
    ],
    tag: "v1",
  },
];

const OPENNEXT_DO_BINDINGS = [
  { class_name: "DOQueueHandler", name: "NEXT_CACHE_DO_QUEUE" },
  { class_name: "DOShardedTagCache", name: "NEXT_TAG_CACHE_DO_SHARDED" },
  { class_name: "BucketCachePurge", name: "NEXT_CACHE_DO_PURGE" },
] as const;

function mergeWrangler(spec: WranglerJsonSpec): WranglerJsonSpec {
  return {
    ...spec,
    durable_objects: {
      bindings: [...OPENNEXT_DO_BINDINGS],
    },
    find_additional_modules: true,
    limits: { cpu_ms: 300_000 },
    logpush: true,
    migrations: MIGRATIONS,
    observability: {
      enabled: true,
      head_sampling_rate: 1,
      logs: { invocation_logs: true },
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
  password: process.env.ALCHEMY_PASSWORD,
  phase,
  rootDir: cwd,
  stateStore: createStateStore,
  ...(process.env.ALCHEMY_PROFILE
    ? { profile: process.env.ALCHEMY_PROFILE }
    : {}),
});

const stage = resolveStage();
const profile = getStageProfile(stage);

const r2 = await R2Bucket("next-inc-cache", {
  adopt: true,
  name: profile.r2BucketName,
});

const website = await Nextjs("website", {
  adopt: profile.adoptWorker,
  bindings: {
    IMAGES: Images(),
    KV_QUICKBOOKS: { id: profile.kvNamespaceId, type: "kv_namespace" },
    NEXT_CACHE_DO_PURGE: DurableObjectNamespace("next-cache-do-purge", {
      className: "BucketCachePurge",
      sqlite: true,
    }),
    NEXT_CACHE_DO_QUEUE: DurableObjectNamespace("next-cache-do-queue", {
      className: "DOQueueHandler",
      sqlite: true,
    }),
    NEXT_INC_CACHE_R2_BUCKET: r2,
    NEXT_PUBLIC_API_URL: profile.nextPublicApiUrl,
    NEXT_PUBLIC_GITHUB_REPO_NAME: "applications",
    NEXT_PUBLIC_GITHUB_REPO_OWNER: "allthingslinux",
    NEXT_PUBLIC_PORTAL_URL: profile.nextPublicPortalUrl,
    NEXT_PUBLIC_URL: profile.nextPublicUrl,
    NEXT_TAG_CACHE_DO_SHARDED: DurableObjectNamespace(
      "next-tag-cache-do-sharded",
      {
        className: "DOShardedTagCache",
        sqlite: true,
      }
    ),
    WORKER_SELF_REFERENCE: Self,
  },
  build: {
    command:
      "WRANGLER_BUILD_PLATFORM=node pnpm exec opennextjs-cloudflare build",
    env: { NEXTJS_ENV: "production" },
    memoize: process.env.CI ? false : undefined,
  },
  compatibilityDate: "2025-01-02",
  compatibilityFlags: ["nodejs_compat", "global_fetch_strictly_public"],
  cwd: path.resolve(cwd),
  domains: profile.domains,
  limits: { cpu_ms: 300_000 },
  logpush: true,
  name: profile.workerName,
  observability: {
    enabled: true,
    headSamplingRate: 1,
    logs: { invocationLogs: true },
  },
  previewSubdomains: profile.previewUrls,
  url: profile.previewUrls,
  wrangler: {
    path: "wrangler.jsonc",
    secrets: true,
    transform: mergeWrangler,
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
      body: `## Deployment preview

Preview URL: ${website.url ?? "(no workers.dev URL — check Cloudflare dashboard)"}
`,
      issueNumber: prNumber,
      owner,
      repository: repo,
    });
  }
}

await app.finalize();
