# allthingslinux monorepo

Local monorepo combining the marketing site and the portal (identity stack), imported with [tomono](https://github.com/hraban/tomono) so **commit history is preserved** (same object IDs as the source repos).

## Layout

| Path | Product |
|------|---------|
| `apps/web` | Main marketing site (Next.js, OpenNext / Cloudflare) |
| `apps/docs` | Product documentation ([Mintlify](https://mintlify.com); `docs.json` at app root) |
| `apps/portal` | Portal workspace (`apps/portal/apps/portal`, `apps/portal/packages/*`) |

Planning context: see `monorepo-planning/MASTER.md` in your planning repository (canonical layout and ADRs).

## Tooling (from repo root)

| Task | Command |
|------|---------|
| Install | `pnpm install` |
| Build (Turbo graph) | `pnpm build` |
| Dev | `pnpm dev` |
| Typecheck | `pnpm type-check` |
| Tests | `pnpm test` |
| Lint + format (Ultracite / Biome) | `pnpm check` / `pnpm fix` |
| Docs preview (Mintlify) | `pnpm --filter @atl/docs dev` |

**Note:** `apps/web` has **Biome linter disabled** in root `biome.jsonc` until that tree is brought up to the same Ultracite rules as `apps/portal`. Formatting still applies. Re-enable `linter` for `apps/web` when you are ready to fix findings.

## Shared config (one place)

| Concern | Location |
|--------|----------|
| **Git** | Root `.gitignore` only (nested `apps/*/.gitignore` removed so rules stay consistent). |
| **Lint / format** | Root `biome.jsonc` (Ultracite presets); portal uses full rules, `apps/web` lint deferred. |
| **VS Code / Cursor** | Root `.vscode/settings.json` and `.vscode/extensions.json` — Biome as formatter, Tailwind/i18n-ally recommendations, portal locale paths under `apps/portal/apps/portal/`. |
| **Cursor ignore** | Root `.cursorignore` — trim or remove per-app `.cursorignore` files if you still have them. |
| **Prettier** | Removed from `apps/web`; old `.prettierignore` patterns folded into `biome.jsonc` `files.includes` (`!**/*.min.js`, `!**/next-env.d.ts`). |
| **Renovate** | Root [`.github/renovate.json5`](.github/renovate.json5) — one config for the whole repo (`pnpm` workspaces, GitHub Actions, Docker, `mise`). |

Open the **repository root** as the workspace folder so these settings apply.

## Requirements

- **Node** `>=24.0.0` (see root `package.json` `engines`; `.nvmrc` and root `mise.toml` pin **24** for local tooling)
- **pnpm** `>=10` (see `packageManager`)
