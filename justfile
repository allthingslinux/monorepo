# All Things Linux monorepo — task runner (https://just.systems/)
# Requires: pnpm, Node 24+ (see package.json). Install `just` via your OS package manager.
#
# Workspace-wide: use `pnpm build`, `pnpm dev`, `pnpm check`, `pnpm type-check`, `pnpm test` — same as root package.json.
# App-specific: `pnpm --filter <name> <script>` (see each app’s package.json).
# Common filters: `allthingslinux` (apps/web), `@portal/portal`, `@atl/docs`.

set dotenv-load := true
set positional-arguments := true

# Default: show available recipes
default:
    @just --list

# --- Workspace (repo root) ---

install:
    pnpm install

install-frozen:
    pnpm install --frozen-lockfile

build:
    pnpm exec turbo run build

dev:
    pnpm exec turbo run dev

check:
    pnpm run check

fix:
    pnpm run fix

typecheck:
    pnpm exec turbo run type-check

test:
    pnpm exec turbo run test

test-coverage:
    pnpm exec turbo run test:coverage

clean:
    pnpm run clean

# --- apps/web (marketing, OpenNext + Alchemy) — package: allthingslinux ---

web-dev:
    pnpm --filter allthingslinux dev

web-dev-all:
    pnpm --filter allthingslinux run dev:all

web-build:
    pnpm --filter allthingslinux run build:all

web-deploy:
    pnpm --filter allthingslinux run deploy

web-destroy:
    pnpm --filter allthingslinux run destroy

web-cf-typegen:
    pnpm --filter allthingslinux run cf:typegen

# --- apps/docs (Mintlify) — package: @atl/docs ---

docs-dev:
    pnpm --filter @atl/docs dev

docs-build:
    pnpm --filter @atl/docs run build

docs-broken-links:
    pnpm --filter @atl/docs run broken-links

# --- apps/portal — package: @portal/portal ---

portal-dev:
    pnpm --filter @portal/portal dev

portal-build:
    pnpm --filter @portal/portal build

portal-start:
    pnpm --filter @portal/portal start

# Portal database (Docker + Drizzle in packages)
portal-db-up:
    pnpm --filter @portal/portal run compose:db

portal-db-down:
    pnpm --filter @portal/portal run compose:db:down

portal-db-generate:
    pnpm --filter @portal/portal run db:generate

portal-db-migrate:
    pnpm --filter @portal/portal run db:migrate

portal-db-push:
    pnpm --filter @portal/portal run db:push

portal-db-studio:
    pnpm --filter @portal/portal run db:studio

portal-db-seed:
    pnpm --filter @portal/portal run db:seed
