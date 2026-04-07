# allthingslinux monorepo

Unified monorepo for [All Things Linux](https://allthingslinux.org): marketing site, portal (identity stack), chat infrastructure (IRC / XMPP / bridge), self-hosted tools ([atl.tools](https://atl.tools)), network services, and observability stack.

## Layout

```
apps/
├── web            @atl/web — marketing site (Next.js 16, OpenNext / Cloudflare)
├── portal         @atl/portal — identity & admin portal (Next.js 16, PostgreSQL)
├── chat-web       @atl/chat-web — atl.chat landing page (Next.js 16)
├── docs           @atl/docs — product documentation (Mintlify)
├── tools-web      @atl/tools-web — atl.tools directory (Next.js 16, OpenNext / Cloudflare)
└── bridge         Discord↔IRC↔XMPP bridge (Python / uv — NOT in pnpm workspace)

packages/
├── ui             @atl/ui — shared design system (shadcn/ui + @base-ui/react)
├── auth           @atl/auth — Better Auth config, client, hooks, and DAL
├── db             @atl/db — shared Drizzle schema, client, and relations
├── api            @atl/api — TanStack Query keys, server queries, hydration helpers
├── schemas        @atl/schemas — shared Zod schemas (user, integrations)
├── types          @atl/types — shared TypeScript types (auth, API, email, routes)
├── email          @atl/email — email sending utilities (React Email)
├── env            @atl/env — shared environment variable validation (t3-env)
├── config         @atl/config — shared static config (community, events, donate)
├── seo            @atl/seo — metadata, JSON-LD, robots, sitemap helpers
├── utils          @atl/utils — shared utility functions (date, format, error)
├── integrations   @atl/integrations — third-party API clients (Discord, GitHub, Fibery)
├── fibery         @atl/fibery — Fibery SDK (portal admin, career applications)
├── observability  @atl/observability — Sentry / OpenTelemetry helpers
├── tools-manifest @atl/tools-manifest — tool definitions consumed by apps/tools-web
└── tsconfig       @atl/tsconfig — shared TypeScript configurations

services/
├── chat/          IRC (UnrealIRCd + Atheme), XMPP (Prosody), web clients
├── network/       DNS (Blocky), TURN (coturn), uptime (Gatus), SFTP
├── tools/         Self-hosted tools (PrivateBin, SearXNG, Stirling-PDF, …)
└── observability/ Grafana, Loki, Mimir, Alloy, Alloy Agent, Blackbox

infra/
├── chat/          Docker Compose fragments (chat-*.yaml)
├── network/       Docker Compose fragments (network.yaml)
├── observability/ Docker Compose fragments (observability.yaml)
├── tools/         Docker Compose fragments (tools-*.yaml)
├── nginx/         Nginx reverse proxy config (Prosody HTTPS)
├── sh/            atl.sh pubnix provisioning (Ansible, Terraform, skel, Vagrant)
├── cert-manager.yaml  TLS certificate management (included by root compose.yaml)
└── networks.yaml      Shared Docker network definitions (included by root compose.yaml)

scripts/           Shell scripts (init.sh — data dirs + dev certs)

tests/
├── unit/          Bridge unit tests
├── integration/   Bridge integration tests
├── e2e/           End-to-end tests
├── protocol/      Protocol-level tests
└── ...            fixtures/, controllers/, irc_utils/, utils/, legacy/
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

| Command                  | Purpose                                    |
| ------------------------ | ------------------------------------------ |
| `just setup`             | Full bootstrap (JS + Python + env + certs) |
| `just install`           | `pnpm install`                             |
| `just install-frozen`    | `pnpm install --frozen-lockfile`           |
| `just dev`               | Start all JS apps via Turborepo            |
| `just build`             | Production build (Turbo graph)             |
| `just check`             | Lint + format check (Ultracite)            |
| `just fix`               | Lint + format fix (Ultracite)              |
| `just typecheck`         | TypeScript validation across all packages  |
| `just test`              | Run all tests via Turborepo                |
| `just test-coverage`     | Run tests with coverage                    |
| `just clean`             | Remove build artifacts                     |
| `just renovate-validate` | Validate Renovate config                   |
| `just docker-clean`      | Prune unused Docker images and volumes     |
| `just docker-push-all`   | Push all Docker images to registry         |

### Apps

| Command                         | Purpose                               |
| ------------------------------- | ------------------------------------- |
| `just web-dev`                  | Marketing site dev server             |
| `just web-build`                | Build marketing site                  |
| `just web-deploy`               | Deploy to Cloudflare Workers          |
| `just web-destroy`              | Destroy Cloudflare Workers deployment |
| `just web-shadcn-add [args]`    | Add shadcn/ui component to web        |
| `just chat-web-dev`             | atl.chat dev server                   |
| `just chat-web-build`           | Build atl.chat site                   |
| `just chat-web-deploy`          | Deploy atl.chat to Cloudflare Workers |
| `just portal-dev`               | Portal dev server                     |
| `just portal-build`             | Build portal                          |
| `just portal-start`             | Start portal (production mode)        |
| `just portal-db-up`             | Start PostgreSQL (Docker)             |
| `just portal-db-down`           | Stop PostgreSQL                       |
| `just portal-db-generate`       | Generate Drizzle migration files      |
| `just portal-db-migrate`        | Run pending migrations                |
| `just portal-db-push`           | Push schema to dev DB                 |
| `just portal-db-seed`           | Seed the database                     |
| `just portal-db-studio`         | Open Drizzle Studio                   |
| `just portal-shadcn-add [args]` | Add shadcn/ui component to portal     |
| `just docs-dev`                 | Mintlify docs preview                 |
| `just docs-build`               | Build docs                            |
| `just docs-check-links`         | Check for broken links                |

### Tools (atl.tools)

| Command                 | Purpose                                |
| ----------------------- | -------------------------------------- |
| `just tools-dev`        | Start all tools Docker services (dev)  |
| `just tools-up`         | Start all tools Docker services (prod) |
| `just tools-down`       | Stop all tools Docker services         |
| `just tools-logs`       | Tail tools container logs              |
| `just tools-status`     | Show running tools containers          |
| `just tools-build`      | Build custom service images            |
| `just tools-web-dev`    | atl.tools Next.js dev server           |
| `just tools-web-build`  | Build atl.tools site                   |
| `just tools-web-deploy` | Deploy atl.tools to Cloudflare Workers |

### Chat services (Docker)

| Command                       | Purpose                                      |
| ----------------------------- | -------------------------------------------- |
| `just chat-init`              | Initialize chat data directories and config  |
| `just chat-dev`               | Start all chat services (dev profile)        |
| `just chat-prod`              | Start all chat services (production profile) |
| `just chat-down`              | Stop chat services (dev)                     |
| `just chat-down-prod`         | Stop chat services (production)              |
| `just chat-logs`              | Tail logs (optionally filter by name)        |
| `just chat-status`            | Show running containers                      |
| `just chat-build`             | Build all service images                     |
| `just chat-build-clean [svc]` | Build service images (no cache)              |
| `just prosody-token`          | Generate a Prosody API token                 |
| `just gencloak`               | Generate IRC cloaking key                    |

### Bridge (Python)

| Command                 | Purpose                    |
| ----------------------- | -------------------------- |
| `just bridge-install`   | `uv sync --all-extras`     |
| `just bridge-check`     | Ruff lint + format check   |
| `just bridge-fix`       | Ruff lint fix + format     |
| `just bridge-typecheck` | basedpyright type check    |
| `just bridge-test`      | pytest suite               |
| `just bridge-logs`      | Tail bridge container logs |

### Pubnix (atl.sh)

| Command                                         | Purpose                             |
| ----------------------------------------------- | ----------------------------------- |
| `just pubnix-setup`                             | Install Ansible deps + galaxy roles |
| `just pubnix-install`                           | Install Ansible collections         |
| `just pubnix-deploy <target>`                   | Ansible deploy (dev/staging/prod)   |
| `just pubnix-deploy-tag <target> <tag>`         | Deploy specific roles by tag        |
| `just pubnix-deploy-check <target>`             | Dry run (check mode)                |
| `just pubnix-deploy-list-tags`                  | List available deploy tags          |
| `just pubnix-ping <target>`                     | Ping Ansible hosts                  |
| `just pubnix-syntax-check`                      | Ansible syntax check                |
| `just pubnix-create-user <user> <key> <target>` | Create user on pubnix server        |
| `just pubnix-remove-user <user> <target>`       | Remove user from pubnix server      |
| `just pubnix-molecule-test <role>`              | Molecule test for an Ansible role   |
| `just pubnix-molecule-converge <role>`          | Molecule converge (apply role)      |
| `just pubnix-molecule-verify <role>`            | Molecule verify                     |
| `just pubnix-molecule-destroy <role>`           | Molecule destroy                    |
| `just pubnix-smoke-test [target]`               | End-to-end smoke test               |
| `just pubnix-tf-init`                           | Terraform init                      |
| `just pubnix-tf-plan`                           | Terraform plan                      |
| `just pubnix-tf-apply`                          | Terraform apply                     |
| `just pubnix-vault-edit`                        | Edit Ansible vault secrets          |
| `just pubnix-dev-up`                            | Start Vagrant dev VM                |
| `just pubnix-dev-down`                          | Stop Vagrant dev VM                 |
| `just pubnix-lint`                              | ansible-lint + pre-commit           |

## Environment variables

Three env file layers at the repo root:

| File        | Purpose                                 |
| ----------- | --------------------------------------- |
| `.env`      | Shared secrets and base config          |
| `.env.dev`  | Dev-only overrides (ports, debug flags) |
| `.env.prod` | Production overrides                    |

Docker Compose always requires `--env-file .env --env-file .env.dev` (or `.env.prod`). The `just` recipes handle this automatically.

Two Compose override files handle environment-specific service config:

| File                         | Purpose                                        |
| ---------------------------- | ---------------------------------------------- |
| `compose.dev-override.yaml`  | Dev overrides (bind mounts, debug ports, etc.) |
| `compose.prod-override.yaml` | Production overrides (restart policies, etc.)  |

`just chat-dev` uses `compose.yaml` + `compose.dev-override.yaml`. `just chat-prod` uses `compose.yaml` + `compose.prod-override.yaml`.

Portal has its own `.env` at `apps/portal/.env` — see `apps/portal/README.md` for details.

## Shared config

| Concern             | Location                                                                          |
| ------------------- | --------------------------------------------------------------------------------- |
| Git                 | Root `.gitignore`                                                                 |
| Commits             | `commitlint.config.cjs` + `.husky/commit-msg`                                     |
| Lint / format       | `.oxlintrc.json` + `.oxfmtrc.jsonc` (Ultracite: Oxlint + Oxfmt)                   |
| Pre-commit          | Husky + lint-staged (see below)                                                   |
| Turborepo           | Root `turbo.json`; app overrides in `apps/*/turbo.json`                           |
| Dependency versions | `pnpm-workspace.yaml` `catalog:` section                                          |
| CI                  | `.github/workflows/` + `.github/actions/setup-node-pnpm/`                         |
| Renovate            | `.github/renovate.json5`                                                          |
| Docker              | `infra/{chat,network,observability,tools}/*.yaml` included by root `compose.yaml` |

### Pre-commit hooks (Husky + lint-staged)

| Glob                | Tools                     |
| ------------------- | ------------------------- |
| `*.{ts,tsx,js,jsx}` | Oxlint + Oxfmt            |
| `*.py`              | Ruff check --fix + format |
| `*.sh`              | ShellCheck + shfmt        |

## CI / GitHub Actions

Workflows in `.github/workflows/`:

- `portal-ci.yml` — lint, type-check, build, test, knip, release for @atl/portal
- `portal-deploy.yml` — Docker build + SSH deploy (staging / production)
- `portal-rollback.yml` — manual rollback via workflow_dispatch
- `portal-migrate.yml` — manual database migration
- `portal-maintenance.yml` — TODO-to-issue conversion on push to main
- `web-deploy.yml` — Alchemy / OpenNext deploy to Cloudflare Workers (PR previews + prod)
- `chat-ci.yml` — bridge lint / test / coverage, Docker builds for IRC / XMPP / bridge
- `chat-web-ci.yml` — lint, typecheck, turbo build for @atl/chat-web
- `chat-web-deploy.yml` — Alchemy / OpenNext deploy for atl.chat (prod)
- `tools-ci.yml` / `tools-deploy.yml` — @atl/tools-web + tools-manifest checks and deploy
- `pubnix-ci.yml` — Ansible lint, Terraform validate, ShellCheck for `infra/sh` (Molecule is local: `just pubnix-molecule-test`)
- `docs-ci.yml` — Mintlify validate + broken link check
- `codeql.yml` — CodeQL SAST (JS/TS, Python, Actions)
- `dependency-review.yml` — PR dependency vulnerability check
- `dependency-submission.yml` — bridge `uv.lock` → GitHub dependency graph
- `lint-infra.yml` — actionlint, hadolint, shellcheck, shfmt
- `pr-title.yml` — conventional commit PR title validation
- `pr-label.yml` — auto-label PRs by changed paths

Reusable workflows: `reusable-py-check.yml`, `reusable-docker-build.yml`

Composite: `.github/actions/setup-node-pnpm/` (Node + pnpm + frozen install).

**Maintainers:** required checks and merge queue — [.github/REQUIRED_CHECKS.md](.github/REQUIRED_CHECKS.md); workflow metrics — [.github/docs/CI_METRICS.md](.github/docs/CI_METRICS.md); `harden-runner` policy — [.github/HARDEN_RUNNER.md](.github/HARDEN_RUNNER.md).

## License

[GPL-3.0](LICENSE)

## Stats

![Metrics](https://repobeats.axiom.co/api/embed/024cbbc4dc82cdc3fa9e0d304ff5a45607f2b656.svg)

## Contributors

![Contributors](https://contrib.rocks/image?repo=allthingslinux/monorepo)
