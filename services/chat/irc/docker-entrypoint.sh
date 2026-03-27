#!/bin/sh
set -e

# UnrealIRCd entrypoint — runtime config substitution + start
# Absorbs all logic formerly in scripts/prepare-config.sh (Model A)

echo "=== UnrealIRCd Starting ==="

USER_ID=${PUID:-1000}
GROUP_ID=${PGID:-1000}

# ── Derived environment variables ─────────────────────────────────────────────
# These were formerly computed by prepare-config.sh on the host.

# Literal dollar sign for templates that need $var to survive envsubst
export DOLLAR='$'

# Services link target — defaults to Atheme server name
export IRC_SERVICES_SERVER="${IRC_SERVICES_SERVER:-${ATHEME_SERVER_NAME:-services.${IRC_ROOT_DOMAIN:-atl.chat}}}"

# Cert paths — shared Let's Encrypt layout
export IRC_SSL_CERT_PATH="${IRC_SSL_CERT_PATH:-/home/unrealircd/unrealircd/certs/live/${IRC_DOMAIN:-irc.localhost}/fullchain.pem}"
export IRC_SSL_KEY_PATH="${IRC_SSL_KEY_PATH:-/home/unrealircd/unrealircd/certs/live/${IRC_DOMAIN:-irc.localhost}/privkey.pem}"

# Cloak keys — dev-only placeholders; generate real keys with `just gencloak`
export IRC_CLOAK_KEY_1="${IRC_CLOAK_KEY_1:-daa0ad2a69ba7683a2cdb02499f2e98b0729423bb7578d1f1dfbcdfe015f1f8b554b13203289c83D}"
export IRC_CLOAK_KEY_2="${IRC_CLOAK_KEY_2:-899874eda706ee805bd34792bfd7bd62711f1938dea920c8bdf8396fe136ab6a83785a3ce54eB298}"
export IRC_CLOAK_KEY_3="${IRC_CLOAK_KEY_3:-d8936d8fff38eace5c379c94578abfa802088bd241329c64506513fe8e4de3e2304f7dd00355A8d6}"

# WebSocket TLS conditional block
if [ "${IRC_WEBSOCKET_USE_TLS:-true}" = "true" ]; then
  export IRC_WEBSOCKET_OPTIONS_LINE="tls;"
  export IRC_WEBSOCKET_TLS_OPTIONS="tls-options {
		certificate \"/home/unrealircd/unrealircd/certs/live/${IRC_DOMAIN:-irc.localhost}/fullchain.pem\";
		key \"/home/unrealircd/unrealircd/certs/live/${IRC_DOMAIN:-irc.localhost}/privkey.pem\";
		options {
			no-client-certificate;
		}
	}"
else
  export IRC_WEBSOCKET_OPTIONS_LINE="/* tls; */ /* Disabled: SSL terminated at reverse proxy */"
  export IRC_WEBSOCKET_TLS_OPTIONS="/* tls-options disabled — reverse proxy terminates TLS */"
fi

# GeoIP classic — disabled in dev (times out), enabled in prod
geoip="${IRC_ENABLE_GEOIP_CLASSIC:-}"
if [ -z "$geoip" ]; then
  if [ "${ATL_INIT_MODE:-dev}" = "dev" ]; then geoip="false"; else geoip="true"; fi
fi
if [ "$geoip" = "true" ]; then
  export IRC_GEOIP_CLASSIC_MODULE_LINE='loadmodule "geoip_classic";'
  export IRC_GEOIP_CLASSIC_BLOCK='@if module-loaded("geoip_classic")
set {
	geoip-classic {
		ipv4-database "https://www.unrealircd.org/files/geo/classic/GeoIP.dat" { url-refresh 14d; url-fail warn; }
		ipv6-database "https://www.unrealircd.org/files/geo/classic/GeoIPv6.dat" { url-refresh 14d; url-fail warn; }
		asn-ipv4-database "https://www.unrealircd.org/files/geo/classic/GeoIPASNum.dat" { url-refresh 14d; url-fail warn; }
		asn-ipv6-database "https://www.unrealircd.org/files/geo/classic/GeoIPASNumv6.dat" { url-refresh 14d; url-fail warn; }
	}
}
@endif'
else
  export IRC_GEOIP_CLASSIC_MODULE_LINE='/* loadmodule "geoip_classic"; */ /* Disabled via IRC_ENABLE_GEOIP_CLASSIC */'
  export IRC_GEOIP_CLASSIC_BLOCK='/* geoip_classic disabled */'
fi

# ── Runtime config generation ─────────────────────────────────────────────────

TEMPLATE_DIR="/etc/unrealircd-templates"
CONFIG_DIR="/home/unrealircd/unrealircd/config"

mkdir -p "$CONFIG_DIR" /home/unrealircd/unrealircd/data /home/unrealircd/unrealircd/tmp

if [ -f "$TEMPLATE_DIR/unrealircd.conf.template" ]; then
  echo "Generating unrealircd.conf from template..."
  envsubst < "$TEMPLATE_DIR/unrealircd.conf.template" > "$CONFIG_DIR/unrealircd.conf"
else
  echo "ERROR: Template not found at $TEMPLATE_DIR/unrealircd.conf.template"
  exit 1
fi

# Fix ownership
chown -R "${USER_ID}:${GROUP_ID}" /home/unrealircd/unrealircd/data /home/unrealircd/unrealircd/tmp 2>/dev/null || true
chmod 755 /home/unrealircd/unrealircd/data 2>/dev/null || true

# ── Start ─────────────────────────────────────────────────────────────────────

case "${1:-start}" in
  start)
    shift 2>/dev/null || true
    echo "Starting UnrealIRCd in foreground..."
    if [ "$(id -u)" = "0" ]; then
      exec su-exec "${USER_ID}:${GROUP_ID}" /home/unrealircd/unrealircd/bin/unrealircd -F "$@"
    else
      exec /home/unrealircd/unrealircd/bin/unrealircd -F "$@"
    fi
    ;;
  *)
    if [ "$(id -u)" = "0" ]; then
      exec su-exec "${USER_ID}:${GROUP_ID}" /home/unrealircd/unrealircd/unrealircd "$@"
    else
      exec /home/unrealircd/unrealircd/unrealircd "$@"
    fi
    ;;
esac
