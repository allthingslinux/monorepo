/**
 * lint-staged configuration.
 *
 * lint-staged passes absolute paths by default. We use the function syntax
 * to filter ignored paths and convert to relative before passing to tools.
 *
 * Ignore prefixes mirror `.oxlintrc.json` → `ignorePatterns` so pre-commit
 * behaviour matches `pnpm lint`.
 */

const ULTRACITE_IGNORE_PREFIXES = [
  "apps/portal/references/",
  "apps/portal/drizzle/",
  "apps/portal/.cursor/skills/",
  "packages/ui/",
  "apps/bridge/",
  "services/",
  "references/",
];

/** Normalise a path and strip the cwd prefix to get a repo-relative path. */
function toRelative(file) {
  const normalised = file.replaceAll("\\", "/");
  const cwd = process.cwd().replaceAll("\\", "/");
  return normalised.startsWith(`${cwd}/`)
    ? normalised.slice(cwd.length + 1)
    : normalised;
}

/** Return true if the file should be skipped by ultracite. */
function isUltraciteIgnored(file) {
  const rel = toRelative(file);
  // Skip files with brackets — ultracite/oxlint treats them as glob patterns
  if (/[[\]]/.test(rel)) {
    return true;
  }
  return ULTRACITE_IGNORE_PREFIXES.some(
    (prefix) => rel.startsWith(prefix) || rel.includes(`/${prefix}`)
  );
}

export default {
  // Python — ruff check + format (uv handles its own path resolution)
  "*.py": (files) => {
    const args = files.map((f) => JSON.stringify(toRelative(f))).join(" ");
    return [`uv run ruff check --fix ${args}`, `uv run ruff format ${args}`];
  },

  // Shell — shellcheck + shfmt
  "*.sh": (files) => {
    const args = files.map((f) => JSON.stringify(toRelative(f))).join(" ");
    return [
      `shellcheck ${args}`,
      `shfmt -ln bash -i 2 -ci -bn -sr -s -w ${args}`,
    ];
  },

  // Terraform
  "*.tf": () => "terraform fmt",

  // JS/TS/JSON/CSS/MD — run ultracite fix (oxfmt + oxlint) on relative paths
  "*.{ts,tsx,js,jsx,mjs,cjs,json,jsonc,css,md,mdx,html,graphql,yaml,yml,toml}":
    (files) => {
      const filtered = files.filter((f) => !isUltraciteIgnored(f));
      if (filtered.length === 0) {
        return [];
      }
      const args = filtered.map((f) => JSON.stringify(toRelative(f))).join(" ");
      return `pnpm exec ultracite fix ${args}`;
    },
};
