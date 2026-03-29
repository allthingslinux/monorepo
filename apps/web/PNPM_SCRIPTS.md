# PNPM Scripts Reference

This document explains all available pnpm scripts in the project.

## Development

- `pnpm run dev`
  Starts Next.js development server with hot module replacement at `http://localhost:3000`.

- `pnpm run dev:turbo`
  Starts Next.js development server using TurboPack (experimental faster Rust-based engine).

- `pnpm run trigger`
  Starts Trigger.dev development server for background job management.

## Building

- `pnpm run build`
  Compiles Next.js application for production.

## Deployment

Alchemy handles the full deploy pipeline: OpenNext build, worker upload, domain binding, and wrangler.jsonc generation.

- `pnpm run deploy`
  Runs `alchemy deploy --app web`. Default stage is your POSIX username; use `--stage dev` or `--stage prod` for shared workers.

- `pnpm run destroy`
  Runs `alchemy destroy --app web` (tear down Alchemy-managed resources for this app).

**CI:** production and dev deploys use [`.github/workflows/web-deploy.yml`](../../.github/workflows/web-deploy.yml) with `alchemy deploy`.

## Secrets Management

- `pnpm run secrets:dev`
  Uploads secrets to the development Cloudflare Worker.

- `pnpm run secrets:prod`
  Uploads secrets to the production Cloudflare Worker.

## Code Quality

- `pnpm run type-check`
  Runs `contentlayer2 build` then `tsc --noEmit` (generated types + MDX pipeline).

- `pnpm run check`
  Runs `type-check` then `ultracite check` (Oxlint + Oxfmt).

- `pnpm run fix`
  Runs `ultracite fix` for this package context.

## Infrastructure

- `pnpm run setup:bindings`
  Sets up Cloudflare bindings (R2 buckets, KV namespaces).

- `pnpm run test`
  Runs the test suite using Vitest.

- `pnpm run analyze:bundle`
  Provides guidance for bundle size analysis using ESBuild Bundle Analyzer.

- `pnpm run coc:generate`
  Generates the Code of Conduct markdown file from TOML configuration.
