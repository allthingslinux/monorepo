# All Things Linux

[![Deploy to Production](https://img.shields.io/badge/Production-Deployed-brightgreen)](https://allthingslinux.org)
[![Deploy to Dev](https://img.shields.io/badge/Dev-Deployed-blue)](https://allthingslinux.dev)

The official website for All Things Linux ([allthingslinux.org](https://allthingslinux.org)).

## 🚀 Quick Start

```bash
# Clone & setup
git clone https://github.com/allthingslinux/allthingslinux.git
cd allthingslinux
pnpm install

# Start development
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) for Next.js dev.

## 📋 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS
- **Content:** Contentlayer (MDX blogs)
- **Deployment:** [Alchemy](https://alchemy.run) (TypeScript IaC) + OpenNext on Cloudflare Workers
  - Stages map to workers in `alchemy.run.ts` (`prod`, `dev`, `pr-<number>`, local defaults)
  - Alchemy handles the full pipeline: OpenNext build, worker upload, domain binding, wrangler.jsonc generation
- **Background Jobs:** Trigger.dev
- **Package Manager:** pnpm

## 📋 Prerequisites

- **Node.js** (see `package.json` engines field)
- **pnpm** - `npm install -g pnpm`
- **Cloudflare Account** (for deployments & secrets)
- **Trigger.dev Account** (for background jobs)

## 🛠️ Setup & Development

### 1. Clone & Install

````bash
git clone https://github.com/allthingslinux/allthingslinux.git
```bash
cd allthingslinux
pnpm install
````

### 2. Setup Cloudflare Bindings

```bash
# Create R2 buckets and KV namespaces
pnpm run setup:bindings
```

### 3. Configure Secrets

**For local development**, create `.env.secrets.dev` and `.env.secrets.prod` files (these are gitignored):

```bash
# Create .env.secrets.dev for local development (sandbox credentials)
# Create .env.secrets.prod for production credentials
# Add your secrets following the format: KEY=value (one per line)
```

**For CI/CD**, secrets are managed via GitHub Environments (see Deployment section below).

**Upload secrets to Cloudflare manually** (when needed):

````bash
```bash
pnpm run secrets:dev   # Upload dev/sandbox secrets to dev worker
pnpm run secrets:prod  # Upload production secrets to prod worker
````

### 4. Start Development

```bash
pnpm run dev  # Next.js dev server
```

**URLs:**

- **Next.js Dev:** [http://localhost:3000](http://localhost:3000) (with HMR)

## 🚀 Deployment

### Automatic Deployments (GitHub Actions CI/CD)

**GitHub Actions with GitHub Environments** - Automatic deployments on push/PR:

| Branch / event | Alchemy stage | Typical URL                                      |
| -------------- | ------------- | ------------------------------------------------ |
| `main` push    | `prod`        | [allthingslinux.org](https://allthingslinux.org) |
| PR to `main`   | `pr-<number>` | workers.dev preview URL (commented on the PR)    |

**Quick setup:**

1. Create GitHub Environments: `dev` and `prod` (Settings → Environments)
2. Add repository or environment secrets (see [Alchemy CI](https://alchemy.run/guides/ci/) and Cloudflare state store):
   - **Alchemy / Cloudflare:** `ALCHEMY_PASSWORD`, `ALCHEMY_STATE_TOKEN`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_EMAIL`
   - **App secrets (existing):** `QUICKBOOKS_*`, `GITHUB_TOKEN`, `MONDAY_API_KEY`, `TRIGGER_SECRET_KEY`, etc.
   - **Variables** (non-sensitive): `MONDAY_BOARD_ID`, `DISCORD_WEBHOOK_URL`, `QUICKBOOKS_ENVIRONMENT`
3. Push to `main` → deploys stage `prod`. Open a PR → deploys stage `pr-<number>`; closing the PR runs `alchemy destroy` for that stage.

See [`docs/integrations/quickbooks.md`](docs/integrations/quickbooks.md) for detailed QuickBooks integration setup.

**Architecture:** Separate Cloudflare Workers per stage; bindings are declared in `alchemy.run.ts`. CI uses [`web-deploy.yml`](../../.github/workflows/web-deploy.yml).

### Alchemy (local)

- **Default stage** is your POSIX username (`$USER`), not Wrangler’s `local` env. Use `--stage dev` or `--stage prod` to match shared workers.
- **From repo root:** `pnpm exec alchemy deploy --cwd apps/web --app web --stage <name>`
- **From `apps/web`:** `pnpm run deploy` (same as `pnpm exec alchemy deploy --app web`)
- **State:** set `ALCHEMY_STATE_TOKEN` for Cloudflare remote state (CI); without it, local deploys use filesystem state under `apps/web/.alchemy/` (gitignored).
- **Login:** `pnpm exec alchemy login` (profiles in `~/.alchemy`; CI uses API tokens only).

**Turborepo:** from the monorepo root, `pnpm turbo run deploy --filter=@atl/web` runs the web package’s `deploy` task (`cache: false`).

### Manual Deployments

#### Quick deploy

```bash
pnpm exec alchemy deploy --app web --stage dev   # Shared dev worker
pnpm exec alchemy deploy --app web --stage prod  # Production
pnpm run deploy                                  # alchemy deploy --app web (default stage: $USER)
```

CI uses the same Alchemy flow in [`web-deploy.yml`](../../.github/workflows/web-deploy.yml).

### Build process

```bash
# Next.js build only
pnpm run build

# Deploy (Alchemy handles OpenNext build internally)
pnpm run deploy
```

```bash
# Development commands
pnpm run dev            # Start Next.js dev server
pnpm run trigger        # Start Trigger.dev CLI
```

## 📁 Project Structure

## 🔐 Secrets & Environment

### CI/CD (GitHub Actions) - Recommended

**For automatic deployments**, use GitHub Environments with secrets:

1. **Set up GitHub Environments**: Create `dev` and `prod` environments (Settings → Environments)
2. **Add secrets** to each environment (same secret names, different values per environment)
3. **Secrets are automatically available** in GitHub Actions workflows

**Separate Workers**: Development and production use separate Cloudflare Workers for complete isolation.

### Manual Secret Management (Local)

**Note:** GitHub Actions automatically manages secrets during CI/CD. Manual secret management is mainly for local testing.

**For manual secret setup from your local machine:**

````bash
# 1. Create .env.secrets.dev and .env.secrets.prod files (gitignored)
# Format: KEY=value (one per line)
# .env.secrets.dev: Sandbox QuickBooks + other dev secrets
# .env.secrets.prod: Production QuickBooks + other prod secrets

# 2. Upload to Cloudflare Worker (sets secrets in respective environment workers)
```bash
pnpm run secrets:dev    # Upload secrets to dev worker
pnpm run secrets:prod   # Upload secrets to prod worker
````

### Security Notes

- **Never commit** `.env.secrets.*` (they're gitignored)
- **GitHub Environments** are the recommended way for CI/CD (secrets isolated per environment)
- **Secrets are encrypted** and managed via `wrangler secret put` or GitHub Environments
- **Use `.dev.vars`** only for non-sensitive local config
- **Environment variables** are defined in `alchemy.run.ts` per stage
- **Environment isolation**: Separate workers for dev/prod with isolated secrets

## 📁 Project Structure

```text
├── src/
│   ├── app/             # Next.js App Router pages
│   ├── components/      # React components
│   ├── lib/             # Utilities & integrations
│   ├── data/            # Form & app data
│   ├── types/           # Shared TypeScript types
│   ├── trigger/         # Background job definitions (Trigger.dev)
│   └── env.ts           # Validated environment (t3-env / build-time checks)
├── content/             # MDX blog content
├── public/              # Static assets
├── scripts/             # Build & utility scripts
├── types/               # Cloudflare binding types (alchemy-generated)
└── alchemy.run.ts       # Alchemy infrastructure definition
```

## 🛠️ Development Scripts

```bash
# Development
pnpm run dev            # Next.js development server
pnpm run dev:turbo      # Next.js with TurboPack (faster)
pnpm run trigger        # Trigger.dev background jobs

# Building
pnpm run build          # Next.js build

# Quality
pnpm run type-check     # contentlayer + TypeScript
pnpm run check          # type-check + Ultracite (oxlint + oxfmt)

# Deployment (Alchemy)
pnpm run deploy         # alchemy deploy --app web
pnpm run destroy        # alchemy destroy --app web

# Secrets
pnpm run secrets:dev    # Upload dev secrets to dev worker
pnpm run secrets:prod   # Upload prod secrets to prod worker

# Infrastructure
pnpm run setup:bindings # Setup Cloudflare bindings (R2, KV)
pnpm run analyze:bundle # Bundle size analysis guidance
pnpm run coc:generate   # Generate Code of Conduct
```

### Troubleshooting

See [`PNPM_SCRIPTS.md`](PNPM_SCRIPTS.md) for detailed script explanations.

## 🐛 Troubleshooting

### Common Issues

#### Build fails with "Module not found"

```bash
# Clear caches and reinstall
rm -rf node_modules .next .open-next
pnpm install
```

#### Wrangler secrets not working

```bash
# Check secrets are uploaded (for dev environment)
npx wrangler secret list --env dev

# For production environment
npx wrangler secret list --env prod

# Re-upload if needed
# Local secrets are handled via .dev.vars
```

#### Trigger.dev not connecting

```bash
# Check Trigger.dev CLI is running
pnpm run trigger
```

#### Environment variables not loading

- Check `.dev.vars` syntax (KEY=value, one per line)
- Ensure `NODE_ENV` is set correctly (Next.js sets this automatically - use only `development`, `production`, or `test`)
- Restart development servers after changes

### Performance Profiling

For performance analysis and debugging:

```bash
# Analyze bundle size after building
pnpm run analyze:bundle
# After running, check .open-next/server-functions/default/handler.mjs.meta.json
# Upload to https://esbuild.github.io/analyze/ for detailed bundle analysis
```

### Need Help?

- **Issues:** [GitHub Issues](https://github.com/allthingslinux/allthingslinux/issues)
- **Discussions:** [GitHub Discussions](https://github.com/allthingslinux/allthingslinux/discussions)
- **Documentation:** Check [`PNPM_SCRIPTS.md`](PNPM_SCRIPTS.md) for detailed script info

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and test locally
4. Submit a pull request

See [CONTRIBUTING.md](https://github.com/allthingslinux/allthingslinux/blob/main/code-of-conduct/CONTRIBUTING.md) for detailed guidelines.

---

Built with ❤️ by the All Things Linux community.
