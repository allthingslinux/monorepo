# atl.tools

A curated directory of free, self-hosted tools by [All Things Linux](https://allthingslinux.org). Browse, search, and filter services at [atl.tools](https://atl.tools).

## Hosted services

All services are accessible to members of the All Things Linux community. Each
one runs self-hosted on our infrastructure — no third-party data sharing.

| Service | URL | Category | Description |
| --- | --- | --- | --- |
| [PrivateBin](https://paste.atl.tools) | `paste.atl.tools` | Privacy | Zero-knowledge encrypted paste. The server never sees your data — everything is encrypted and decrypted in the browser. |
| [SearXNG](https://search.atl.tools) | `search.atl.tools` | Search | Privacy-respecting metasearch engine. Aggregates results from 70+ sources with no tracking, no ads, no profiles. |
| [CyberChef](https://cyberchef.atl.tools) | `cyberchef.atl.tools` | Utilities | The Cyber Swiss Army Knife. Encode, decode, encrypt, compress — 300+ operations for data wrangling and analysis. |
| [ConvertX](https://convert.atl.tools) | `convert.atl.tools` | Conversion | Self-hosted file converter. Audio, video, images, documents — convert between formats without uploading to third-party services. |
| [IT-Tools](https://it.atl.tools) | `it.atl.tools` | Development | A curated toolbox for developers and sysadmins. Token generators, formatters, converters, network tools and more. |
| [JSON Crack](https://json.atl.tools) | `json.atl.tools` | Visualization | Visualize JSON, YAML, XML and CSV as interactive graphs. Format, validate, convert and explore structured data in the browser. |
| [Stirling PDF](https://pdf.atl.tools) | `pdf.atl.tools` | Documents | Self-hosted PDF Swiss Army Knife. Merge, split, compress, convert, OCR, sign and watermark — all in the browser. |

## Stack

- **Framework** — Next.js 16 (App Router)
- **Styling** — Tailwind CSS v4
- **Deployment** — Cloudflare Workers via [Alchemy](https://github.com/sam-goodwin/alchemy) + [OpenNext](https://opennext.js.org/cloudflare)
- **Monorepo** — pnpm workspaces + Turborepo
- **Linting** — Biome

## Structure

```
atl.tools/
├── apps/
│   └── web/                  # Next.js app
│       ├── src/
│       │   ├── app/          # App router pages + global CSS
│       │   └── components/   # AppShell, ServiceCard
│       └── alchemy.run.ts    # Cloudflare deployment config
└── packages/
    └── manifest/             # Service definitions (single source of truth)
        └── src/index.ts
```

## Development

```bash
pnpm install
pnpm dev
```

The app runs at `http://localhost:3000`.

## Adding a Service

All services are defined in `packages/manifest/src/index.ts`. Add an entry to the `services` array:

```ts
{
  id: "my-service",
  name: "My Service",
  description: "One-line description of what it does.",
  url: "https://myservice.atl.tools",
  icon: "Terminal",         // Lucide icon name (PascalCase)
  color: "yellow",          // see CatppuccinColor type
  category: "utilities",    // see ServiceCategory type
  status: "active",         // "active" | "planned" | "maintenance"
  tags: ["tag1", "tag2"],
},
```

Available categories: `privacy`, `utilities`, `search`, `development`, `conversion`, `visualization`, `documents`

## Deployment

Authentication (first time):

```bash
pnpm --filter @atl.tools/web exec alchemy login
```

Deploy to staging:

```bash
pnpm deploy
```

Deploy to production (`atl.tools`):

```bash
pnpm deploy:prod
```

Tear down:

```bash
pnpm destroy:prod
```

## Links

- [allthingslinux.org](https://allthingslinux.org)
- [Discord](https://discord.gg/linux)
- [GitHub](https://github.com/allthingslinux/atl.tools)
