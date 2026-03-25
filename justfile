# All Things Linux monorepo — task runner (https://just.systems/)
# Requires: pnpm, Node 24+ (see package.json). Install `just` via your OS package manager.
#
# Workspace-wide: use `pnpm build`, `pnpm dev`, `pnpm check`, `pnpm type-check`, `pnpm test` — same as root package.json.
# App-specific: `pnpm --filter <name> <script>` (see each app’s package.json).
# Common filters: `@atl/web`, `@atl/portal`, `@atl/docs`.

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

# --- apps/web (marketing, OpenNext + Alchemy) — package: @atl/web ---

web-dev:
    pnpm --filter @atl/web dev

web-dev-all:
    pnpm --filter @atl/web run dev:all

web-build:
    pnpm --filter @atl/web run build:all

web-deploy:
    pnpm --filter @atl/web run deploy

web-destroy:
    pnpm --filter @atl/web run destroy

web-cf-typegen:
    pnpm --filter @atl/web run cf:typegen

# Shadcn CLI must run with apps/web as cwd so components.json applies (components → @/components, ui → @atl/ui/components; @shadcnblocks needs SHADCNBLOCKS_API_KEY). Uses npx shadcn@latest because the workspace shadcn pin can break against current zod (e.g. deepPartial). Passes --overwrite so adds are non-interactive. Example: `just web-shadcn-add @shadcnblocks/hero125 -y`
web-shadcn-add *ARGS:
    cd apps/web && npx shadcn@latest add --overwrite {{ ARGS }}

# Same pattern as web: run from apps/portal so portal/components.json (aliases, @shadcnblocks) applies.
portal-shadcn-add *ARGS:
    cd apps/portal && npx shadcn@latest add --overwrite {{ ARGS }}

# --- apps/docs (Mintlify) — package: @atl/docs ---

docs-dev:
    pnpm --filter @atl/docs dev

docs-build:
    pnpm --filter @atl/docs run build

docs-broken-links:
    pnpm --filter @atl/docs run broken-links

# --- apps/portal — package: @atl/portal ---

portal-dev:
    pnpm --filter @atl/portal dev

portal-build:
    pnpm --filter @atl/portal build

portal-start:
    pnpm --filter @atl/portal start

# Portal database (Docker + Drizzle in packages)
portal-db-up:
    pnpm --filter @atl/portal run compose:db

portal-db-down:
    pnpm --filter @atl/portal run compose:db:down

portal-db-generate:
    pnpm --filter @atl/portal run db:generate

portal-db-migrate:
    pnpm --filter @atl/portal run db:migrate

portal-db-push:
    pnpm --filter @atl/portal run db:push

portal-db-studio:
    pnpm --filter @atl/portal run db:studio

portal-db-seed:
    pnpm --filter @atl/portal run db:seed
