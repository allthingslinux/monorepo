#!/bin/bash
# shellcheck shell=bash

# ATL Chat Infrastructure Initialization Script
# Creates required directory structure and dev certs on host system.
# Config generation is handled at container startup (Model A entrypoints).

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
INIT_MODE="${1:-dev}"
if [ "$INIT_MODE" != "dev" ] && [ "$INIT_MODE" != "prod" ]; then
  echo "Usage: $0 [dev|prod]"
  exit 1
fi

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $1"; }

load_env_files() {
  if [ -f "$PROJECT_ROOT/.env" ]; then
    set -a; source "$PROJECT_ROOT/.env"; set +a
  fi
  if [ -f "$PROJECT_ROOT/.env.$INIT_MODE" ]; then
    set -a; source "$PROJECT_ROOT/.env.$INIT_MODE"; set +a
  fi
}

create_directories() {
  log_info "Creating data directories..."

  local dirs=(
    "$PROJECT_ROOT/data/irc/data"
    "$PROJECT_ROOT/data/irc/webpanel-data"
    "$PROJECT_ROOT/data/atheme/data"
    "$PROJECT_ROOT/data/xmpp/data"
    "$PROJECT_ROOT/data/xmpp/uploads"
    "$PROJECT_ROOT/data/thelounge"
    "$PROJECT_ROOT/data/obsidianirc"
    "$PROJECT_ROOT/data/certs"
  )

  for dir in "${dirs[@]}"; do
    mkdir -p "$dir"
  done

  log_success "Data directories ready"
}

set_permissions() {
  log_info "Setting permissions..."

  local uid; uid=$(id -u)
  local gid; gid=$(id -g)

  if [ -d "$PROJECT_ROOT/data" ]; then
    sudo chown -R "$uid:$gid" "$PROJECT_ROOT/data"
    find "$PROJECT_ROOT/data" -type d -exec chmod 755 {} \;
  fi

  # WebPanel runs as nobody (UID 65534)
  if [ -d "$PROJECT_ROOT/data/irc/webpanel-data" ]; then
    sudo chown -R 65534:65534 "$PROJECT_ROOT/data/irc/webpanel-data"
    sudo chmod -R 755 "$PROJECT_ROOT/data/irc/webpanel-data"
  fi

  log_success "Permissions set"
}

setup_ca_bundle() {
  local ca_dir="$PROJECT_ROOT/services/chat/irc-server/config/includes/tls"
  local ca_file="curl-ca-bundle.crt"

  mkdir -p "$ca_dir"

  local system_ca=""
  if [ -f "/etc/ca-certificates/extracted/tls-ca-bundle.pem" ]; then
    system_ca="/etc/ca-certificates/extracted/tls-ca-bundle.pem"
  elif [ -f "/etc/ssl/certs/ca-certificates.crt" ]; then
    system_ca="/etc/ssl/certs/ca-certificates.crt"
  fi

  if [ -n "$system_ca" ] && [ ! -f "$ca_dir/$ca_file" ]; then
    cp "$system_ca" "$ca_dir/$ca_file" 2>/dev/null || sudo cp "$system_ca" "$ca_dir/$ca_file"
    log_success "CA bundle created"
  fi

  # Clean up any stale server cert files
  rm -f "$ca_dir/server.cert.pem" "$ca_dir/server.key.pem" 2>/dev/null || true
  rm -rf "$ca_dir/live" 2>/dev/null || true
}

generate_cert() {
  local domain="$1"
  local live_dir="$PROJECT_ROOT/data/certs/live/$domain"

  mkdir -p "$live_dir"

  if [ ! -f "$live_dir/fullchain.pem" ] || [ ! -f "$live_dir/privkey.pem" ]; then
    log_info "Generating self-signed cert for $domain..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
      -keyout "$live_dir/privkey.pem" \
      -out "$live_dir/fullchain.pem" \
      -subj "/CN=$domain" \
      -addext "subjectAltName=DNS:$domain,DNS:*.$domain,DNS:muc.$domain,DNS:upload.$domain,DNS:proxy.$domain,DNS:pubsub.$domain,DNS:bridge.$domain,DNS:localhost,IP:127.0.0.1" 2>/dev/null
    chmod 644 "$live_dir/privkey.pem" 2>/dev/null || true
    log_success "Self-signed cert for $domain"
  fi
}

generate_dev_certs() {
  log_info "Generating dev certificates..."
  generate_cert "${IRC_DOMAIN:-irc.localhost}"
  generate_cert "${PROSODY_DOMAIN:-xmpp.localhost}"
  log_success "Dev certs ready"
}

create_env_template() {
  if [ ! -f "$PROJECT_ROOT/.env" ] && [ -f "$PROJECT_ROOT/.env.example" ]; then
    cp "$PROJECT_ROOT/.env.example" "$PROJECT_ROOT/.env"
    log_info "Created .env from .env.example — edit before starting services"
  fi
}

check_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    log_error "Docker not found"; exit 1
  fi
  if ! docker compose version >/dev/null 2>&1; then
    log_error "Docker Compose not found"; exit 1
  fi
}

main() {
  log_info "ATL Chat init ($INIT_MODE)"

  check_docker
  load_env_files
  create_directories
  set_permissions
  setup_ca_bundle

  if [ "$INIT_MODE" = "dev" ]; then
    generate_dev_certs
  fi

  create_env_template

  log_success "Init complete. Data in $PROJECT_ROOT/data/"
}

if [[ ${BASH_SOURCE[0]} == "${0}" ]]; then
  main
fi
