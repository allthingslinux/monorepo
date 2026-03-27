# `atl.services`

Centralized infrastructure and shared services for the **All Things Linux** ecosystem. This repository hosts the core observability stack, shared configurations, and utility services that power the broader network of ATL applications.

## 🏗️ Architecture Overview

The `atl.services` stack acts as the observability and management hub. Other stacks (`atl.chat`, `atl.network`, `tux`, etc.) connect to this hub via **Tailscale** to ship metrics, logs, and traces.

### Core Components

#### 📊 Metrics & Observability (`/metrics`)
A modern, monolithic observability stack designed for scale and efficiency.

| Service | Purpose | Port |
|---------|---------|------|
| **Grafana Mimir** | Long-term metrics storage (S3/R2 backend) | `:8080` |
| **Grafana Loki** | Log aggregation and querying | `:3100` |
| **Grafana** | Visualization and dashboards | `:3000` |
| **Grafana Alloy** | Unified telemetry collector (OTLP, Logs, Metrics) | `:12345` |
| **Alertmanager** | Alert routing and notifications | `:9093` |
| **Blackbox Exporter** | Uptime and endpoint monitoring | `:9115` |

### 🤝 Ecosystem Relations

This stack provides services to:

- **`atl.network`**: Gateway, auth, and network services.
- **`atl.chat`**: XMPP (Prosody) and IRC (UnrealIRCd) infrastructure.
- **`atl.wiki`**: MediaWiki and database stack.
- **`tux`**: Discord bot and associated services.
- **`iso.atl.dev`**: ISO archive and distribution.

## 🚀 Getting Started

### Prerequisites
- **Docker** & **Docker Compose**
- **Tailscale** (for secure inter-service communication)
- **Cloudflare R2 Buckets**: `atl-metrics-mimir`, `atl-metrics-mimir-blocks`

### Deployment

1. **Configure Secrets**:
   Copy the example environment file and populate your secrets (Grafana password, S3 keys, DB credentials).
   ```bash
   cd metrics
   cp .env.example .env
   nano .env
   ```

2. **Start the Stack**:
   ```bash
   docker compose up -d
   ```

3. **Verify Status**:
   ```bash
   docker compose ps
   ```

4. **Access Dashboards**:
   - **Grafana**: `http://localhost:3000` (or `https://metrics.atl.services` via public ingress)
   - **Alloy UI**: `http://localhost:12345`

## 📡 Service Instrumentation

To connect a new VPS or service to this stack:

1. **Include Shared Monitoring Agents**:
   Add the shared `monitoring-agents.yaml` template to your service's `compose.yaml`.

2. **Configure Alloy**:
   Deploy a local `grafana-alloy` container to collect logs and metrics and forward them to `atl.services` over Tailscale.

3. **Check Connectivity**:
   Ensure the service can reach `100.64.2.0` (atl.services Tailscale IP).

## 📂 Documentation

- **[Metrics Stack Guide](/docs/metrics-stack.md)**: Detailed architecture, configuration, and troubleshooting.

## 📄 License

Internal infrastructure code for All Things Linux. All rights reserved.
