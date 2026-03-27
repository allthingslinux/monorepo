#!/bin/sh
set -e

# Atheme entrypoint — runtime config substitution + DB bootstrap + start
# Model A: envsubst at container startup, no host-side pre-step

echo "=== Atheme Services Starting ==="

if [ "$(id -u)" = "0" ]; then
  echo "ERROR: Atheme should not run as root"
  exit 1
fi

# ── Derived environment variables ─────────────────────────────────────────────

export DOLLAR='$'
export ATHEME_HTTPD_PORT="${ATHEME_HTTPD_PORT:-8081}"

# ── Runtime config generation ─────────────────────────────────────────────────

TEMPLATE_DIR="/etc/atheme-templates"
CONFIG_FILE="/usr/local/atheme/etc/atheme.conf"

mkdir -p /usr/local/atheme/data /usr/local/atheme/var /usr/local/atheme/etc

if [ -f "$TEMPLATE_DIR/atheme.conf.template" ]; then
  echo "Generating atheme.conf from template..."
  envsubst < "$TEMPLATE_DIR/atheme.conf.template" > "$CONFIG_FILE"
else
  echo "ERROR: Template not found at $TEMPLATE_DIR/atheme.conf.template"
  exit 1
fi

# ── Pre-flight checks ────────────────────────────────────────────────────────

rm -f /usr/local/atheme/var/atheme.pid

if [ ! -w "/usr/local/atheme/data" ]; then
  echo "ERROR: Data directory is not writable"
  exit 1
fi

# DB bootstrap on first run
if [ ! -f "/usr/local/atheme/data/services.db" ]; then
  echo "First run — creating initial database..."
  /usr/local/atheme/bin/atheme-services -b -c "$CONFIG_FILE" -D /usr/local/atheme/data
  echo "Database created"
fi

# ── Start ─────────────────────────────────────────────────────────────────────

echo "Starting Atheme as $(id -un) (UID: $(id -u))..."
exec /usr/local/atheme/bin/atheme-services -n -c "$CONFIG_FILE" -D /usr/local/atheme/data "$@"
