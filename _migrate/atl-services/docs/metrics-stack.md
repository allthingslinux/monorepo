# Metrics Stack Documentation

This document details the architecture, configuration, and operational guide for the centralized observability stack in `atl.services`.

## 🏗️ Architecture

The stack is designed as a **Monolithic** deployment for simplicity and efficiency, leveraging **Grafana Mimir** for long-term storage and **Cloudflare R2** as the object storage backend.

### Components

1.  **Prometheus (`:9090`)**:
    - Acts as the primary scrape engine and temporary storage (15 days retention).
    - Scrapes targets defined in `prometheus.yml`.
    - Forwards all metrics to Mimir via `remote_write`.

2.  **Grafana Mimir (`:8080`)**:
    - Long-term storage backend (S3/R2 compatible).
    - Receives metrics from Prometheus.
    - Provides PromQL query API for Grafana.
    - Configured in "Monolithic" mode (all components in one binary).

3.  **Grafana Loki (`:3100`)**:
    - Log aggregation system.
    - Uses filesystem storage for chunks and index (TSDB schema).
    - Designed for high-volume, low-latency log search.

4.  **Grafana Alloy (`:12345`)**:
    - Unified telemetry collector.
    - Receives OTLP traces, collects logs, and scrapes local metrics.
    - Forwards data to Loki and Prometheus.

5.  **Alertmanager (`:9093`)**:
    - Handles alert deduplication, grouping, and routing.
    - Configured to route critical alerts to notification channels.

## ⚙️ Configuration

### Key Directories
- `mimir/`: Mimir configuration (`mimir.yaml`).
- `prometheus/`: Prometheus config, rules, and alerts.
- `loki/`: Loki configuration (`config.yml`).
- `alloy/`: Alloy collector configuration.
- `app/`: Application specific configurations.

### Ports & Access

| Service | Internal Port | External Access | Auth |
|---------|---------------|-----------------|------|
| **Grafana** | 3000 | `https://metrics.atl.services` | SSO/Admin |
| **Prometheus**| 9090 | Tailscale Only | None |
| **Mimir** | 8080 | Tailscale Only | None |
| **Loki** | 3100 | Tailscale Only | None |
| **Alloy** | 12345 | Tailscale Only | None |

## 🚀 Deployment

### Prerequisites
- Docker Compose installed.
- Tailscale configured on the host.
- Cloudflare R2 buckets created: `atl-metrics-mimir`, `atl-metrics-mimir-blocks`.
- `.env` file populated with secrets.

### Commands
```bash
# Start the stack
docker compose up -d

# View logs
docker compose logs -f

# Validate configs
docker compose config
```

## ➕ Adding New Services

To monitor a new service (e.g., a new VPS):

1.  **Deploy Node Exporter & Alloy** on the target VPS using the shared `monitoring-agents.yaml`.
2.  **Ensure Connectivity**: The VPS must be on the same Tailscale network (`100.64.x.x`).
3.  **Update Prometheus**: Add the new target to `prometheus.yml` in `atl.services/metrics`.
    ```yaml
    - job_name: 'new-service'
      static_configs:
        - targets: ['new-service-hostname:9100']
    ```
4.  **Reload Prometheus**:
    ```bash
    curl -X POST http://localhost:9090/-/reload
    ```

## 🔧 Troubleshooting

### "Mimir is failing to start"
- Check S3/R2 credentials in `.env`.
- Ensure R2 buckets exist.
- Check logs: `docker compose logs mimir`.

### "No metrics in Grafana"
- Verify Prometheus targets are UP: `http://localhost:9090/targets`.
- Check `remote_write` status in Prometheus logs.
- Ensure Grafana datasource is pointing to Mimir (`http://mimir:8080/prometheus`).

### "Loki rejecting logs"
- Check if logs are too old (outside retention window).
- Verify labels are low cardinality (avoid high-cardinality dynamic labels).
