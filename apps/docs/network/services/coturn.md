# Coturn TURN/STUN Server

**Service:** TURN/STUN Relay
**Container Name:** `coturn`
**Image:** `coturn/coturn`
**Network Mode:** `host` (Critical for performance and NAT traversal)

---

## Configuration

Located at: `./services/coturn/turnserver.conf`

### Key Settings

- **`listening-port`**: 3478 (UDP/TCP)
- **`tls-listening-port`**: 5349 (TLS/DTLS)
- **`network_mode: host`**: The container shares the host's networking stack.
- **`fingerprint`**: Enabled.
- **`denied-peer-ip`**: Localhost/Private ranges blocked to prevent internal relay attacks.

### Environment Variables

- **`EXTERNAL_IP`**: **REQUIRED**. You must set this in your `.env` file.
  - This is passed to the container via the command line: `--external-ip ${EXTERNAL_IP}`.
  - Example: `EXTERNAL_IP=<YOUR_EXTERNAL_IP>`

### Firewall Requirements

Host firewall (UFW/Security Group) must allow:

- `3478`, `3479` (TCP/UDP) - Standard & Alt Listener
- `5349`, `5350` (TCP/UDP) - TLS & Alt TLS Listener
- `9641` (TCP) - Prometheus Metrics
- `49152-65535` (UDP)

---

## Testing

1.  **Docs**: [Metered.ca Coturn Guide](https://www.metered.ca/blog/coturn/) (Reference)
2.  **Tool**: [Trickle ICE](https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/)
    - STUN: `stun:turn.atl.network:3478`
    - TURN: `turn:turn.atl.network:3478` (User: `admin`, Pass: `changeme`)
