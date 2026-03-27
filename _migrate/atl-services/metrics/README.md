# ATL Metrics Stack

Central monitoring infrastructure for collecting, storing, and visualizing metrics and logs from all ATL services.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Central Metrics Stack                    │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Grafana Alloy (Collector)                 │ │
│  │  ┌──────────────────┐  ┌──────────────────────────┐    │ │
│  │  │ Log Collection   │  │  Metrics Collection      │    │ │
│  │  │ • Docker logs    │  │  • Built-in Exporters    │    │ │
│  │  │ • Cloudflare API │  │    (Unix, cAdvisor,      │    │ │
│  │  └────────┬─────────┘  │     Postgres, Redis)     │    │ │
│  │           │            │  • Service Exporters     │    │ │
│  │           │            │    (IRC, Prosody, etc)   │    │ │
│  │           │            │                          │    │ │
│  │           │            └──────────┬───────────────┘    │ │
│  └───────────┼───────────────────────┼────────────────────┘ │
│              │                       │                      │
│              ▼                       ▼                      │
│  ┌──────────────────┐   ┌──────────────────────────┐        │
│  │      Loki        │   │         Mimir            │        │
│  │  (Log Storage)   │   │    (Metric Storage)      │        │
│  └──────────┬───────┘   └──────────┬───────────────┘        │
│             │                      │                        │
│             └──────────┬───────────┘                        │
│                        ▼                                    │
│             ┌──────────────────┐                            │
│             │     Grafana      │                            │
│             │   (Dashboards)   │                            │
│             └──────────────────┘                            │
└─────────────────────────────────────────────────────────────┘
```

## Components

### Data Collection

- **[Grafana Alloy](https://grafana.com/docs/alloy/latest/)**: Unified telemetry collector
  - Collects logs from Docker containers and Cloudflare Workers
  - Scrapes metrics from exporters and services
  - Built-in exporters for host, containers, databases (Postgres/Redis)
  - Forwards to Loki and Mimir

### Data Storage

- **[Grafana Loki](https://grafana.com/docs/loki/latest/)**: Log aggregation system
  - Stores logs with labels for efficient querying
  - Supports LogQL for log queries
  
- **[Grafana Mimir](https://grafana.com/docs/mimir/latest/)**: Prometheus-compatible metrics storage
  - Long-term metrics retention
  - Supports PromQL queries
  - High availability and scalability

### Visualization

- **[Grafana](https://grafana.com/docs/grafana/latest/)**: Dashboards and alerting
  - Unified view of metrics and logs
  - Pre-built dashboards for infrastructure monitoring
  - Alert routing via Alertmanager

### Exporters



**Built-in to Alloy:**
- **Node Exporter** (Unix) - Host-level metrics (CPU, memory, disk, network)
- **cAdvisor** - Container-level metrics (resource usage, throttling)
- **Postgres Exporter** - PostgreSQL metrics (XMPP, Tux, ISO databases)
- **Redis Exporter** - Valkey/Redis metrics (Tux, Wiki)

**External Containers:**
- **MySQL Exporter** - MariaDB metrics (Wiki)
- **Nginx Exporter** - Nginx metrics (Wiki)
- **Cloudflare Exporter** - Cloudflare API metrics
- **Blackbox Exporter** - Synthetic monitoring (HTTP probes)

## What Gets Monitored

### Logs
- **Docker Containers**: All container stdout/stderr logs
- **Cloudflare Workers**: Worker execution logs via Cloudflare API

### Metrics

**Infrastructure:**
- Host metrics (CPU, memory, disk, network)
- Container metrics (resource usage, OOM kills)

**Databases:**
- PostgreSQL (Prosody XMPP, Tux, Keycloak)
- Valkey/Redis (Tux, Wiki)
- MariaDB (Wiki)

**Services:**
- Prosody (XMPP server)
- UnrealIRCd (IRC server)
- Keycloak (SSO)
- MinIO (Object storage)
- Nginx (Web server)
- Gatus (Uptime monitoring)
- Blocky (DNS)
- SFTPGo (SFTP server)
- InfluxDB (Time-series database)

**Synthetic Monitoring:**
- HTTP endpoint availability
- Response times
- SSL certificate expiry

## Deployment

### Prerequisites

1. **Environment Variables** - Configure in `.env`:
   ```bash
   # Cloudflare Worker Logs
   CF_ZONE_ID=your-zone-id
   CF_API_TOKEN=your-api-token
   
   # Postgres Exporter Credentials
   XMPP_DB_PASSWORD=your-xmpp-password
   TUX_DB_USER=tuxuser
   TUX_DB_PASSWORD=your-tux-password
   TUX_DB_NAME=tuxdb
   ISO_DB_PASSWORD=your-iso-password
   ```

2. **Network Access** - Alloy requires access to:
   - `metrics` network (local services)
   - `atl-chat` network (XMPP database)
   - `tux` network (Tux database)
   - `iso-network` network (Keycloak database)

### Start the Stack

```bash
cd /home/kaizen/dev/allthingslinux/atl.services/metrics
docker compose up -d
```

### Verify Deployment

```bash
# Check all services are running
docker compose ps

# Access Alloy UI for component health
http://localhost:12345

# Access Grafana dashboards
http://localhost:3000
```

## Configuration Files

- [`alloy/config.alloy`](file:///home/kaizen/dev/allthingslinux/atl.services/metrics/alloy/config.alloy) - Central Alloy configuration
- [`agent/config.alloy`](file:///home/kaizen/dev/allthingslinux/atl.services/metrics/agent/config.alloy) - Agent configuration for remote VPS
- [`compose.yaml`](file:///home/kaizen/dev/allthingslinux/atl.services/metrics/compose.yaml) - Docker Compose services
- [`.env`](file:///home/kaizen/dev/allthingslinux/atl.services/metrics/.env) - Environment variables

## Key Features

### Built-in Exporters

We have replaced 9 external exporter containers with Alloy's built-in components:

**Consolidated Components:**
- **Node Exporter**: Host metrics (Unix exporter)
- **cAdvisor**: Container metrics
- **Postgres**: Database metrics (3 instances)
- **Redis**: Database metrics (2 instances)

**Benefits:**
- ✅ Fewer containers (-9 containers, ~900MB RAM saved)
- ✅ Simplified configuration in a single Alloy file
- ✅ Centralized management and lifecycle
- ✅ Consistent labeling and scraping pipeline

**Example Configuration (Postgres):**
```alloy
prometheus.exporter.postgres "databases" {
  data_source_names = [
    "postgresql://prosody:${XMPP_DB_PASSWORD}@atl-xmpp-db:5432/prosody?sslmode=disable",
    "postgresql://${TUX_DB_USER}:${TUX_DB_PASSWORD}@tux-postgres:5432/${TUX_DB_NAME}?sslmode=disable",
    "postgresql://admin:${ISO_DB_PASSWORD}@iso_postgres:5432/iso_archive?sslmode=disable",
  ]
}
```

### Log Processing

- **PII Redaction**: Automatically scrubs sensitive data (emails, IPs, tokens)
- **Label Addition**: Enriches logs with environment and source labels
- **Structured Parsing**: Extracts fields from JSON logs

### Metrics Collection

- **Service Discovery**: Automatically discovers scrape targets
- **Relabeling**: Transforms labels for better organization
- **Remote Write**: Efficiently forwards metrics to Mimir

## Monitoring the Monitoring Stack

Alloy includes a powerful debug UI at `http://localhost:12345`:

- **Component Health**: Real-time status of all components
- **Live Debugging**: Stream data through pipelines
- **Metrics**: Internal Alloy performance metrics
- **Profiling**: CPU/memory profiling for troubleshooting

## References

- [Grafana Alloy Documentation](https://grafana.com/docs/alloy/latest/)
- [Grafana Loki Documentation](https://grafana.com/docs/loki/latest/)
- [Grafana Mimir Documentation](https://grafana.com/docs/mimir/latest/)
- [Agent Deployment Guide](file:///home/kaizen/dev/allthingslinux/atl.services/metrics/agent/README.md)
