> For Mintlify product knowledge (components, configuration, writing standards), install the Mintlify skill: `npx skills add https://mintlify.com/docs`

# Documentation project instructions

## About this project

- This is the **All Things Linux** documentation site, built on [Mintlify](https://mintlify.com).
- Pages are MDX files with YAML frontmatter.
- Configuration lives in `docs.json` at the project root.
- Run `pnpm dev` from `apps/docs` (or `mint dev`) to preview locally.
- Run `mint broken-links` to check links before publishing.

## Terminology

- **All Things Linux** / **ATL** — The community and GitHub organization ([allthingslinux](https://github.com/allthingslinux)).
- **Docs** — This Mintlify site; not the main marketing site or app UI unless a page says otherwise.
- **Monorepo** — The repository that contains `apps/docs`, `apps/web`, `apps/portal`, and shared packages.

## Style preferences

- Use active voice and second person ("you").
- Keep sentences concise — one idea per sentence.
- Use sentence case for headings.
- Bold for UI elements: Click **Settings**.
- Code formatting for file names, commands, paths, and code references.

## Content boundaries

- Document public contributor workflows, Mintlify usage, and APIs that are explicitly described in this repo.
- The OpenAPI **Plant Store** example under API reference is illustrative only; do not imply it is a live ATL production API without an explicit source page.
- Do not document unreleased or private admin-only features unless maintainers add a dedicated, intentional page.

## Assistant instructions

- Hosted assistant behavior is further shaped by [`.mintlify/Assistant.md`](.mintlify/Assistant.md). Keep that file aligned with terminology and boundaries here.