# TODO

## Monorepo / Tooling

- [ ] **`pnpm-workspace.yaml`**: Change explicit app paths to glob `apps/*` so new apps are auto-included
- [ ] **`typegen` task**: Remove `cache: false` — it has `outputs: [".next/types/**"]` so it should be cacheable
- [ ] **`sync-refs.mjs`**: The script sets `outDir: "dist"` on all library packages — now that `packages/*/dist/` is gitignored and we use source-first exports, this may be unnecessary. Audit whether any package actually needs it.
- [ ] **Portal path aliases**: Remove `@/auth/*` and `@/config/*` path aliases from `apps/portal/tsconfig.json` and replace all usages with `@atl/auth` and `@atl/config` imports directly (requires renaming imports across portal source)
- [ ] **Remote caching**: Configure Turborepo remote cache (`TURBO_TOKEN` + `TURBO_TEAM`) in CI workflows to share build cache across runs — biggest CI speed win available
- [ ] **CODEOWNERS**: Add `.github/CODEOWNERS` to assign package ownership (e.g. `packages/auth` → security team)
- [ ] **Circular dependency detection**: Run `turbo boundaries` (built-in, experimental) in CI — checks cross-package file imports and undeclared dependencies. Consider adding tag-based rules in `turbo.json` for `boundaries.tags`

- [ ] **`@atl/integrations` quickbooks.ts**: 11 pre-existing `no-unsafe-*` type errors from untyped API responses — add proper types for QuickBooks API response shapes
- [ ] **`--affected` in CI**: Update CI workflows to use `turbo run build --affected` / `turbo run test --affected` instead of full builds on every PR
- [ ] **PR template**: Add `.github/PULL_REQUEST_TEMPLATE.md` with packages changed, type of change, and checklist
- [ ] **ADRs**: Start `docs/adr/` with decisions like source-first exports, Turborepo selection, pnpm catalogs
- [ ] **Migrate hardcoded versions to catalogs**: `apps/portal` (43) and `apps/web` (37) still have hardcoded dependency versions — run `pnpx codemod pnpm/catalog` then manually verify
- [ ] **`disallowWorkspaceCycles`**: Add `.npmrc` with `disallow-workspace-cycles=true` to fail install on circular workspace dependencies
- [ ] **Stricter tsconfig options**: Consider enabling `noUncheckedIndexedAccess` and `noImplicitOverride` in `@atl/tsconfig/base.json` for additional type safety
