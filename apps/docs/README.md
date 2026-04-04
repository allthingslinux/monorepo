# All Things Linux — documentation

Mintlify site (`docs.json` in this directory). Migrated from [allthingslinux/docs](https://github.com/allthingslinux/docs).

## Monorepo commands

From the **repository root**:

```bash
pnpm install
pnpm --filter @atl/docs dev
pnpm --filter @atl/docs build   # runs `mint validate`
```

Or run only this app’s scripts from `apps/docs` after install:

```bash
cd apps/docs && pnpm dev
```

Local preview: `http://localhost:3000` (Mintlify CLI).

## Publishing

Point the [Mintlify GitHub app](https://dashboard.mintlify.com/settings/organization/github-app) at this repository and set the **documentation root** to `apps/docs` (subdirectory deployment).

## AI-assisted writing

```bash
npx skills add https://mintlify.com/docs
```

See the [AI tools guides](./ai-tools/) in this tree for Cursor, Claude Code, and Windsurf.

## Troubleshooting

- If the dev server misbehaves: `pnpm exec mint update` for the latest CLI.
- 404s: ensure the working directory contains `docs.json`.

## Resources

- [Mintlify documentation](https://mintlify.com/docs)
