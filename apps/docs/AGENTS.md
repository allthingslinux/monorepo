> For Mintlify product knowledge (components, configuration, writing standards), install the Mintlify skill: `npx skills add https://mintlify.com/docs`

# Documentation project instructions

## About this project

- This is **All Things Linux** technical documentation, built on [Mintlify](https://mintlify.com). ATL is a volunteer-driven **501(c)(3)** non-profit Linux community; see [About All Things Linux](about.mdx) for positioning and links.
- Pages are MDX files with YAML frontmatter.
- Configuration lives in `docs.json` at the project root.
- Run `pnpm dev` from `apps/docs` (or `mint dev`) to preview locally.
- Run `mint broken-links` to check links before publishing.

## Terminology

- **All Things Linux** / **ATL** — The organization ([allthingslinux.org](https://allthingslinux.org), [GitHub](https://github.com/allthingslinux)).
- **Docs** — This Mintlify site: **Overview** first, then **product dropdowns** in the sidebar (portal, atl.chat, atl.sh, atl.dev, atl.tools, atl.wiki, tux), then **Authoring** and **API reference**; not the full internal org handbook unless we add explicit pages.
- **Monorepo** — The repository containing `apps/docs`, `apps/web`, `apps/portal`, and shared packages.
- **non-profit** — Hyphenated in ATL communications (501(c)(3) status).
- Prefer **FOSS** / **open source**, **community-driven**, **beginner** (not “noob”), **accessible** (honest about difficulty—see org terminology guide).

## Style preferences

- Use active voice and second person ("you").
- Keep sentences concise — one idea per sentence.
- Use sentence case for headings.
- Bold for UI elements: Click **Settings**.
- Code formatting for file names, commands, paths, and code references.
- Avoid minimizing language (**just**, **simply**, **obviously**) when describing steps—aligned with org inclusive language norms.

## Content boundaries

- Document public contributor workflows, Mintlify usage, and APIs explicitly described in this repo.
- The OpenAPI **Plant Store** example under API reference is illustrative only; do not imply it is a live ATL production API without an explicit source page.
- Do not document unreleased or private admin-only features unless maintainers add a dedicated, intentional page.

## Assistant instructions

- Hosted assistant behavior is further shaped by [`.mintlify/Assistant.md`](.mintlify/Assistant.md). Keep that file aligned with terminology and boundaries here.