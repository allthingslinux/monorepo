# allthingslinux monorepo

Unified monorepo for [All Things Linux](https://allthingslinux.org): marketing site, portal (identity stack), chat infrastructure (IRC / XMPP / bridge), network services, and observability stack.

## Layout

```
apps/
├── web            @atl/web — marketing site (Next.js 16, OpenNext / Cloudflare)
├── portal         @atl/portal — identity & admin portal (Next.js 16, PostgreSQL)
├── chat-web       @atl/chat-web — atl.chat landing page (Next.js 16)
├── docs           @atl/docs — product documentation (Mintlify)
└── bridge         Discord↔IRC↔XMPP bridge (Python / uv — NOT in pnpm workspace)

packages/
└── ui             @atl/ui — shared design system (shadcn/ui + @base-ui/react)

services/
├── chat/          IRC (UnrealIRCd + Atheme), XMPP (Prosody), web clients
├── network/       DNS (Blocky), TURN (coturn), uptime (Gatus), SFTP
└── observability/ Grafana, Loki, Mimir, Alloy, Alloy Agent, Blackbox

infra/
├── compose/       Docker Compose fragments (chat-*.yaml, network, observability, cert-manager, networks)
└── nginx/         Nginx reverse proxy config (Prosody HTTPS)

scripts/           Shell scripts (init.sh — data dirs + dev certs)
```

`apps/` = software we build and own (polyglot: Next.js + Python).
`services/` = external software we extend, configure, and operate.
`packages/` = shared JS/TS libraries.

Package names: `@atl/*` for org-level apps and shared libraries. `@portal/*` for portal-internal packages under `apps/portal/packages/*`.

## Requirements

| Tool                                        | Version | Notes                                         |
| ------------------------------------------- | ------- | --------------------------------------------- |
| [Node.js](https://nodejs.org)               | `>=24`  | Pinned in `.nvmrc` and `mise.toml`            |
| [pnpm](https://pnpm.io)                     | `>=10`  | Managed via Corepack (`packageManager` field) |
| [uv](https://docs.astral.sh/uv/)            | latest  | Python package manager for `apps/bridge`      |
| [Docker](https://www.docker.com/) + Compose | —       | Required for `services/*`                     |
| [just](https://just.systems)                | latest  | Task runner (`cargo install just` or OS pkg)  |

## Getting started

```bash
git clone https://github.com/allthingslinux/monorepo.git
cd monorepo
just setup        # pnpm install + uv sync + init.sh + env files
```

`just setup` copies `.env.example` → `.env` and `.env.dev.example` → `.env.dev` if they don't already exist. Edit them before starting services.

## Commands

Run `just` to see all available recipes grouped by domain.

### Workspace

| Command          | Purpose                                    |
| ---------------- | ------------------------------------------ |
| `just setup`     | Full bootstrap (JS + Python + env + certs) |
| `just dev`       | Start all JS apps via Turborepo            |
| `just build`     | Production build (Turbo graph)             |
| `just check`     | Lint + format check (Ultracite)            |
| `just fix`       | Lint + format fix (Ultracite)              |
| `just typecheck` | TypeScript validation across all packages  |
| `just test`      | Run all tests via Turborepo                |
| `just clean`     | Remove build artifacts                     |

### Apps

| Command                 | Purpose                   |
| ----------------------- | ------------------------- |
| `just portal-dev`       | Portal dev server         |
| `just portal-db-up`     | Start PostgreSQL (Docker) |
| `just portal-db-push`   | Push schema to dev DB     |
| `just portal-db-studio` | Open Drizzle Studio       |
| `just web-dev`          | Marketing site dev server |
| `just chat-web-dev`     | atl.chat dev server       |
| `just docs-dev`         | Mintlify docs preview     |

### Chat services (Docker)

| Command            | Purpose                               |
| ------------------ | ------------------------------------- |
| `just chat-dev`    | Start all chat services (dev profile) |
| `just chat-down`   | Stop chat services                    |
| `just chat-logs`   | Tail logs (optionally filter by name) |
| `just chat-status` | Show running containers               |
| `just chat-build`  | Build all service images              |

### Bridge (Python)

| Command                 | Purpose                  |
| ----------------------- | ------------------------ |
| `just bridge-check`     | Ruff lint + format check |
| `just bridge-fix`       | Ruff lint fix + format   |
| `just bridge-typecheck` | basedpyright type check  |
| `just bridge-test`      | pytest suite             |

## Environment variables

Three env file layers at the repo root:

| File        | Purpose                                 |
| ----------- | --------------------------------------- |
| `.env`      | Shared secrets and base config          |
| `.env.dev`  | Dev-only overrides (ports, debug flags) |
| `.env.prod` | Production overrides                    |

Docker Compose always requires `--env-file .env --env-file .env.dev` (or `.env.prod`). The `just` recipes handle this automatically.

Portal has its own `.env` at `apps/portal/.env` — see `apps/portal/README.md` for details.

## Shared config

| Concern             | Location                                                                    |
| ------------------- | --------------------------------------------------------------------------- |
| Git                 | Root `.gitignore`                                                           |
| Commits             | `commitlint.config.cjs` + `.husky/commit-msg`                               |
| Lint / format       | `.oxlintrc.json` + `.oxfmtrc.jsonc` (Ultracite: Oxlint + Oxfmt)             |
| Pre-commit          | Husky + lint-staged (see below)                                             |
| Turborepo           | Root `turbo.json`; app overrides in `apps/*/turbo.json`                     |
| Dependency versions | `pnpm-workspace.yaml` `catalog:` section                                    |
| CI                  | `.github/workflows/` + `.github/actions/setup-node-pnpm/`                   |
| Renovate            | `.github/renovate.json5`                                                    |
| Docker              | `infra/{chat,network,observability}/*.yaml` included by root `compose.yaml` |

### Pre-commit hooks (Husky + lint-staged)

| Glob                | Tools                     |
| ------------------- | ------------------------- |
| `*.{ts,tsx,js,jsx}` | Oxlint + Oxfmt            |
| `*.py`              | Ruff check --fix + format |
| `*.sh`              | ShellCheck + shfmt        |

## CI / GitHub Actions

Workflows in `.github/workflows/`:

- `portal-ci.yml` — lint, type-check, build, test, knip, release
- `portal-deploy.yml` — Docker build + SSH deploy (staging / production)
- `portal-rollback.yml` — manual rollback via workflow_dispatch
- `portal-migrate.yml` — manual database migration
- `portal-maintenance.yml` — TODO-to-issue conversion
- `web-deploy.yml` — OpenNext deploy to Cloudflare Workers (PR previews + prod)
- `chat-ci.yml` — bridge lint / test / coverage, Docker builds for IRC / XMPP / bridge
- `docs-ci.yml` — Mintlify validate + broken link check
- `codeql.yml` — CodeQL SAST (JS/TS, Python, Actions)
- `dependency-review.yml` — PR dependency vulnerability check
- `dependency-submission.yml` — bridge `uv.lock` → GitHub dependency graph
- `lint-infra.yml` — actionlint, hadolint, shellcheck, shfmt
- `pr-title.yml` — conventional commit PR title validation
- `pr-label.yml` — auto-label PRs by changed paths

Reusable workflows: `reusable-py-check.yml`, `reusable-docker-build.yml`

## License

[GPL-3.0](LICENSE)

## Stats

![Metrics](https://repobeats.axiom.co/api/embed/024cbbc4dc82cdc3fa9e0d304ff5a45607f2b656.svg)

## Contributors

![Contributors](https://contrib.rocks/image?repo=allthingslinux/monorepo)
