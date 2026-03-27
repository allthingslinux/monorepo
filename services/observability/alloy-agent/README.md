# ATL Monitoring Agent

Shared monitoring agent configuration for deploying to remote VPS nodes. This agent collects host metrics, container metrics, and Docker logs, then forwards them to the central metrics stack.

## Components

- **[Grafana Alloy](https://grafana.com/docs/alloy/latest/)**: Unified telemetry collector (logs + metrics)
  - **Node Exporter** (Built-in): Host-level metrics (CPU, memory, disk, network)
  - **cAdvisor** (Built-in): Container-level metrics (CPU throttling, memory, OOM kills)

## What It Collects

### Metrics (forwarded to Mimir)
- **Host Metrics**: CPU, memory, disk, network, load average from Node Exporter
- **Container Metrics**: Per-container resource usage, throttling, OOM events from cAdvisor

### Logs (forwarded to Loki)
- **Docker Logs**: All container logs with automatic labeling (`container`, `instance`, `job`)

## Deployment

### 1. Copy Agent to VPS

```bash
scp -r agent/ user@vps:/opt/monitoring/
cd /opt/monitoring/agent
```

### 2. Configure Environment Variables

Create a `.env` file with the following variables:

```bash
# Required: Unique hostname identifier for this VPS
HOSTNAME=atl-chat

# Required: Central Loki endpoint (Tailscale IP recommended)
LOKI_URL=http://100.64.2.0:3100/loki/api/v1/push

# Required: Central Mimir endpoint (Tailscale IP recommended)
REMOTE_WRITE_URL=http://100.64.2.0:8080/api/v1/push

# Optional: Basic auth credentials (if central stack requires authentication)
# BASIC_AUTH_USER=your-username
# BASIC_AUTH_PASS=your-password
```

**Environment Variable Reference:**

| Variable | Required | Description | Example |
|----------|----------|-------------|----------|
| `HOSTNAME` | ✅ | Unique identifier for this host | `atl-chat`, `atl-network` |
| `LOKI_URL` | ✅ | Central Loki push endpoint | `http://100.64.2.0:3100/loki/api/v1/push` |
| `REMOTE_WRITE_URL` | ✅ | Central Mimir remote write endpoint | `http://100.64.2.0:8080/api/v1/push` |
| `BASIC_AUTH_USER` | ❌ | Basic auth username (if needed) | `metrics-agent` |
| `BASIC_AUTH_PASS` | ❌ | Basic auth password (if needed) | `your-secure-password` |

### 3. Deploy the Stack

```bash
docker compose up -d
```

### 4. Verify Deployment

```bash
# Check container status (Only Alloy should be running)
docker compose ps

# View Alloy logs
docker compose logs -f alloy

# Check component health via Alloy UI
# Local: http://localhost:12345
# Remote: ssh -L 12345:localhost:12345 user@vps
```

### 5. Access Live Debugging UI

Alloy includes a built-in web UI for real-time debugging and monitoring:

```bash
# Access the Alloy UI (from the VPS or via SSH tunnel)
http://localhost:12345
```

**Features:**
- Real-time component status and health
- Live data streaming from each pipeline stage
- Configuration validation and syntax checking
- Metrics about Alloy's own performance

> **Note**: The live debugging UI is enabled by default in our configuration. To access it remotely, use SSH port forwarding:
> ```bash
> ssh -L 12345:localhost:12345 user@vps-hostname
> ```

## Troubleshooting

### Logs Not Appearing in Loki

1. **Check Alloy logs**: `docker compose logs alloy`
2. **Verify LOKI_URL**: Ensure the central Loki endpoint is reachable
3. **Test connectivity**: `curl -v $LOKI_URL`
4. **Check firewall**: Ensure port 3100 is accessible from this VPS

### Metrics Not Appearing in Mimir

1. **Check Alloy logs**: `docker compose logs alloy`
2. **Verify REMOTE_WRITE_URL**: Ensure the central Mimir endpoint is reachable
3. **Test connectivity**: `curl -v $REMOTE_WRITE_URL`
4. **Check firewall**: Ensure port 8080 is accessible from this VPS

### Alloy Configuration Errors

1. **Validate config syntax**:
   ```bash
   docker compose exec alloy alloy fmt config.alloy
   ```
2. **Check for missing environment variables**:
   ```bash
   docker compose config
   ```

### Container Won't Start

1. **Check Docker socket permissions**: Ensure `/var/run/docker.sock` is accessible
   ```bash
   # The Alloy container needs read access to the Docker socket
   ls -la /var/run/docker.sock
   # Should show: srw-rw---- 1 root docker
   
   # If running Alloy as non-root, ensure the user is in the docker group
   # OR run Alloy as root (as configured in our compose.yaml)
   ```
2. **Review compose logs**: `docker compose logs`
3. **Verify .env file**: Ensure all required variables are set

> **Security Note**: Our `compose.yaml` runs Alloy as `root` (UID 0) to access the Docker socket. This is required for `loki.source.docker` to read container logs. In production, ensure the VPS is properly secured and Alloy only has access to necessary resources.

## Architecture

```
┌─────────────────────────────────────────┐
│           Remote VPS Host               │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │   Docker Containers              │  │
│  │   (app, db, etc.)                │  │
│  └──────────┬───────────────────────┘  │
│             │ logs & stats             │
│             ▼                          │
│  ┌──────────────────────────────────┐  │
│  │   Grafana Alloy                  │  │
│  │   - Collects Docker logs         │  │
│  │   - Internal Node Exporter       │  │
│  │   - Internal cAdvisor            │  │
│  └──────────────────────────────────┘  │
└─────────────┬───────────────────────────┘
              │ Tailscale VPN
              ▼
┌─────────────────────────────────────────┐
│      Central Metrics Stack              │
│      (atl.services)                     │
│                                         │
│  ┌──────────────┐   ┌──────────────┐   │
│  │    Loki      │   │    Mimir     │   │
│  │   (logs)     │   │  (metrics)   │  │
│  └──────────────┘   └──────────────┘   │
│           │                 │           │
│           └────────┬────────┘           │
│                    ▼                    │
│           ┌──────────────┐              │
│           │   Grafana    │              │
│           │ (dashboards) │              │
│           └──────────────┘              │
└─────────────────────────────────────────┘
```

## References

- [Grafana Alloy Documentation](https://grafana.com/docs/alloy/latest/)
- [Collect Prometheus Metrics](https://grafana.com/docs/alloy/latest/collect/prometheus-metrics/)
- [Collect Logs with Loki](https://grafana.com/docs/alloy/latest/reference/components/loki/)
- [Node Exporter Guide](https://prometheus.io/docs/guides/node-exporter/)
- [cAdvisor Documentation](https://github.com/google/cadvisor/blob/master/docs/storage/prometheus.md)

## Troubleshooting & Monitoring

### Debug UI Features

Alloy provides a powerful debugging UI at `http://localhost:12345` with the following capabilities:

#### Component Health Dashboard
- **Home Page**: View all components and their health status at a glance
- **Component Details**: Click any component to see:
  - Current health status with detailed messages
  - Evaluated arguments and exports
  - Debug information (when available)
- **Graph View**: Visual representation of component dependencies and data flow

#### Live Debugging
With `livedebugging { enabled = true }` in your config, you can:
- Stream real-time component data
- Pause and search through data streams
- Monitor data flow through pipelines
- Identify bottlenecks and issues in real-time

**Supported components**: `loki.source.docker`, `loki.process`, `prometheus.scrape`, `prometheus.remote_write`, `discovery.*`, and more.

### Metrics & Profiling

#### Internal Metrics
Alloy exposes Prometheus metrics at `http://localhost:12345/metrics`:

**Controller Metrics**:
- `alloy_component_controller_running_components` - Component count by health
- `alloy_component_evaluation_seconds` - Component evaluation latency
- `alloy_component_evaluation_queue_size` - Pending evaluations

**Component-Specific Metrics**:
- Each component exposes metrics with `component_id` label
- Example: `prometheus.remote_write` exposes queue size, send rate, retry metrics
- Check component documentation for available metrics

#### Profiling & Diagnostics

**CPU/Memory Profiling**:
```bash
# Collect CPU profile (30 seconds)
curl http://localhost:12345/debug/pprof/profile?seconds=30 -o cpu.pprof

# Collect memory profile
curl http://localhost:12345/debug/pprof/heap -o heap.pprof

# Collect goroutine profile
curl http://localhost:12345/debug/pprof/goroutine -o goroutine.pprof
```

**Support Bundle**:
```bash
# Generate comprehensive diagnostic bundle
curl http://localhost:12345/-/support?duration=60 -o support-bundle.tar.gz
```

Contains: component info, logs, metrics snapshots, pprof data, config files, and runtime flags.

### Common Issues

#### Container Won't Start

**Symptom**: Alloy container exits immediately or fails to start.

**Check Docker socket permissions**:
```bash
ls -la /var/run/docker.sock
# Should show: srw-rw---- 1 root docker
```

**Solution**: The `compose.yaml` runs Alloy as `user: "0"` (root) to access the Docker socket. This is required for `loki.source.docker` to collect container logs.

> **Security Note**: Running as root is necessary for Docker socket access. Ensure your VPS has proper security measures (firewall, SSH hardening, etc.).

#### No Metrics Appearing in Mimir

**Check component health**:
1. Open `http://localhost:12345` (or via SSH tunnel)
2. Verify all components show "Healthy" status
3. Check `prometheus.scrape` targets are discovered
4. Verify `prometheus.remote_write` shows successful writes

**Check network connectivity**:
```bash
# From inside the Alloy container (if you enabled check_collectors)
# Otherwise check the Alloy Debug UI at http://localhost:12345
```

**Check remote write endpoint**:
```bash
# Verify REMOTE_WRITE_URL is reachable
curl -v $REMOTE_WRITE_URL
```

#### No Logs Appearing in Loki

**Check Docker socket access**:
```bash
# Verify Alloy can read Docker events
docker logs alloy | grep -i docker
```

**Check Loki endpoint**:
```bash
# Verify LOKI_URL is reachable
curl -v $LOKI_URL/ready
```

**Check component pipeline**:
1. Open Debug UI → `loki.source.docker` component
2. Verify targets are discovered
3. Check `loki.write` component for send errors

#### High Memory/CPU Usage

**Collect diagnostics**:
```bash
# Generate support bundle
curl http://localhost:12345/-/support?duration=120 -o diagnostics.tar.gz

# Or collect specific profiles
curl http://localhost:12345/debug/pprof/heap -o heap.pprof
curl http://localhost:12345/debug/pprof/profile?seconds=30 -o cpu.pprof
```

**Common causes**:
- High log volume → Increase `loki.write` batch size or reduce scrape targets
- Slow remote write → Check network latency to central Mimir/Loki
- Component evaluation backlog → Check `alloy_component_evaluation_queue_size` metric

### Accessing Debug UI Remotely

When deployed on a remote VPS:

```bash
# SSH tunnel to access UI locally
ssh -L 12345:localhost:12345 user@your-vps

# Then open in browser
http://localhost:12345
```

### Additional Resources
- [Debug Grafana Alloy](https://grafana.com/docs/alloy/latest/troubleshoot/debug/)
- [Monitor Components](https://grafana.com/docs/alloy/latest/troubleshoot/component_metrics/)
- [Profile Resource Consumption](https://grafana.com/docs/alloy/latest/troubleshoot/profile/)
- [Generate Support Bundle](https://grafana.com/docs/alloy/latest/troubleshoot/support_bundle/)

## Performance Tuning

### Environment Variables

Alloy supports several environment variables to optimize performance in production:

#### Memory Management

**`GOMEMLIMIT`** - Soft memory cap to prevent OOM kills:
```yaml
# In compose.yaml
environment:
  GOMEMLIMIT: "900MiB"  # Set to ~90% of container memory limit
```

**Auto-configuration**: Alloy automatically sets `GOMEMLIMIT` to 90% of cgroup limits. Override with `AUTOMEMLIMIT` (0.0-1.0) to adjust the ratio.

**`GOGC`** - Garbage collection trigger percentage (default: 100):
```yaml
environment:
  GOGC: "75"  # More aggressive GC, lower memory usage
```

Lower values = more frequent GC, less memory. Higher values = less frequent GC, more memory.

#### CPU & Concurrency

**`GOMAXPROCS`** - Limit CPU threads (default: number of CPUs):
```yaml
environment:
  GOMAXPROCS: "2"  # Limit to 2 CPU cores
```

#### Proxy Configuration

For components with `proxy_from_environment: true`:
```yaml
environment:
  HTTP_PROXY: "http://proxy.example.com:8080"
  HTTPS_PROXY: "http://proxy.example.com:8080"
  NO_PROXY: "localhost,127.0.0.1,.local"
```

### Resource Recommendations

**Minimal VPS** (monitoring only):
- **Memory**: 512MB (GOMEMLIMIT=450MiB)
- **CPU**: 1 core
- **Disk**: 1GB for WAL

**Standard VPS** (monitoring + moderate log volume):
- **Memory**: 1GB (GOMEMLIMIT=900MiB)
- **CPU**: 2 cores
- **Disk**: 5GB for WAL

**High-volume VPS** (many containers, high log rate):
- **Memory**: 2GB (GOMEMLIMIT=1800MiB)
- **CPU**: 2-4 cores
- **Disk**: 10GB for WAL

### Monitoring Resource Usage

Check Alloy's own metrics:
```bash
curl -s http://localhost:12345/metrics | grep -E '(go_memstats|process_)'
```

Key metrics:
- `go_memstats_heap_inuse_bytes` - Current heap usage
- `process_resident_memory_bytes` - Total RSS
- `process_cpu_seconds_total` - CPU time

Refer to [Estimate Resource Usage](https://grafana.com/docs/alloy/latest/introduction/estimate-resource-usage/) and [Environment Variables](https://grafana.com/docs/alloy/latest/reference/cli/environment-variables/) for more details.

## Security Hardening (Optional)

### Protect Debug UI with Authentication

For production deployments, consider protecting the Alloy HTTP server (debug UI, `/metrics` endpoint) with basic authentication:

**Add to `config.alloy`**:
```alloy
http {
  auth {
    basic {
      username = sys.env("ALLOY_UI_USERNAME")
      password = sys.env("ALLOY_UI_PASSWORD")
    }
  }
}
```

**Add to `.env`**:
```bash
ALLOY_UI_USERNAME=admin
ALLOY_UI_PASSWORD=your-secure-password
```

### Selective Authentication

Protect only specific endpoints:

```alloy
http {
  auth {
    basic {
      username = sys.env("ALLOY_UI_USERNAME")
      password = sys.env("ALLOY_UI_PASSWORD")
    }
    
    // Require auth for UI, but allow unauthenticated /metrics scraping
    filter {
      paths                       = ["/metrics"]
      authenticate_matching_paths = false
    }
  }
}
```

### TLS Configuration

For encrypted communication (recommended if exposing Alloy outside localhost):

```alloy
http {
  tls {
    cert_file = "/etc/alloy/tls/cert.pem"
    key_file  = "/etc/alloy/tls/key.pem"
    min_version = "TLS13"
  }
}
```

**Note**: For internal monitoring on Tailscale, TLS is optional since Tailscale already encrypts traffic.

Refer to [http block documentation](https://grafana.com/docs/alloy/latest/reference/config-blocks/http/) for advanced options.

## Learning Resources

If you're new to Grafana Alloy or want to learn more about the components used in this configuration, check out these official tutorials:

### Getting Started
- [Send Logs to Loki](https://grafana.com/docs/alloy/latest/tutorials/send-logs-to-loki/) - Learn the basics of log collection
- [First Components and Standard Library](https://grafana.com/docs/alloy/latest/tutorials/first-components-and-stdlib/) - Understand component basics
- [Logs and Relabeling Basics](https://grafana.com/docs/alloy/latest/tutorials/logs-and-relabeling-basics/) - Master relabeling techniques

### Monitoring Examples
- [Monitor Docker Containers](https://grafana.com/docs/alloy/latest/monitor/monitor-docker-containers/) - Docker metrics and logs collection
- [Monitor Linux Servers](https://grafana.com/docs/alloy/latest/monitor/monitor-linux/) - Host-level monitoring with Node Exporter
- [Monitor Logs from Files](https://grafana.com/docs/alloy/latest/monitor/monitor-logs-from-file/) - File-based log collection

### Advanced Topics
- [Process Logs](https://grafana.com/docs/alloy/latest/tutorials/processing-logs/) - Advanced log processing and filtering
- [Monitor Structured Logs](https://grafana.com/docs/alloy/latest/monitor/monitor-structured-logs/) - Working with JSON logs

## Configuration
- `config.alloy` runs built-in `unix` (node) and `cadvisor` exporters.
- It collects all Docker container logs via the unix socket.
- Metrics and logs are forwarded to the central Mimir and Loki instances.

### Optional: Customize Logging

By default, Alloy logs to stderr in `logfmt` format at `info` level. To customize:

**Add to `config.alloy`**:
```alloy
logging {
  level  = "debug"  // error, warn, info, debug
  format = "json"   // logfmt or json
}
```

**View logs**:
```bash
# Docker container logs
docker logs alloy

# Follow logs in real-time
docker logs -f alloy
```

Refer to [logging block documentation](https://grafana.com/docs/alloy/latest/reference/config-blocks/logging/) for advanced options like sending logs to Loki.
```
