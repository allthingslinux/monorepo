# allthingslinux monorepo

Local monorepo combining the marketing site and the portal (identity stack), imported with [tomono](https://github.com/hraban/tomono) so **commit history is preserved** (same object IDs as the source repos).

## Layout

| Path          | Product                                                                           |
| ------------- | --------------------------------------------------------------------------------- |
| `apps/web`    | Main marketing site (Next.js, OpenNext / Cloudflare)                              |
| `apps/docs`   | Product documentation ([Mintlify](https://mintlify.com); `docs.json` at app root) |
| `apps/portal` | Portal workspace (`apps/portal/apps/portal`, `apps/portal/packages/*`)            |

Planning context: see `monorepo-planning/MASTER.md` in your planning repository (canonical layout and ADRs).

## Tooling (from repo root)

| Task                                       | Command                       |
| ------------------------------------------ | ----------------------------- |
| Install                                    | `pnpm install`                |
| Build (Turbo graph)                        | `pnpm build`                  |
| Dev                                        | `pnpm dev`                    |
| Typecheck                                  | `pnpm type-check`             |
| Tests                                      | `pnpm test`                   |
| Lint + format (Ultracite / Oxlint + Oxfmt) | `pnpm check` / `pnpm fix`     |
| Docs preview (Mintlify)                    | `pnpm --filter @atl/docs dev` |

**Note:** `apps/web` is **excluded from Oxlint** (`.eslintignore`) until that tree is brought up to the same rules as `apps/portal`. Oxfmt still formats it. Remove `apps/web/**` from `.eslintignore` when you are ready to fix findings.

## Shared config (one place)

| Concern              | Location                                                                                                                                                                     |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Git**              | Root `.gitignore` only (nested `apps/*/.gitignore` removed so rules stay consistent).                                                                                        |
| **Lint / format**    | Root `.oxlintrc.json` + `.oxfmtrc.jsonc` (Ultracite Oxlint/Oxfmt presets); `apps/web` lint deferred via `.eslintignore`.                                                     |
| **VS Code / Cursor** | Root `.vscode/settings.json` and `.vscode/extensions.json` — Oxc (oxlint + oxfmt), Tailwind/i18n-ally recommendations, portal locale paths under `apps/portal/apps/portal/`. |
| **Cursor ignore**    | Root `.cursorignore` — trim or remove per-app `.cursorignore` files if you still have them.                                                                                  |
| **Prettier**         | Not used for JS/TS; Oxfmt formats. `.prettierignore` skips `apps/docs/**` for Mintlify; `.eslintignore` holds lint exclusions (including generated paths).                   |
| **Renovate**         | Root [`.github/renovate.json5`](.github/renovate.json5) — one config for the whole repo (`pnpm` workspaces, GitHub Actions, Docker, `mise`).                                 |

Open the **repository root** as the workspace folder so these settings apply.

## Requirements

- **Node** `>=24.0.0` (see root `package.json` `engines`; `.nvmrc` and root `mise.toml` pin **24** for local tooling)
- **pnpm** `>=10` (see `packageManager`)