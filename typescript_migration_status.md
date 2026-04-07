# Monorepo TypeScript Project References Migration Status

This document provides a comprehensive overview of the current state of the migration to TypeScript Project References, the issues encountered along the way, what has been accomplished, and the precise steps left to reach 100% completion.

## 📌 1. Current State

The migration to a formal TypeScript Project References architecture (`tsc -b`) is **nearly complete**. The monorepo synchronization engine (`scripts/sync-refs.mjs`) is functioning flawlessly, and the foundational internal workspace packages (such as `@atl/db`, `@atl/email`, `@atl/ui`, and most recently, `@atl/auth`) are compiling successfully in isolation.

The build graph DAG (Directed Acyclic Graph) is now intact. The primary blocker preventing the full repository from building with `pnpm ts:types` is resolving standard strict-mode TypeScript errors localized within individual applications (`apps/portal` and `apps/web`).

## ⚠️ 2. Main Issues Encountered

- **Severe Circular Dependencies (`TS2307`, `TS6059`)**: The `@atl/auth` package was tightly coupled to `apps/portal`. It tried to import environment validation keys and integration cleanup logic from inside the Next.js application, which created circular reference boundaries that crashed the TypeScript incremental compiler.
- **Leaking App Aliases**: `packages/auth/tsconfig.json` contained `@/features/*` and `@/shared/*` which illegally pointed inside `apps/portal`, meaning the package was not functioning as a true portable monorepo library.
- **`.d.ts` Declaration Emit Failures (`TS2883`)**: Internal libraries leveraging advanced Next.js routing and TanStack Query logic were failing to emit `.d.ts` declaration files because inferred types were missing the underlying workspace dependencies (e.g., `jose` or `@tanstack/query-core`).
- **Tooling Automation Errors**: The main automation script used to manage these references (`scripts/sync-refs.mjs`) had unhandled ESLint/Biome errors that caused the CI to fail on basic `pnpm check` commands.
- **Deprecated TypeScript Configs (`TS5101`)**: Packages were using the deprecated `baseUrl: "."` config which was failing builds under the strict TS 5.5+ standards.

## 🚀 3. What Has Been Done

1. **Decoupled Architecture (Inversion of Control)**:
   - Modified `packages/auth` to remove all imports from `apps/portal`.
   - Introduced a callback-based dependency injection object (`authCallbacks`) into `packages/auth/src/config.ts`.
   - Modified `apps/portal/src/instrumentation.ts` to dynamically register the portal-specific cleanup routines (like `cleanupIntegrationAccounts`) into `@atl/auth` when the Node.js runtime boots up. This completely severed the circular dependency.
2. **Fixed the PNPM Automation Script**:
   - Refactored `scripts/sync-refs.mjs` to resolve all linter warnings.
   - Restored and bulletproofed the logic where the script automatically maps `Workspace -> TS References` and ensures the baseline packages extend the correct `@atl/tsconfig` specifications.
3. **TypeScript Config & Emitters Cleanup**:
   - Cleaned `packages/auth/tsconfig.json` of all illegal relative path aliases and removed the deprecated `baseUrl` property.
   - Corrected inferred types in `server-client.ts` and `auth-hooks.ts` so they no longer throw `TS2883` errors, allowing `@atl/auth` to emit its types cleanly.
   - Successfully ran `pnpm tsc -b packages/auth` without any compilation errors.
4. **Progress Against Original Implementation Plan**:
   - **Centralize Configurations**: Created `@atl/tsconfig` with `base.json`, `nextjs.json`, and `library.json` patterns strictly defining the boundaries.
   - **Standardize Workspace Packages**: Most internal packages have been updated to extend `@atl/tsconfig/library.json`.
   - **Turborepo Integration**: Adjusted `turbo.json` caching and dependencies so `type-check` operations evaluate efficiently.
   - **Structural Modernization**: Migrated `apps/portal/packages/*` back to the root `packages/*`, renamed namespacing standard to `@atl/*`, and secured the monorepo graph resolving package installations without a hitch.

## 🎯 4. What Needs to Be Done Next

When you are able to return or start a new session, the following actionable items are left to finalize the migration:

1. **Fix `apps/portal` Typings**:
   - Currently, `apps/portal/src/instrumentation.ts` has a type error: `Implicit 'any' type on parameter 'user'`. You just need to import or specify the type (`SessionData` or `{ id: string }`) for the `authCallbacks.onBeforeUserDelete = async (user) => { ... }` function.
2. **Fix `apps/web` Internal Types**:
   - A few files inside `apps/web` (like `submitApplication.ts`, `feed.ts`, `utils.ts`, and `forms/*.ts`) have internal application-level TypeScript errors causing `apps/web` to fail its build script. These just need to be manually analyzed and typed correctly.
3. **Validate References in High-Level Apps**:
   - Verify that `apps/portal/tsconfig.json` correctly populates `@atl/auth` into its `references` list. If not, `sync-refs.mjs` will resolve this automatically once `package.json` correctly lists it as a strict dependency.
4. **Final Monorepo Verification**:
   - Run `pnpm ts:types`, `pnpm lint`, and `pnpm check`. Address any straggler warnings.
   - **Consumer Applications Cleanup**: Remove the final remnants of manual `paths` mappings for packages from `apps/portal/tsconfig.json` (e.g. `@/auth/*`) once `tsc -b` natively handles the `.d.ts` reference correctly.
   - The strict Project References migration process will then be complete!

Old notes:

# TypeScript Project References Migration

The current monorepo architecture relies on path aliases (`paths` in `tsconfig.json`) to resolve workspace boundaries during development. While this works initially, it causes TS compilation to evaluate the entire monorepo simultaneously, leading to slow type-checking and poor boundary enforcement.

To resolve this, we will transition to **Formal TypeScript Project References**. This allows the TypeScript compiler (`tsc`) to treat each package as an isolated, incremental build, drastically reducing `type-check` times and strictly enforcing dependency boundaries.

## User Review Required

> [!WARNING]  
> Transitioning to TS Project References requires strictness: Packages must emit their own `.d.ts` files incrementally to a `.tsbuildinfo` tracking file, and consumers must maintain an explicit `"references"` array in their `tsconfig.json`. Are you okay with adding a structural script (or manually managing) these reference arrays to keep them in sync with `package.json` dependencies?

> [!IMPORTANT]
> Next.js will continue to transpile internal packages from source (`src/index.ts`) via its App Router, so there is no impact to fast-refresh or runtime builds. This migration strictly optimizes the static `type-check` step.

## Proposed Changes

### 1. Centralize TypeScript Configurations

We will extract the duplicated TS settings into a dedicated configuration package to ensure consistency across the workspace.

#### [NEW] `packages/tsconfig/package.json`

Scaffold the `@atl/tsconfig` package.

#### [NEW] `packages/tsconfig/base.json`

Strict baseline TypeScript rules without build specifics.

#### [NEW] `packages/tsconfig/nextjs.json`

Config optimized for Next.js applications (`noEmit: true`, appropriate plugins).

#### [NEW] `packages/tsconfig/library.json`

Config optimized for composite internal packages.

- **Enables Project References**: `"composite": true`, `"declaration": true`, `"declarationMap": true`.
- **Incremental Builds**: `"emitDeclarationOnly": true` so it only builds types for consumer referencing, letting Next.js manage runtime transpilation.

---

### 2. Standardize Workspace Packages

Update all 14 internal packages to leverage the composite library configuration.

#### [MODIFY] `packages/*/tsconfig.json`

- Extend `@atl/tsconfig/library.json`.
- Remove all duplicated compiler options.
- Add `"references"` arrays pointing to other internal packages they depend on.

#### [MODIFY] `packages/*/package.json`

- Ensure internal packages have consistent `types` entry points pointing to the incrementally generated `.d.ts` files, or rely on TS 5+ resolution.

---

### 3. Update Consumer Applications

Transition our Next.js apps away from monolithic `paths` maps.

#### [MODIFY] `apps/portal/tsconfig.json` & `apps/web/tsconfig.json`

- Extend `@atl/tsconfig/nextjs.json`.
- **Remove** the cross-boundary `paths` aliases (e.g., `"@/auth/*": ["../../packages/auth/src/*"]`).
- **Add** `"references"` arrays mapping to their package dependencies.

---

### 4. Build Pipeline Modernization

Update Turborepo to leverage the new incremental graph.

#### [MODIFY] `turbo.json`

- Configure the `type-check` and `build` tasks to correctly cache `.tsbuildinfo` and emitted `.d.ts` types, preventing cache misses in the incremental graph.

## Open Questions

1.  **Reference Synchronization**: Managing `"references"` arrays manually can occasionally lead to drift vs `package.json` dependencies. Would you like me to introduce a small script (e.g., `sync-refs.js`) to automatically generate these arrays during installation, or is manual management preferred?
2.  **Output Architecture**: We can either isolate the type emit to standard `dist/` directories for each package or use a single aggregated output layer. Standard `dist/` is the recommended monorepo pattern. Does this align with your preferences?

## Verification Plan

### Automated Tests

- Run `pnpm type-check` across the workspace utilizing `tsc -b`. The execution should succeed and cache efficiently.
- Run `npx sherif` to ensure workspace boundary sanity is retained.
- Execute `pnpm dev` in `apps/portal` to guarantee Next.js fast-refresh remains unaffected.

### Build Metrics

- Observe the difference in execution time for a forced type-check rebuild, and verify that unmodified packages map instantly via `.tsbuildinfo` caches on subsequent validations.
