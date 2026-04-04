# SFTPGo

**Service:** Secure File Transfer
**Container Name:** `sftpgo`
**Image:** `drakkan/sftpgo`
**Docs:** [Official Docs](https://docs.sftpgo.com/latest/)

---

## Configuration

- **Config File**: `./services/sftpgo/config/sftpgo.json` -> `/var/lib/sftpgo/sftpgo.json`
- **Data Directory**: `./services/sftpgo/data` -> `/srv/sftpgo`

### Ports

- **`8080`**: Web Admin UI / REST API
- **`2022`**: SFTP Service
- **`10000`**: Telemetry / Prometheus Metrics (Internal)

### Authentication

- **Default User**: First launch requires setting up an Admin account via the Web UI (`http://localhost:8080/web/admin`).
- **Backends**: Configured to use **SQLite** (`sftpgo.db`) stored in the persistent config volume.

### Monitoring

- **Prometheus Metrics**: `http://<host-ip>:10000/metrics`

---

## Administration

1.  **Access**: Open `http://<host-ip>:8080/web/admin`
2.  **Setup**: Create the first admin user.
3.  **Users**: Create SFTP users. Home directories will map to `/srv/sftpgo/data/<username>` (persisted on host at `./services/sftpgo/data/<username>`).

## Notes

- **Permissions**: The container runs as PID/GID `1000`. Ensure host directories have appropriate permissions if you encounter access issues.
  - `chown -R 1000:1000 ./services/sftpgo`
- **Graceful Shutdown**: The container supports `SFTPGO_GRACE_TIME` to allow transfers to complete before stopping.
