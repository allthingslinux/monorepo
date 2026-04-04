# Fluux Messenger (Docker image)

> Scope: `services/chat/xmpp-client-fluux/` — inherits monorepo [AGENTS.md](../../AGENTS.md).

Build context for the **Fluux** XMPP web client (upstream [processone/fluux-messenger](https://github.com/processone/fluux-messenger)): multi-stage image clones a pinned tag, builds the Vite app, and serves static assets with **nginx**. Wired into the stack via [infra/compose/chat-fluux.yaml](../../infra/compose/fluux-messenger.yaml) (`atl-xmpp-client-fluux` service).

## Files

| File                        | Purpose                                                  |
| --------------------------- | -------------------------------------------------------- |
| `Containerfile`             | Multi-stage build (clone, `pnpm build`, nginx runtime)   |
| `docker-entrypoint.sh`      | Substitute `FLUUX_DOMAIN` / cert paths into nginx config |
| `nginx-tls.conf.template`   | HTTPS server block (shared cert mount)                   |
| `nginx-plain.conf.template` | HTTP-only variant                                        |

## Environment (root `.env` / `.env.example`)

| Variable                     | Role                                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------------------- |
| `FLUUX_VERSION`              | Git tag to build (build arg)                                                                |
| `FLUUX_DOMAIN`               | Public hostname for the client                                                              |
| `FLUUX_CERT_DOMAIN`          | Certificate / TLS identity helper for entrypoint                                            |
| `FLUUX_MESSENGER_PORT`       | Host → container `80`                                                                       |
| `FLUUX_MESSENGER_HTTPS_PORT` | Host → container `443`                                                                      |
| `XMPP_DOMAIN`                | Prosody virtual host; sent as `Host` when proxying `/ws` to Prosody (must match JID domain) |

## Connecting to XMPP (Fluux login)

Fluux derives **`https://<JID-domain>/.well-known/…`** and **`wss://<JID-domain>/ws`** when “Server (optional)” is empty — those use **default port 443**, not `PROSODY_HTTPS_PORT` (5281).

**Default stack behavior:** `atl-xmpp-nginx` listens on **5281** and **443** (TLS) and publishes **`127.0.0.1:443` → :443** so `https://xmpp.localhost/…` and `wss://xmpp.localhost/ws` work without a port. Ensure **`xmpp.localhost`** resolves (e.g. `/etc/hosts`) and accept the dev cert in the browser.

**If 127.0.0.1:443 is already in use**, remove the `443` mapping in `infra/compose/chat-xmpp.yaml` and either set **Server (optional)** to `wss://xmpp.localhost:5281/ws` or use the Fluux container proxy: `wss://localhost:8443/ws` / `ws://localhost:8091/ws` (rebuild `atl-xmpp-client-fluux` after nginx template changes).

Rebuild **`atl-xmpp-nginx`** after changing `infra/nginx/prosody-https.conf.template`: `docker compose … build atl-xmpp-nginx` (or `just build`).

## Related

- [infra/AGENTS.md](../../infra/AGENTS.md) — compose fragments
- [apps/docs/content/docs/reference/environment-variables.mdx](../docs/content/docs/reference/environment-variables.mdx) — full env reference (Fluux section)
