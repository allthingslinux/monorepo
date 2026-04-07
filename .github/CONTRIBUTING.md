# Contributing to All Things Linux

Thank you for your interest in contributing! This document outlines our monorepo development workflow.

## Environment Setup

We use `pnpm` (v10+), `uv`, and `turbo` for managing our monorepo.

1. **Install Dependencies**: `pnpm install`
2. **Bootstrap Setup**: `just setup` (orchestrates pnpm + uv)

## Development Workflow

- Run `just dev` to start the frontend application stack via Turborepo.
- Run `just chat-dev` to spin up Docker services.

## Linting & Formatting

We use modern, fast tools for code quality:

- **TypeScript/JavaScript**: `oxlint` and `oxfmt` (or `ultracite`)
- **Python**: `ruff`
- **Shell**: `shellcheck` and `shfmt`

Run `pnpm fix` to auto-format and fix linting errors across the entire monorepo.
Also, we strictly enforce structural checks via `sherif` (`pnpm run lint:repo`).

## Git Hooks & Commits

We use **Lefthook** for fast, parallelized git hooks:

- **Pre-commit**: Automatically runs linters in parallel.
- **Commit-msg**: Ensures commits adhere to Conventional Commits standards.
