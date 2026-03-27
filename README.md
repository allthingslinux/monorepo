# allthingslinux monorepo

Unified monorepo for All Things Linux: marketing site, portal (identity stack), chat infrastructure (IRC/XMPP/bridge), network services, and observability stack. Imported with [tomono](https://github.com/hraban/tomono) so **commit history is preserved**.

## Layout

| Path                       | Product                                                                           |
| -------------------------- | --------------------------------------------------------------------------------- |
| `apps/web`                 | Main marketing site (Next.js 16, OpenNext / Cloudflare)                           |
| `apps/portal`              | Portal app (`@atl/portal`) and workspace packages (`apps/portal/packages/*`)      |
| `apps/chat-web`            | atl.chat marketing/landing page (Next.js 16, `@atl/chat-web`)                     |
| `apps/docs`                | Product documentation ([Mintlify](https://mintlify.com); `docs.json` at app root) |
| `apps/bridge`              | Discord↔IRC↔XMPP bridge (Python, uv workspace member)                             |
| `packages/ui`              | `@atl/ui` — shadcn/ui + @base-ui/react design system                              |
| `services/chat/*`          | IRC/XMPP infrastructure: UnrealIRCd, Atheme, Prosody, web clients                 |
| `services/network/*`       | Network infrastructure: DNS (Blocky), TURN (coturn), uptime (Gatus), SFTP         |
| `services/observability/*` | Metrics/logging: Grafana, Loki, Mimir, Alloy, Blackbox                            |
| `infra/compose/*`          | Docker Compose fragments (one file per service group)                             |
| `scripts/`                 | Cross-repo shell scripts (init, cert bootstrap)                                   |

**Key distinction:** `apps/` = software we build and own (polyglot: Next.js + Python). `services/` = external software we extend, configure, and operate, grouped by domain. `packages/` = shared JS/TS libraries.

**Package names:** `@atl/*` for org-level apps and shared libraries. `@portal/*` for portal-internal packages under `apps/portal/packages/*`.

## Tooling (from repo root)

| Task                                       | Command                       |
| ------------------------------------------ | ----------------------------- |
| Full bootstrap                             | `just setup`                  |
| Install (JS)                               | `pnpm install`                |
| Install (Python)                           | `uv sync --all-extras`        |
| Build (Turbo graph)                        | `pnpm build`                  |
| Dev (JS apps)                              | `pnpm dev`                    |
| Dev (chat services)                        | `just chat-dev`               |
| Typecheck                                  | `pnpm type-check`             |
| Tests                                      | `pnpm test`                   |
| Lint + format (Ultracite / Oxlint + Oxfmt) | `pnpm check` / `pnpm fix`     |
| Bridge lint                                | `just bridge-check`           |
| Bridge tests                               | `just bridge-test`            |
| Docs preview (Mintlify)                    | `pnpm --filter @atl/docs dev` |

Run `just` to see all available recipes grouped by domain.

## Requirements

- **Node** `>=24.0.0` (see root `package.json` `engines`; `.nvmrc` and root `mise.toml` pin **24**)
- **pnpm** `>=10` (see `packageManager`)
- **uv** (Python package manager — for `apps/bridge`)
- **Docker** + **Docker Compose** (for `services/*`)
- **just** (task runner — `cargo install just` or OS package manager)

## Shared config (one place)

| Concern                    | Location                                                              |
| -------------------------- | --------------------------------------------------------------------- |
| **Git**                    | Root `.gitignore` only                                                |
| **Commits**                | Root `commitlint.config.cjs` + `.husky/commit-msg`                    |
| **Lint / format**          | Root `.oxlintrc.json` + `.oxfmtrc.jsonc` (Ultracite)                  |
| **Turborepo**              | Root `turbo.json`; app overrides in `apps/*/turbo.json`               |
| **CI / GitHub Actions**    | `.github/workflows/` + `.github/actions/setup-node-pnpm/`             |
| **Renovate**               | Root `.github/renovate.json5`                                         |
| **Docker (chat)**          | `infra/compose/chat-*.yaml` fragments included by root `compose.yaml` |
| **Docker (network)**       | `infra/compose/network.yaml`                                          |
| **Docker (observability)** | `infra/compose/observability.yaml`                                    |
| **Env vars**               | Root `.env.example` / `.env.dev.example` / `.env.prod.example`        |

## Project Stats

![Metrics](https://repobeats.axiom.co/api/embed/024cbbc4dc82cdc3fa9e0d304ff5a45607f2b656.svg)

## Contributors

![Contributors](https://contrib.rocks/image?repo=allthingslinux/monorepo)
