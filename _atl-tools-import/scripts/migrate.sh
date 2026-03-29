#!/usr/bin/env bash
# =============================================================================
# migrate.sh — Migrate /opt/* services to /opt/atl.tools monorepo
# =============================================================================
# Run on the production server as root.
#
# Usage:
#   ./migrate.sh [OPTIONS] [PHASES]
#
# Options:
#   --dry-run     Print actions without executing them
#   --yes         Skip confirmation prompts
#
# Phases (run all by default, or pass specific ones):
#   export        Dump all Docker state to a snapshot file
#   clone         Clone / update the repo at /opt/atl.tools
#   env           Generate /opt/atl.tools/.env from old configs + detected values
#   data          Create data directories and copy bind-mount data from /opt/*
#   stop-old      Stop old containers that overlap with the new stack
#   start-new     Start the new stack with docker compose
#   verify        Show container status and reachability
#
# Examples:
#   ./migrate.sh                        # full migration, interactive
#   ./migrate.sh --dry-run              # preview all actions
#   ./migrate.sh --yes export clone     # run only export + clone, no prompts
# =============================================================================

set -euo pipefail

# ── Configuration ─────────────────────────────────────────────────────────────

REPO_URL="https://github.com/allthingslinux/atl.tools.git"
INSTALL_DIR="/opt/atl.tools"
OLD_BASE="/opt"
SNAPSHOT_DIR="/opt/atl.tools-migration-snapshots"

# Old service directories that overlap with the new stack
OLD_SERVICES=(privatebin searxng convertx cyberchef it-tools)

# Data migrations: "old_path:new_relative_path"
# new_relative_path is relative to $INSTALL_DIR/data/
DATA_MIGRATIONS=(
  "privatebin/data:privatebin"
  "searxng/searxng-data:searxng"
  "searxng/valkey-data:searxng/valkey"
  "convertx/data:convertx"
)

# ── Flags ─────────────────────────────────────────────────────────────────────

DRY_RUN=false
AUTO_YES=false
RUN_PHASES=()

# ── Colors ────────────────────────────────────────────────────────────────────

if [[ -t 1 ]]; then
  BOLD='\033[1m'
  DIM='\033[2m'
  RED='\033[0;31m'
  GREEN='\033[0;32m'
  YELLOW='\033[0;33m'
  BLUE='\033[0;34m'
  CYAN='\033[0;36m'
  RESET='\033[0m'
else
  BOLD='' DIM='' RED='' GREEN='' YELLOW='' BLUE='' CYAN='' RESET=''
fi

# ── Logging ───────────────────────────────────────────────────────────────────

log()     { echo -e "${BOLD}${BLUE}==>${RESET} $*"; }
ok()      { echo -e "${GREEN}  ✓${RESET} $*"; }
warn()    { echo -e "${YELLOW}  ⚠${RESET} $*"; }
err()     { echo -e "${RED}  ✗${RESET} $*" >&2; }
step()    { echo -e "\n${BOLD}${CYAN}── $* ──────────────────────────────────────${RESET}"; }
dim()     { echo -e "${DIM}    $*${RESET}"; }

run() {
  if [[ "$DRY_RUN" == true ]]; then
    echo -e "${DIM}  [dry-run] $*${RESET}"
  else
    eval "$@"
  fi
}

confirm() {
  local msg="$1"
  if [[ "$AUTO_YES" == true ]]; then
    warn "$msg — auto-confirmed (--yes)"
    return 0
  fi
  echo -e "${YELLOW}?${RESET} $msg [y/N] "
  read -r reply
  [[ "$reply" =~ ^[Yy]$ ]]
}

should_run() {
  local phase="$1"
  [[ ${#RUN_PHASES[@]} -eq 0 ]] || printf '%s\n' "${RUN_PHASES[@]}" | grep -qx "$phase"
}

# ── Preflight ─────────────────────────────────────────────────────────────────

preflight() {
  step "Preflight checks"

  if [[ "$EUID" -ne 0 ]]; then
    err "This script must be run as root."
    exit 1
  fi
  ok "Running as root"

  for cmd in docker git; do
    if ! command -v "$cmd" &>/dev/null; then
      err "Required command not found: $cmd"
      exit 1
    fi
    ok "$cmd available ($(command -v "$cmd"))"
  done

  if [[ "$DRY_RUN" == true ]]; then
    warn "DRY RUN MODE — no changes will be made"
  fi
}

# ── Phase: export ─────────────────────────────────────────────────────────────

phase_export() {
  step "Exporting Docker state snapshot"

  local ts
  ts=$(date +%Y%m%d-%H%M%S)
  local out="$SNAPSHOT_DIR/$ts"

  run "mkdir -p '$out'"

  log "Containers (all)"
  run "docker ps -a --format 'table {{.ID}}\t{{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}' \
    | tee '$out/containers.txt'"

  log "Images"
  run "docker images --format 'table {{.Repository}}\t{{.Tag}}\t{{.ID}}\t{{.Size}}' \
    | tee '$out/images.txt'"

  log "Volumes"
  run "docker volume ls | tee '$out/volumes.txt'"

  log "Networks"
  run "docker network ls | tee '$out/networks.txt'"

  log "Full container inspect (JSON)"
  run "docker ps -aq | xargs -r docker inspect | tee '$out/containers-inspect.json'"

  log "Full volume inspect (JSON)"
  run "docker volume ls -q | xargs -r docker inspect | tee '$out/volumes-inspect.json'"

  log "Compose project list"
  run "docker compose ls 2>/dev/null | tee '$out/compose-projects.txt' || true"

  log "Disk usage"
  run "docker system df -v | tee '$out/disk-usage.txt'"

  log "Per-service compose configs"
  for svc in "${OLD_SERVICES[@]}"; do
    local compose_file="$OLD_BASE/$svc/compose.yaml"
    if [[ ! -f "$compose_file" ]]; then
      compose_file="$OLD_BASE/$svc/docker-compose.yml"
    fi
    if [[ -f "$compose_file" ]]; then
      run "cp '$compose_file' '$out/${svc}-compose.yaml' 2>/dev/null || true"
      ok "Saved $svc compose config"
    else
      warn "No compose file found for $svc"
    fi
  done

  if [[ "$DRY_RUN" == false ]]; then
    ok "Snapshot saved to $out"
  fi
}

# ── Phase: clone ──────────────────────────────────────────────────────────────

phase_clone() {
  step "Cloning repository to $INSTALL_DIR"

  if [[ -d "$INSTALL_DIR/.git" ]]; then
    warn "$INSTALL_DIR already exists — pulling latest instead"
    run "git -C '$INSTALL_DIR' pull --ff-only"
  else
    run "git clone '$REPO_URL' '$INSTALL_DIR'"
  fi

  ok "Repository ready at $INSTALL_DIR"
}

# ── Phase: env ────────────────────────────────────────────────────────────────

phase_env() {
  step "Generating $INSTALL_DIR/.env"

  local env_file="$INSTALL_DIR/.env"

  if [[ -f "$env_file" ]]; then
    warn ".env already exists — skipping (delete it to regenerate)"
    return 0
  fi

  # Detect Tailscale IP
  local tailscale_ip=""
  if command -v tailscale &>/dev/null; then
    tailscale_ip=$(tailscale ip -4 2>/dev/null | head -1 || true)
  fi
  if [[ -z "$tailscale_ip" ]]; then
    # Try to extract from an existing old compose file
    tailscale_ip=$(grep -h "TAILSCALE_IP" "$OLD_BASE"/privatebin/compose.yaml \
      "$OLD_BASE"/searxng/compose.yaml 2>/dev/null \
      | grep -oE '([0-9]{1,3}\.){3}[0-9]{1,3}' | head -1 || true)
  fi
  if [[ -z "$tailscale_ip" ]]; then
    tailscale_ip="100.64.x.x"
    warn "Could not detect Tailscale IP — set TAILSCALE_IP manually in .env"
  else
    ok "Detected Tailscale IP: $tailscale_ip"
  fi

  # Extract SEARXNG_SECRET from old compose
  local searxng_secret=""
  searxng_secret=$(grep -h "SEARXNG_SECRET" "$OLD_BASE/searxng/compose.yaml" 2>/dev/null \
    | grep -oP '(?<==)[^\s]+' | head -1 || true)
  if [[ -z "$searxng_secret" ]]; then
    searxng_secret=$(openssl rand -hex 32 2>/dev/null || cat /proc/sys/kernel/random/uuid)
    warn "Could not extract SEARXNG_SECRET from old config — generated new value"
  else
    ok "Extracted SEARXNG_SECRET from old SearXNG compose"
  fi

  # Generate CONVERTX_JWT_SECRET
  local convertx_jwt=""
  convertx_jwt=$(openssl rand -hex 32 2>/dev/null || cat /proc/sys/kernel/random/uuid)
  ok "Generated CONVERTX_JWT_SECRET"

  run "cat > '$env_file' <<EOF
# =============================================================================
# atl.tools — environment variables
# Generated by migrate.sh on $(date)
# =============================================================================

# Tailscale IP — bind all services to this address
TAILSCALE_IP=${tailscale_ip}

# PrivateBin
PRIVATEBIN_PORT=8080

# SearXNG
SEARXNG_PORT=8082
SEARXNG_SECRET=${searxng_secret}

# ConvertX
CONVERTX_PORT=3001
CONVERTX_JWT_SECRET=${convertx_jwt}

# IT-Tools
IT_TOOLS_PORT=8083

# CyberChef
CYBERCHEF_PORT=1337

# JSON Crack
JSONCRACK_PORT=8890

# Stirling-PDF
STIRLING_PDF_PORT=8084
EOF"

  if [[ "$DRY_RUN" == false ]]; then
    run "chmod 600 '$env_file'"
    ok ".env written — review $env_file before starting services"
  fi
}

# ── Phase: data ───────────────────────────────────────────────────────────────

phase_data() {
  step "Migrating bind-mount data"

  local data_root="$INSTALL_DIR/data"

  # Create all required data directories
  log "Creating data directory tree"
  run "mkdir -p \
    '$data_root/privatebin' \
    '$data_root/searxng/valkey' \
    '$data_root/convertx' \
    '$data_root/stirling-pdf/training' \
    '$data_root/stirling-pdf/configs' \
    '$data_root/stirling-pdf/logs' \
    '$data_root/stirling-pdf/custom'"
  ok "Data directories created"

  # Copy data from old locations
  for mapping in "${DATA_MIGRATIONS[@]}"; do
    local old_rel="${mapping%%:*}"
    local new_rel="${mapping##*:}"
    local src="$OLD_BASE/$old_rel"
    local dst="$data_root/$new_rel"

    if [[ ! -d "$src" ]]; then
      warn "Old data directory not found, skipping: $src"
      continue
    fi

    local size
    size=$(du -sh "$src" 2>/dev/null | cut -f1 || echo "?")
    log "Copying $src → $dst ($size)"

    # rsync: archive, preserve permissions, skip identical files, show progress
    run "rsync -a --info=progress2 '$src/' '$dst/'"
    ok "Migrated $old_rel ($size)"
  done

  # Check if old SearXNG config differs from repo version
  if [[ -f "$OLD_BASE/searxng/searxng/settings.yml" && "$DRY_RUN" == false ]]; then
    if ! diff -q \
      "$OLD_BASE/searxng/searxng/settings.yml" \
      "$INSTALL_DIR/apps/searxng/settings.yml" &>/dev/null; then
      warn "SearXNG settings.yml differs from the repo version."
      warn "Old: $OLD_BASE/searxng/searxng/settings.yml"
      warn "New: $INSTALL_DIR/apps/searxng/settings.yml"
      warn "Review and reconcile manually before starting SearXNG."
    else
      ok "SearXNG settings.yml matches repo version — no action needed"
    fi
  fi
}

# ── Phase: stop-old ───────────────────────────────────────────────────────────

phase_stop_old() {
  step "Stopping old containers"

  warn "This will stop the following old services: ${OLD_SERVICES[*]}"
  warn "Services NOT touched: azuracast, cryptpad, libretranslate, openwebui, shasum, stk"

  if ! confirm "Stop old overlapping containers now?"; then
    warn "Skipped — stop them manually before starting the new stack to avoid port conflicts"
    return 0
  fi

  for svc in "${OLD_SERVICES[@]}"; do
    local dir="$OLD_BASE/$svc"
    if [[ ! -d "$dir" ]]; then
      dim "$svc — directory not found, skipping"
      continue
    fi

    local compose_file="$dir/compose.yaml"
    if [[ ! -f "$compose_file" ]]; then
      compose_file="$dir/docker-compose.yml"
    fi

    if [[ ! -f "$compose_file" ]]; then
      warn "$svc — no compose file found in $dir"
      continue
    fi

    log "Stopping $svc"
    run "docker compose -f '$compose_file' down"
    ok "$svc stopped"
  done
}

# ── Phase: start-new ──────────────────────────────────────────────────────────

phase_start_new() {
  step "Starting new stack"

  local env_file="$INSTALL_DIR/.env"
  if [[ ! -f "$env_file" ]]; then
    err ".env not found at $env_file — run the 'env' phase first"
    exit 1
  fi

  # Sanity-check for placeholder IP
  if grep -q "100.64.x.x" "$env_file" 2>/dev/null; then
    err "TAILSCALE_IP is still set to placeholder '100.64.x.x' in $env_file"
    err "Set it to your actual Tailscale IP before starting services."
    exit 1
  fi

  log "Pulling latest images"
  run "docker compose -f '$INSTALL_DIR/compose.yaml' --env-file '$env_file' pull"

  log "Starting all services (detached)"
  run "docker compose -f '$INSTALL_DIR/compose.yaml' --env-file '$env_file' up -d"

  ok "New stack started"
}

# ── Phase: verify ─────────────────────────────────────────────────────────────

phase_verify() {
  step "Verifying new stack"

  if [[ "$DRY_RUN" == true ]]; then
    dim "[dry-run] would show: docker compose ps"
    return 0
  fi

  docker compose -f "$INSTALL_DIR/compose.yaml" ps

  echo ""
  log "Waiting up to 30s for containers to become healthy..."
  local attempts=0
  while [[ $attempts -lt 6 ]]; do
    local unhealthy
    unhealthy=$(docker compose -f "$INSTALL_DIR/compose.yaml" ps --format json 2>/dev/null \
      | grep -c '"Health":"unhealthy"' || true)
    local starting
    starting=$(docker compose -f "$INSTALL_DIR/compose.yaml" ps --format json 2>/dev/null \
      | grep -c '"Health":"starting"' || true)
    if [[ "$starting" -eq 0 && "$unhealthy" -eq 0 ]]; then
      break
    fi
    dim "  ($starting starting, $unhealthy unhealthy) — waiting 5s..."
    sleep 5
    (( attempts++ ))
  done

  docker compose -f "$INSTALL_DIR/compose.yaml" ps
  ok "Verify complete — check any unhealthy containers above"
}

# ── Argument parsing ──────────────────────────────────────────────────────────

parse_args() {
  local valid_phases=(export clone env data stop-old start-new verify)

  while [[ $# -gt 0 ]]; do
    case "$1" in
      --dry-run) DRY_RUN=true ;;
      --yes)     AUTO_YES=true ;;
      --*)
        err "Unknown option: $1"
        exit 1
        ;;
      *)
        # Validate phase name
        local found=false
        for p in "${valid_phases[@]}"; do
          [[ "$1" == "$p" ]] && found=true && break
        done
        if [[ "$found" == false ]]; then
          err "Unknown phase: $1 (valid: ${valid_phases[*]})"
          exit 1
        fi
        RUN_PHASES+=("$1")
        ;;
    esac
    shift
  done
}

# ── Main ──────────────────────────────────────────────────────────────────────

main() {
  parse_args "$@"

  echo -e "\n${BOLD}atl.tools — Migration Script${RESET}"
  echo -e "${DIM}$(date)${RESET}\n"

  preflight

  should_run export    && phase_export
  should_run clone     && phase_clone
  should_run env       && phase_env
  should_run data      && phase_data
  should_run stop-old  && phase_stop_old
  should_run start-new && phase_start_new
  should_run verify    && phase_verify

  echo ""
  ok "Migration complete."
  echo ""
  echo -e "  ${DIM}Services not migrated (still running from /opt):${RESET}"
  echo -e "  ${DIM}  azuracast, cryptpad, libretranslate, openwebui, shasum, stk${RESET}"
  echo -e "  ${DIM}These have no overlap with the new stack and are untouched.${RESET}"
  echo ""
}

main "$@"
