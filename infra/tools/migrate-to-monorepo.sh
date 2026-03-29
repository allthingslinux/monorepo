#!/usr/bin/env bash
# =============================================================================
# migrate-to-monorepo.sh — Migrate /opt/atl.tools to the allthingslinux monorepo
# =============================================================================
# Run on the tools VPS as root.
#
# Usage:
#   ./migrate-to-monorepo.sh [OPTIONS] [PHASES]
#
# Options:
#   --dry-run     Print actions without executing them
#   --yes         Skip confirmation prompts
#
# Phases (run all by default, or pass specific ones):
#   export        Dump Docker state snapshot from the old stack
#   clone         Clone the monorepo to $INSTALL_DIR
#   env           Migrate .env from old atl.tools install + add new vars
#   data          Rsync bind-mount data to new paths under services/tools/
#   stop-old      Stop the old atl.tools Docker stack
#   start-new     Start tools services from the monorepo stack
#   verify        Show container status and reachability
#
# Examples:
#   ./migrate-to-monorepo.sh                       # full migration, interactive
#   ./migrate-to-monorepo.sh --dry-run             # preview all actions
#   ./migrate-to-monorepo.sh --yes export clone    # run only export + clone
# =============================================================================

set -euo pipefail

# ── Configuration ─────────────────────────────────────────────────────────────

REPO_URL="https://github.com/allthingslinux/monorepo.git"
INSTALL_DIR="/opt/monorepo"
OLD_DIR="/opt/atl.tools"
SNAPSHOT_DIR="/opt/atl.tools-migration-snapshots"

# Services to start from the monorepo stack
TOOLS_SERVICES=(
  atl-tools-privatebin
  atl-tools-cyberchef
  atl-tools-convertx
  atl-tools-searxng
  atl-tools-it-tools
  atl-tools-jsoncrack
  atl-tools-stirling-pdf
  atl-tools-hckrnws
  atl-tools-alloy-agent
)

# Data migrations: "old_relative_path:new_relative_path_under_services/tools"
# old paths are relative to $OLD_DIR/data/
# new paths are relative to $INSTALL_DIR/services/tools/
DATA_MIGRATIONS=(
  "privatebin:privatebin/data"
  "searxng:searxng/data"
  "convertx:convertx/data"
  "stirling-pdf:stirling-pdf/data"
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

log()  { echo -e "${BOLD}${BLUE}==>${RESET} $*"; }
ok()   { echo -e "${GREEN}  ✓${RESET} $*"; }
warn() { echo -e "${YELLOW}  ⚠${RESET} $*"; }
err()  { echo -e "${RED}  ✗${RESET} $*" >&2; }
step() { echo -e "\n${BOLD}${CYAN}── $* ──────────────────────────────────────${RESET}"; }
dim()  { echo -e "${DIM}    $*${RESET}"; }

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

  for cmd in docker git rsync; do
    if ! command -v "$cmd" &>/dev/null; then
      err "Required command not found: $cmd"
      exit 1
    fi
    ok "$cmd available"
  done

  if [[ ! -d "$OLD_DIR" ]]; then
    err "Old install not found at $OLD_DIR"
    exit 1
  fi
  ok "Old install found at $OLD_DIR"

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

  log "Compose project list"
  run "docker compose ls 2>/dev/null | tee '$out/compose-projects.txt' || true"

  log "Disk usage"
  run "docker system df -v | tee '$out/disk-usage.txt'"

  log "Old atl.tools compose config"
  run "cp '$OLD_DIR/compose.yaml' '$out/atl-tools-compose.yaml' 2>/dev/null || true"

  if [[ "$DRY_RUN" == false ]]; then
    ok "Snapshot saved to $out"
  fi
}

# ── Phase: clone ──────────────────────────────────────────────────────────────

phase_clone() {
  step "Cloning monorepo to $INSTALL_DIR"

  if [[ -d "$INSTALL_DIR/.git" ]]; then
    warn "$INSTALL_DIR already exists — pulling latest instead"
    run "git -C '$INSTALL_DIR' pull --ff-only"
  else
    run "git clone '$REPO_URL' '$INSTALL_DIR'"
  fi

  ok "Monorepo ready at $INSTALL_DIR"
}

# ── Phase: env ────────────────────────────────────────────────────────────────

phase_env() {
  step "Migrating .env to $INSTALL_DIR/.env"

  local new_env="$INSTALL_DIR/.env"
  local old_env="$OLD_DIR/.env"

  if [[ -f "$new_env" ]]; then
    warn ".env already exists at $new_env — skipping (delete to regenerate)"
    return 0
  fi

  if [[ ! -f "$old_env" ]]; then
    err "Old .env not found at $old_env"
    exit 1
  fi

  # Copy the old .env as the base
  run "cp '$old_env' '$new_env'"
  ok "Copied old .env as base"

  if [[ "$DRY_RUN" == false ]]; then
    run "chmod 600 '$new_env'"
  fi

  # Append new variables not present in the old .env
  local new_vars=(
    "HCKRNWS_PORT=3000"
    "ALLOY_REMOTE_WRITE_URL="
    "ALLOY_LOKI_URL="
  )

  for var in "${new_vars[@]}"; do
    local key="${var%%=*}"
    if ! grep -q "^${key}=" "$new_env" 2>/dev/null; then
      run "echo '${var}' >> '$new_env'"
      ok "Added $key (not present in old .env)"
    else
      dim "$key already present — skipping"
    fi
  done

  # Warn about Alloy vars that must be filled in
  warn "ALLOY_REMOTE_WRITE_URL and ALLOY_LOKI_URL must be set manually in $new_env"
  warn "These are the Tailscale addresses of the central Mimir/Loki instances."
  warn "Review $new_env before starting services."
}

# ── Phase: data ───────────────────────────────────────────────────────────────

phase_data() {
  step "Migrating bind-mount data"

  local old_data="$OLD_DIR/data"
  local new_services="$INSTALL_DIR/services/tools"

  if [[ ! -d "$old_data" ]]; then
    warn "No data directory found at $old_data — skipping data migration"
    return 0
  fi

  for mapping in "${DATA_MIGRATIONS[@]}"; do
    local old_rel="${mapping%%:*}"
    local new_rel="${mapping##*:}"
    local src="$old_data/$old_rel"
    local dst="$new_services/$new_rel"

    if [[ ! -d "$src" ]]; then
      warn "Old data directory not found, skipping: $src"
      continue
    fi

    local size
    size=$(du -sh "$src" 2>/dev/null | cut -f1 || echo "?")
    log "Copying $src → $dst ($size)"

    run "mkdir -p '$dst'"
    run "rsync -a --info=progress2 '$src/' '$dst/'"
    ok "Migrated $old_rel ($size)"
  done

  # Check if SearXNG settings.yml differs
  local old_settings="$OLD_DIR/apps/searxng/settings.yml"
  local new_settings="$INSTALL_DIR/services/tools/searxng/settings.yml"
  if [[ -f "$old_settings" && -f "$new_settings" && "$DRY_RUN" == false ]]; then
    if ! diff -q "$old_settings" "$new_settings" &>/dev/null; then
      warn "SearXNG settings.yml differs between old and new:"
      warn "  Old: $old_settings"
      warn "  New: $new_settings"
      warn "Review and reconcile manually before starting SearXNG."
    else
      ok "SearXNG settings.yml matches — no action needed"
    fi
  fi
}

# ── Phase: stop-old ───────────────────────────────────────────────────────────

phase_stop_old() {
  step "Stopping old atl.tools stack"

  local old_compose="$OLD_DIR/compose.yaml"
  local old_env="$OLD_DIR/.env"

  if [[ ! -f "$old_compose" ]]; then
    warn "No compose file found at $old_compose — nothing to stop"
    return 0
  fi

  warn "This will stop all containers managed by $old_compose"

  if ! confirm "Stop the old atl.tools stack now?"; then
    warn "Skipped — stop the old stack manually before starting the new one to avoid port conflicts"
    return 0
  fi

  local env_flag=""
  [[ -f "$old_env" ]] && env_flag="--env-file '$old_env'"

  run "docker compose -f '$old_compose' ${env_flag} down"
  ok "Old atl.tools stack stopped"
}

# ── Phase: start-new ──────────────────────────────────────────────────────────

phase_start_new() {
  step "Starting tools services from monorepo"

  local env_file="$INSTALL_DIR/.env"
  local compose_file="$INSTALL_DIR/compose.yaml"

  if [[ ! -f "$env_file" ]]; then
    err ".env not found at $env_file — run the 'env' phase first"
    exit 1
  fi

  # Sanity-check for placeholder values
  if grep -q "100.64.x.x" "$env_file" 2>/dev/null; then
    err "TAILSCALE_IP is still set to placeholder '100.64.x.x' in $env_file"
    exit 1
  fi

  if grep -qE "^ALLOY_(REMOTE_WRITE|LOKI)_URL=$" "$env_file" 2>/dev/null; then
    warn "ALLOY_REMOTE_WRITE_URL or ALLOY_LOKI_URL is empty — alloy-agent may not start correctly"
    warn "Set these in $env_file before proceeding, or skip by removing atl-tools-alloy-agent from startup."
    if ! confirm "Continue anyway?"; then
      err "Aborted."
      exit 1
    fi
  fi

  # Create atl-tools Docker network if it doesn't exist
  if ! docker network inspect atl-tools &>/dev/null; then
    log "Creating atl-tools Docker network"
    run "docker network create atl-tools"
    ok "atl-tools network created"
  else
    dim "atl-tools network already exists"
  fi

  log "Pulling latest images"
  run "docker compose -f '$compose_file' --env-file '$env_file' pull ${TOOLS_SERVICES[*]}"

  # Build custom images (jsoncrack, hckrnws)
  log "Building custom images"
  run "docker compose -f '$compose_file' --env-file '$env_file' build atl-tools-jsoncrack atl-tools-hckrnws"

  log "Starting tools services (detached)"
  run "docker compose -f '$compose_file' --env-file '$env_file' up -d ${TOOLS_SERVICES[*]}"

  ok "Tools services started"
}

# ── Phase: verify ─────────────────────────────────────────────────────────────

phase_verify() {
  step "Verifying new stack"

  if [[ "$DRY_RUN" == true ]]; then
    dim "[dry-run] would show: docker compose ps"
    return 0
  fi

  local env_file="$INSTALL_DIR/.env"
  local compose_file="$INSTALL_DIR/compose.yaml"

  docker compose -f "$compose_file" --env-file "$env_file" \
    ps "${TOOLS_SERVICES[@]}"

  echo ""
  log "Waiting up to 30s for containers to become healthy..."
  local attempts=0
  while [[ $attempts -lt 6 ]]; do
    local unhealthy starting
    unhealthy=$(docker compose -f "$compose_file" --env-file "$env_file" \
      ps --format json 2>/dev/null | grep -c '"Health":"unhealthy"' || true)
    starting=$(docker compose -f "$compose_file" --env-file "$env_file" \
      ps --format json 2>/dev/null | grep -c '"Health":"starting"' || true)
    if [[ "$starting" -eq 0 && "$unhealthy" -eq 0 ]]; then
      break
    fi
    dim "  ($starting starting, $unhealthy unhealthy) — waiting 5s..."
    sleep 5
    (( attempts++ ))
  done

  docker compose -f "$compose_file" --env-file "$env_file" \
    ps "${TOOLS_SERVICES[@]}"

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

  echo -e "\n${BOLD}allthingslinux monorepo — tools VPS migration${RESET}"
  echo -e "${DIM}Migrates /opt/atl.tools → $INSTALL_DIR${RESET}"
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
  echo -e "  ${DIM}Next steps:${RESET}"
  echo -e "  ${DIM}  1. Verify Caddy/reverse-proxy config points to new container names (atl-tools-*)${RESET}"
  echo -e "  ${DIM}  2. Set ALLOY_REMOTE_WRITE_URL and ALLOY_LOKI_URL in $INSTALL_DIR/.env${RESET}"
  echo -e "  ${DIM}  3. Archive or remove $OLD_DIR once satisfied${RESET}"
  echo ""
}

main "$@"
