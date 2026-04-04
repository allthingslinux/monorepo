# Chat Web

> Scope: atl.chat landing page. Inherits monorepo [AGENTS.md](../../AGENTS.md).

Next.js web application for [atl.chat](https://atl.chat).

## Tech Stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · @atl/ui (shadcn + @base-ui/react)

## Repository Structure

```
app/
├── layout.tsx, page.tsx
├── globals.css
├── favicon.ico
└── fonts/

components/
└── ui/               # shadcn components

lib/
└── utils.ts
```

## Key Commands

All commands from monorepo root:

| Command      | Purpose                                      |
| ------------ | -------------------------------------------- |
| `pnpm dev`   | Start all apps via Turbo (includes chat-web) |
| `pnpm build` | Build all apps                               |
| `pnpm check` | Ultracite lint check (Oxlint + Oxfmt)        |
| `pnpm fix`   | Ultracite lint fix                           |

## Related

- [Monorepo AGENTS.md](../../AGENTS.md)
