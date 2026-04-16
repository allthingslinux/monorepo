import "server-only";
import type { RepoConfig } from "@atl/config/changelog";
import {
  CHANGELOG_MAX_COMMITS_PER_REPO,
  CHANGELOG_REVALIDATE_SECONDS,
} from "@atl/config/changelog";

import type {
  ChangelogResult,
  CommitEntry,
  ReleaseEntry,
  RepoError,
  RepoFetchResult,
  RepoSummary,
  TimelineEntry,
} from "./types";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function buildGitHubHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "Portal/1.0 (https://portal.atl.tools)",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

function normalizeReleases(data: unknown[], repo: RepoConfig): ReleaseEntry[] {
  const repoId = `${repo.owner}/${repo.repo}`;
  return data.map((item) => {
    const r = item as Record<string, unknown>;
    return {
      body: String(r.body ?? ""),
      date: String(r.published_at ?? ""),
      id: String(r.id ?? ""),
      repoDisplayName: repo.displayName,
      repoId,
      tagName: String(r.tag_name ?? ""),
      title: String(r.name ?? ""),
      type: "release" as const,
      url: String(r.html_url ?? ""),
    };
  });
}

function normalizeCommits(data: unknown[], repo: RepoConfig): CommitEntry[] {
  const repoId = `${repo.owner}/${repo.repo}`;
  return data.slice(0, CHANGELOG_MAX_COMMITS_PER_REPO).map((item) => {
    const c = item as Record<string, unknown>;
    const commit = (c.commit ?? {}) as Record<string, unknown>;
    const commitAuthor = (commit.author ?? {}) as Record<string, unknown>;
    const author = (c.author ?? {}) as Record<string, unknown>;
    const sha = String(c.sha ?? "");

    return {
      authorAvatarUrl: String(author.avatar_url ?? ""),
      authorName: String(commitAuthor.name ?? ""),
      date: String(commitAuthor.date ?? ""),
      id: sha,
      message: String(commit.message ?? ""),
      repoDisplayName: repo.displayName,
      repoId,
      sha,
      shortSha: sha.slice(0, 7),
      type: "commit" as const,
      url: String(c.html_url ?? ""),
    };
  });
}

// ---------------------------------------------------------------------------
// Compare helpers — enrich releases with stats from consecutive tags
// ---------------------------------------------------------------------------

/** Max releases to fetch compare stats for (to avoid rate limiting) */
const MAX_COMPARE_FETCHES = 10;

interface CompareStats {
  additions: number;
  commitCount: number;
  compareUrl: string;
  contributors: number;
  deletions: number;
}

function githubFetchInit(bypassNextDataCache: boolean | undefined) {
  const headers = buildGitHubHeaders();
  const signal = AbortSignal.timeout(10_000);
  if (bypassNextDataCache) {
    return { cache: "no-store" as const, headers, signal };
  }
  return {
    headers,
    next: { revalidate: CHANGELOG_REVALIDATE_SECONDS },
    signal,
  };
}

async function fetchCompareStats(
  owner: string,
  repo: string,
  base: string,
  head: string,
  bypassNextDataCache?: boolean
): Promise<CompareStats | null> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/compare/${base}...${head}`,
      githubFetchInit(bypassNextDataCache)
    );

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as Record<string, unknown>;
    const commits = (data.commits ?? []) as Record<string, unknown>[];
    const files = (data.files ?? []) as Record<string, unknown>[];

    // Count unique authors
    const authorIds = new Set<string>();
    for (const c of commits) {
      const author = (c.author ?? {}) as Record<string, unknown>;
      const id = String(author.id ?? author.login ?? "");
      if (id) {
        authorIds.add(id);
      }
    }

    // Sum additions/deletions across files
    let additions = 0;
    let deletions = 0;
    for (const f of files) {
      additions += Number(f.additions ?? 0);
      deletions += Number(f.deletions ?? 0);
    }

    return {
      additions,
      commitCount: commits.length,
      compareUrl: String(data.html_url ?? ""),
      contributors: authorIds.size,
      deletions,
    };
  } catch {
    return null;
  }
}

async function enrichReleasesWithStats(
  releases: ReleaseEntry[],
  repo: RepoConfig,
  bypassNextDataCache?: boolean
): Promise<void> {
  if (releases.length < 2) {
    return;
  }

  // Releases come sorted newest-first from GitHub
  const pairs: { base: string; head: string; index: number }[] = [];
  for (
    let i = 0;
    i < Math.min(releases.length - 1, MAX_COMPARE_FETCHES);
    i += 1
  ) {
    const current = releases[i];
    const previous = releases[i + 1];
    if (current && previous) {
      pairs.push({
        base: previous.tagName,
        head: current.tagName,
        index: i,
      });
    }
  }

  const results = await Promise.allSettled(
    pairs.map((p) =>
      fetchCompareStats(
        repo.owner,
        repo.repo,
        p.base,
        p.head,
        bypassNextDataCache
      )
    )
  );

  for (let i = 0; i < results.length; i += 1) {
    const result = results[i];
    const pair = pairs[i];
    if (result?.status === "fulfilled" && result.value && pair) {
      const release = releases[pair.index];
      if (release) {
        release.commitCount = result.value.commitCount;
        release.contributors = result.value.contributors;
        release.additions = result.value.additions;
        release.deletions = result.value.deletions;
        release.compareUrl = result.value.compareUrl;
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Fetch helpers
// ---------------------------------------------------------------------------

async function fetchRepoReleases(
  repo: RepoConfig,
  bypassNextDataCache?: boolean
): Promise<RepoFetchResult<ReleaseEntry>> {
  const repoId = `${repo.owner}/${repo.repo}`;
  try {
    const response = await fetch(
      `https://api.github.com/repos/${repo.owner}/${repo.repo}/releases`,
      githubFetchInit(bypassNextDataCache)
    );

    if (!response.ok) {
      return {
        entries: [],
        error: `HTTP ${response.status}`,
        repoDisplayName: repo.displayName,
        repoId,
      };
    }

    const data = await response.json();
    const entries = normalizeReleases(data, repo);
    if (!bypassNextDataCache) {
      await enrichReleasesWithStats(entries, repo, bypassNextDataCache);
    }
    return {
      entries,
      repoDisplayName: repo.displayName,
      repoId,
    };
  } catch (error) {
    return {
      entries: [],
      error: error instanceof Error ? error.message : "Unknown error",
      repoDisplayName: repo.displayName,
      repoId,
    };
  }
}

async function fetchRepoCommits(
  repo: RepoConfig,
  bypassNextDataCache?: boolean
): Promise<RepoFetchResult<CommitEntry>> {
  const repoId = `${repo.owner}/${repo.repo}`;
  try {
    const response = await fetch(
      `https://api.github.com/repos/${repo.owner}/${repo.repo}/commits`,
      githubFetchInit(bypassNextDataCache)
    );

    if (!response.ok) {
      return {
        entries: [],
        error: `HTTP ${response.status}`,
        repoDisplayName: repo.displayName,
        repoId,
      };
    }

    const data = await response.json();
    return {
      entries: normalizeCommits(data, repo),
      repoDisplayName: repo.displayName,
      repoId,
    };
  } catch (error) {
    return {
      entries: [],
      error: error instanceof Error ? error.message : "Unknown error",
      repoDisplayName: repo.displayName,
      repoId,
    };
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** When `bypassNextDataCache` is true, GitHub fetches skip the Next.js Data Cache. */
export interface FetchChangelogOptions {
  bypassNextDataCache?: boolean;
}

/**
 * Fetch releases and commits from all configured repositories in parallel.
 * Failed repos are excluded from entries and reported in `errors`.
 */
export async function fetchChangelog(
  repos: RepoConfig[],
  options?: FetchChangelogOptions
): Promise<ChangelogResult> {
  const bypass = options?.bypassNextDataCache;
  const results = await Promise.allSettled(
    repos.flatMap((repo) => [
      fetchRepoReleases(repo, bypass),
      fetchRepoCommits(repo, bypass),
    ])
  );

  const allEntries: TimelineEntry[] = [];
  const errorMap = new Map<string, RepoError>();
  const countMap = new Map<string, { displayName: string; count: number }>();

  for (const result of results) {
    if (result.status === "rejected") {
      // Promise.allSettled should not reject for our usage, but handle it
      continue;
    }

    const { repoId, repoDisplayName, entries, error } = result.value;

    if (error && !errorMap.has(repoId)) {
      errorMap.set(repoId, {
        displayName: repoDisplayName,
        error,
        repoId,
      });
    }

    allEntries.push(...entries);

    const existing = countMap.get(repoId) ?? {
      count: 0,
      displayName: repoDisplayName,
    };
    existing.count += entries.length;
    countMap.set(repoId, existing);
  }

  // Sort by date descending
  allEntries.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const repoSummaries: RepoSummary[] = [...countMap.entries()].map(
    ([repoId, { displayName, count }]) => ({
      displayName,
      entryCount: count,
      repoId,
    })
  );

  return {
    entries: allEntries,
    errors: [...errorMap.values()],
    repos: repoSummaries,
  };
}
