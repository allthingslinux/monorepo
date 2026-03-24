# PNPM Scripts Reference

This document explains all available pnpm scripts in the project.

## Development

- `pnpm run dev`
  Starts Next.js development server with hot module replacement at `http://localhost:3000`.

- `pnpm run dev:turbo`
  Starts Next.js development server using TurboPack (experimental faster Rust-based engine).

- `pnpm run dev:all`
  Runs full-stack development: Next.js + Cloudflare Workers simulator + Trigger.dev background jobs.

- `pnpm run wrangler`
  Starts Cloudflare Workers development server with local environment simulation at `http://localhost:8788`.

- `pnpm run trigger`
  Starts Trigger.dev development server for background job management.

## Building

- `pnpm run build`
  Compiles Next.js application for production.

- `pnpm run build:all`
  Alias for `build:opennext` (OpenNext Cloudflare worker bundle). Use after `pnpm run build` when you need the full pipeline locally.

- `pnpm run build:opennext`
  Compiles the application using OpenNext.js Cloudflare adapter for Cloudflare Workers deployment.

- `pnpm run build:opennext:profile`
  Compiles with --noMinify flag for performance profiling and debugging (unminified code).

## Local Cloudflare testing

After `pnpm run build:opennext`, use `pnpm run wrangler` to run the worker locally (`wrangler dev --env local`). There is no separate `preview` script; CI deploys with Alchemy (`web-deploy` workflow).

## Deployment

- `pnpm run deploy`
  Runs `alchemy deploy --app web` from `apps/web`. Use `--stage dev` or `--stage prod` when you need shared workers; default stage is your POSIX username.

- `pnpm run destroy`
  Runs `alchemy destroy --app web` (tear down Alchemy-managed resources for this app).

**CI:** production and dev deploys use [`.github/workflows/web-deploy.yml`](../../.github/workflows/web-deploy.yml) with `alchemy deploy`.

## Secrets Management

- `pnpm run secrets:dev`
  Uploads secrets from `.env.secrets.dev` to the development Cloudflare Worker (uses `../../.github/scripts/web/secrets.sh` from `apps/web`).

- `pnpm run secrets:prod`
  Uploads secrets from `.env.secrets.prod` to the production Cloudflare Worker (uses `../../.github/scripts/web/secrets.sh` from `apps/web`).

## Code Quality

- `pnpm run type-check`
  Runs `contentlayer2 build` then `tsc --noEmit` (generated types + MDX pipeline).

- `pnpm run check`
  Runs `type-check` then `ultracite check` (Oxlint + Oxfmt). Repo root `pnpm check` / `pnpm fix` only run Ultracite across the monorepo.

- `pnpm run fix`
  Runs `ultracite fix` for this package context.

## Infrastructure

- `pnpm run setup:bindings`
  Sets up Cloudflare bindings (R2 buckets, KV namespaces). IMPORTANT: Update wrangler.jsonc with the KV ID from the script output.

- `pnpm run cf:typegen`
  Generates TypeScript types for Cloudflare Workers bindings and environment variables.

- `pnpm run test`
  Runs the test suite using Vitest with Cloudflare Workers testing capabilities.

- `pnpm run analyze:bundle`
  Provides guidance for bundle size analysis using ESBuild Bundle Analyzer on the built worker code.

- `pnpm run coc:generate`
  Generates the Code of Conduct markdown file from TOML configuration.
