default:
    @just --list

# =============================================================================
# Orchestration
# =============================================================================

# Start all services
[group('Orchestration')]
up:
    docker compose up -d

# Start a specific service
[group('Orchestration')]
up-service service:
    docker compose up -d {{service}}

# Stop all services
[group('Orchestration')]
down:
    docker compose down

# Restart a specific service
[group('Orchestration')]
restart service:
    docker compose restart {{service}}

# Show status of all services
[group('Orchestration')]
status:
    docker compose ps

# =============================================================================
# Logs
# =============================================================================

# Follow logs for all services (or a specific one)
[group('Logs')]
logs service="":
    docker compose logs -f {{service}}

# =============================================================================
# Maintenance
# =============================================================================

# Pull latest images for all services
[group('Maintenance')]
pull:
    docker compose pull

# Remove stopped containers and unused images
[group('Maintenance')]
prune:
    docker compose down --remove-orphans
    docker image prune -f

# =============================================================================
# Development
# =============================================================================

# Start the web frontend in dev mode
[group('Development')]
dev:
    pnpm --filter @atl.tools/web dev

# Build the web frontend
[group('Development')]
build:
    pnpm turbo build
