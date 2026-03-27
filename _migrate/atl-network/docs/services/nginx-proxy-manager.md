# Nginx Proxy Manager (NPM)

**Service:** Reverse Proxy & SSL Termination
**Container Name:** `npm`
**Image:** `jc21/nginx-proxy-manager:latest`
**Ports:** `80` (HTTP), `443` (HTTPS), `81` (Admin)

---

## Configuration

NPM is configured to use an embedded **SQLite** database for simplicity and decoupling, as per the "Split/SQLite" architecture decision.

### Essential Volumes
*   `./services/npm/data:/data`: Stores the SQLite database and configuration.
*   `./services/npm/letsencrypt:/etc/letsencrypt`: Stores SSL certificates.

### Healthcheck
We rely on the built-in healthcheck script provided by the container:
```yaml
healthcheck:
  test: ["CMD", "/usr/bin/check-health"]
  interval: 10s
  timeout: 3s
```

---

## Advanced Notes

### Docker Networks
While creating a custom bridge network (e.g., `npmnet`) is often recommended to isolate backend services, we currently run a flat network topology for simplicity. If isolation becomes a requirement, we can migrate specific services to an internal network and only expose NPM to the host.

### Disabling IPv6
If logs are spammed with "Address family not supported by protocol", add this environment variable:
```yaml
environment:
  DISABLE_IPV6: 'true'
```

### Advanced Nginx Config
Custom snippets can be mounted to `/data/nginx/custom/`.
*   Example: `/data/nginx/custom/root_top.conf` for loading modules like GeoIP2.

---

## Troubleshooting

*   **Admin UI unreachable**: Check port 81. Ensure container is healthy.
*   **502 Bad Gateway**: The upstream service (e.g., Gatus, Coturn) might be down or starting up. NPM handles this gracefully.
*   **Auth Loops**: If protecting an app that already has auth (like NPM itself or Portainer) with NPM's "Access Lists", headers may conflict. Disable NPM access lists for those services.
