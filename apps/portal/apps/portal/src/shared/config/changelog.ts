// ============================================================================
// Unified Changelog Configuration
// ============================================================================
// Configure GitHub repositories and settings for the Changelog page.
// Add or remove repositories here to control what appears in the timeline.

import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";
import "server-only";

export interface RepoConfig {
  /** Human-readable display name */
  displayName: string;
  /** GitHub repository owner (organization or user) */
  owner: string;
  /** GitHub repository name */
  repo: string;
}

/** ATL repositories to aggregate in the changelog */
export const CHANGELOG_REPOS: RepoConfig[] = [
  { displayName: "portal", owner: "allthingslinux", repo: "portal" },
  { displayName: "tux", owner: "allthingslinux", repo: "tux" },
  { displayName: "atl.tools", owner: "allthingslinux", repo: "atl.tools" },
  {
    displayName: "atl.services",
    owner: "allthingslinux",
    repo: "atl.services",
  },
  { displayName: "atl.network", owner: "allthingslinux", repo: "atl.network" },
  { displayName: "atl.chat", owner: "allthingslinux", repo: "atl.chat" },
  { displayName: "website", owner: "allthingslinux", repo: "allthingslinux" },
  { displayName: "pubnix", owner: "allthingslinux", repo: "pubnix" },
  { displayName: "atl.wiki", owner: "allthingslinux", repo: "atl-wiki" },
  {
    displayName: "code-of-conduct",
    owner: "allthingslinux",
    repo: "code-of-conduct",
  },
  { displayName: "iso.atl.dev", owner: "allthingslinux", repo: "iso.atl.dev" },
];

/** Revalidate GitHub data every 10 minutes */
export const CHANGELOG_REVALIDATE_SECONDS = 600;

/** Maximum commits to fetch per repository */
export const CHANGELOG_MAX_COMMITS_PER_REPO = 100;

/** Number of timeline entries shown per page */
export const CHANGELOG_PAGE_SIZE = 30;

export const keys = () =>
  createEnv({
    client: {},
    runtimeEnv: {
      GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    },
    server: {
      GITHUB_TOKEN: z.string().min(1).optional(),
    },
  });