/**
 * Paths skipped for Ultracite (oxlint + oxfmt) on staged files — mirror root
 * `.eslintignore` so pre-commit matches `pnpm check`.
 */
const IGNORE_PATH_PREFIXES = [
  "apps/web/",
  "apps/docs/",
  "apps/portal/references/",
  "apps/portal/packages/ui/src/ui/",
  "apps/portal/drizzle/",
  "apps/portal/.cursor/skills/",
];

function isIgnoredUltracitePath(file) {
  const normalized = file.replaceAll("\\", "/");
  return IGNORE_PATH_PREFIXES.some(
    (prefix) =>
      normalized.startsWith(prefix) || normalized.includes(`/${prefix}`)
  );
}

function filterUltracitePaths(files) {
  return files.filter((f) => !isIgnoredUltracitePath(f));
}

export default {
  "*.{ts,tsx,js,jsx,mjs,cjs,json,jsonc,css,md}": (files) => {
    const filtered = filterUltracitePaths(files);
    if (filtered.length === 0) {
      return [];
    }
    const quoted = filtered.map((f) => JSON.stringify(f)).join(" ");
    return `pnpm exec ultracite fix ${quoted}`;
  },
};