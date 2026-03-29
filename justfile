# All Things Linux monorepo — task runner (https://just.systems/)
# Requires: pnpm 10+, Node 24+, uv, Docker, just.
# Run `just setup` once after cloning to bootstrap everything.

set dotenv-load := true
set positional-arguments := true

# Compose project for chat services
chat_compose := "-f compose.yaml -f compose.dev-override.yaml --env-file .env --env-file .env.dev"

# ── Default ────────────────────────────────────────────────────────────────────

default:
    @just --list

# ── Workspace ─────────────────────────────────────────────────────────────────
[group('workspace')]
setup:
    @echo "Bootstrapping full development environment..."
    pnpm install
    uv sync --all-extras
    ./scripts/init.sh dev
    [ ! -f .env ] && cp .env.example .env || true
    [ ! -f .env.dev ] && cp .env.dev.example .env.dev || true
    @echo "Done. Run 'just dev' to start JS apps or 'just chat-dev' for chat services."

[group('workspace')]
install:
    pnpm install

[group('workspace')]
install-frozen:
    pnpm install --frozen-lockfile

[group('workspace')]
build:
    pnpm exec turbo run build

[group('workspace')]
dev:
    pnpm exec turbo run dev

[group('workspace')]
check:
    pnpm run check

[group('workspace')]
fix:
    pnpm run fix

[group('workspace')]
typecheck:
    pnpm exec turbo run type-check

[group('workspace')]
test:
    pnpm exec turbo run test

[group('workspace')]
test-coverage:
    pnpm exec turbo run test:coverage

[group('workspace')]
clean:
    pnpm run clean

# ── Web (apps/web — allthingslinux.org) ───────────────────────────────────────
[group('web')]
web-dev:
    pnpm --filter @atl/web dev

[group('web')]
web-build:
    pnpm --filter @atl/web run build:all

[group('web')]
web-deploy:
    pnpm --filter @atl/web run deploy

[group('web')]
web-destroy:
    pnpm --filter @atl/web run destroy

[group('web')]
web-shadcn-add *ARGS:
    cd apps/web && npx shadcn@latest add --overwrite {{ ARGS }}

# ── Chat Web (apps/chat-web — atl.chat marketing) ─────────────────────────────
[group('web')]
chat-web-dev:
    pnpm --filter @atl/chat-web dev

[group('web')]
chat-web-build:
    pnpm --filter @atl/chat-web run build

[group('web')]
chat-web-deploy:
    pnpm --filter @atl/chat-web run deploy

# ── Portal (apps/portal) ──────────────────────────────────────────────────────
[group('portal')]
portal-dev:
    pnpm --filter @atl/portal dev

[group('portal')]
portal-build:
    pnpm --filter @atl/portal build

[group('portal')]
portal-start:
    pnpm --filter @atl/portal start

[group('portal')]
portal-db-up:
    pnpm --filter @atl/portal run compose:db

[group('portal')]
portal-db-down:
    pnpm --filter @atl/portal run compose:db:down

[group('portal')]
portal-db-generate:
    pnpm --filter @atl/portal run db:generate

[group('portal')]
portal-db-migrate:
    pnpm --filter @atl/portal run db:migrate

[group('portal')]
portal-db-push:
    pnpm --filter @atl/portal run db:push

[group('portal')]
portal-db-studio:
    pnpm --filter @atl/portal run db:studio

[group('portal')]
portal-db-seed:
    pnpm --filter @atl/portal run db:seed

[group('portal')]
portal-shadcn-add *ARGS:
    cd apps/portal && npx shadcn@latest add --overwrite {{ ARGS }}

# ── Chat Services (IRC + XMPP + bridge — Docker) ──────────────────────────────
[group('chat')]
chat-init:
    @echo "Initializing chat service data directories and config..."
    ./scripts/init.sh dev

[group('chat')]
chat-dev:
    @if docker compose {{ chat_compose }} ps --services --status running | grep -q "."; then \
        echo "Error: chat containers already running. Run 'just chat-down' first."; \
        exit 1; \
    fi
    ./scripts/init.sh dev
    docker compose {{ chat_compose }} --profile dev up -d

[group('chat')]
chat-prod:
    ./scripts/init.sh prod
    docker compose -f compose.yaml -f compose.prod-override.yaml --env-file .env --env-file .env.prod up -d

[group('chat')]
chat-down:
    docker compose {{ chat_compose }} --profile dev down

[group('chat')]
chat-down-prod:
    docker compose -f compose.yaml -f compose.prod-override.yaml --env-file .env --env-file .env.prod down

[group('chat')]
chat-logs service="":
    docker compose {{ chat_compose }} logs -f ${service:+"$service"}

[group('chat')]
chat-status:
    docker compose {{ chat_compose }} ps

[group('chat')]
chat-build:
    docker compose {{ chat_compose }} build

[group('chat')]
chat-build-clean service="":
    docker compose {{ chat_compose }} build --no-cache ${service:+"$service"}

[group('chat')]
prosody-token:
    @docker exec -i atl-xmpp-server prosodyctl shell <<< '>local tk = prosody.hosts["xmpp.localhost"].modules.tokenauth; local grant = tk.create_grant("admin@xmpp.localhost", "admin@xmpp.localhost", nil, {}); local token = tk.create_token("admin@xmpp.localhost", grant, "prosody:operator", nil, "portal-api"); print(token)' 2>&1 | grep -oP 'secret-token:\S+'

[group('chat')]
gencloak:
    #!/usr/bin/env bash
    set -e
    output=$(docker compose run --rm atl-irc-server gencloak 2>/dev/null)
    echo "$output"
    mapfile -t keys < <(echo "$output" | grep -oE '"[^"]{50,}"' | tr -d '"')
    if [ ${#keys[@]} -ne 3 ]; then
        echo "Failed to parse 3 cloak keys from gencloak output"; exit 1
    fi
    [ -f .env ] || cp .env.example .env
    if grep -q '^IRC_CLOAK_KEY_1=' .env; then
        sed -i "s|^IRC_CLOAK_KEY_1=.*|IRC_CLOAK_KEY_1=${keys[0]}|" .env
        sed -i "s|^IRC_CLOAK_KEY_2=.*|IRC_CLOAK_KEY_2=${keys[1]}|" .env
        sed -i "s|^IRC_CLOAK_KEY_3=.*|IRC_CLOAK_KEY_3=${keys[2]}|" .env
    else
        printf '\nIRC_CLOAK_KEY_1=%s\nIRC_CLOAK_KEY_2=%s\nIRC_CLOAK_KEY_3=%s\n' \
            "${keys[0]}" "${keys[1]}" "${keys[2]}" >> .env
    fi
    echo "Cloak keys written to .env — restart IRC to apply."

# ── Bridge (apps/bridge — Python) ────────────────────────────────────────────
[group('bridge')]
bridge-install:
    uv sync --all-extras

[group('bridge')]
bridge-check:
    uv run ruff check apps/bridge/src apps/bridge/tests
    uv run ruff format --check apps/bridge/src apps/bridge/tests

[group('bridge')]
bridge-fix:
    uv run ruff check --fix apps/bridge/src apps/bridge/tests
    uv run ruff format apps/bridge/src apps/bridge/tests

[group('bridge')]
bridge-typecheck:
    uv run basedpyright

[group('bridge')]
bridge-test:
    uv run pytest apps/bridge/tests -v --tb=short

[group('bridge')]
bridge-logs:
    docker compose {{ chat_compose }} logs -f atl-bridge

# ── Docs (apps/docs) ──────────────────────────────────────────────────────────
[group('docs')]
docs-dev:
    pnpm --filter @atl/docs dev

[group('docs')]
docs-build:
    pnpm --filter @atl/docs run build

[group('docs')]
docs-check-links:
    pnpm --filter @atl/docs run lint:links

# ── Tools (atl.tools — self-hosted service directory) ────────────────────────

tools_compose := "-f compose.yaml --env-file .env --env-file .env.dev"

[group('tools')]
tools-dev:
    docker compose {{ tools_compose }} up -d atl-tools-privatebin atl-tools-cyberchef atl-tools-convertx atl-tools-searxng atl-tools-it-tools atl-tools-jsoncrack atl-tools-stirling-pdf atl-tools-hckrnws

[group('tools')]
tools-up service:
    docker compose {{ tools_compose }} up -d {{ service }}

[group('tools')]
tools-down:
    docker compose {{ tools_compose }} stop atl-tools-privatebin atl-tools-cyberchef atl-tools-convertx atl-tools-searxng atl-tools-it-tools atl-tools-jsoncrack atl-tools-stirling-pdf atl-tools-hckrnws

[group('tools')]
tools-logs service="":
    docker compose {{ tools_compose }} logs -f {{ service }}

[group('tools')]
tools-status:
    docker compose {{ tools_compose }} ps atl-tools-privatebin atl-tools-cyberchef atl-tools-convertx atl-tools-searxng atl-tools-it-tools atl-tools-jsoncrack atl-tools-stirling-pdf atl-tools-hckrnws

[group('tools')]
tools-build:
    docker compose {{ tools_compose }} build atl-tools-jsoncrack atl-tools-hckrnws

[group('tools')]
tools-web-dev:
    pnpm --filter @atl/tools dev

[group('tools')]
tools-web-build:
    pnpm --filter @atl/tools build

[group('tools')]
tools-web-deploy:
    pnpm --filter @atl/tools run deploy

# ── CI & Config Validation ────────────────────────────────────────────────────
[group('ci')]
renovate-validate:
    pnpm dlx --package=renovate renovate-config-validator .github/renovate.json5

# ── Infra & Maintenance ───────────────────────────────────────────────────────
[group('infra')]
docker-clean:
    docker system prune -f
    docker volume prune -f

[group('infra')]
docker-push-all:
    @echo "Push all service images to GHCR..."
    docker compose {{ chat_compose }} push

# ── Pubnix (infra/sh — atl.sh server provisioning) ────────────────────────────

pubnix_ansible := "infra/sh/ansible"
pubnix_terraform := "infra/sh/terraform"
pubnix_root := "infra/sh"

[group('pubnix')]
pubnix-setup:
    cd {{ pubnix_root }} && uv sync
    just pubnix-install
    @echo "Pubnix tooling ready. Run 'just pubnix-dev-up' to start the dev VM."

[group('pubnix')]
pubnix-install:
    cd {{ pubnix_ansible }} && ansible-galaxy role install -r requirements.yml -p ../.ansible/roles --force
    cd {{ pubnix_ansible }} && ansible-galaxy collection install -r requirements.yml -p ../.ansible/collections --force

[group('pubnix')]
pubnix-deploy target:
    cd {{ pubnix_ansible }} && ansible-playbook site.yml -l "{{ target }}"

[group('pubnix')]
pubnix-deploy-tag target tag:
    cd {{ pubnix_ansible }} && ansible-playbook site.yml -l "{{ target }}" --tags "{{ tag }}"

[group('pubnix')]
pubnix-deploy-check target:
    cd {{ pubnix_ansible }} && ansible-playbook site.yml -l "{{ target }}" --check --diff

[group('pubnix')]
pubnix-deploy-list-tags:
    cd {{ pubnix_ansible }} && ansible-playbook site.yml --list-tags

[group('pubnix')]
pubnix-ping target:
    cd {{ pubnix_ansible }} && ansible "{{ target }}" -m ping

[group('pubnix')]
pubnix-syntax-check:
    cd {{ pubnix_ansible }} && ansible-playbook site.yml --syntax-check

[group('pubnix')]
pubnix-create-user username key target:
    cd {{ pubnix_ansible }} && ansible-playbook playbooks/create-user.yml -e "username={{ username }}" -e "ssh_public_key='{{ key }}'" -e "target_hosts={{ target }}"

[group('pubnix')]
pubnix-remove-user username target:
    cd {{ pubnix_ansible }} && ansible-playbook playbooks/remove-user.yml -e "username={{ username }}" -e "target_hosts={{ target }}"

[group('pubnix')]
pubnix-smoke-test target="dev":
    cd {{ pubnix_ansible }} && ansible-playbook playbooks/smoke-test.yml -e "target_hosts={{ target }}"

[group('pubnix')]
pubnix-vault-edit:
    ansible-vault edit {{ pubnix_ansible }}/inventory/group_vars/all/vault.yml

[group('pubnix')]
pubnix-molecule-test role:
    #!/usr/bin/env bash
    set -euo pipefail
    cd {{ pubnix_root }}
    ANSIBLE_LIBRARY=$(uv run python3 -c "import molecule_plugins, os; print(os.path.dirname(molecule_plugins.__file__) + '/vagrant/modules')")
    cd ansible/roles/{{ role }}
    ANSIBLE_LIBRARY="$ANSIBLE_LIBRARY" uv run molecule test

[group('pubnix')]
pubnix-molecule-converge role:
    #!/usr/bin/env bash
    set -euo pipefail
    cd {{ pubnix_root }}
    ANSIBLE_LIBRARY=$(uv run python3 -c "import molecule_plugins, os; print(os.path.dirname(molecule_plugins.__file__) + '/vagrant/modules')")
    cd ansible/roles/{{ role }}
    ANSIBLE_LIBRARY="$ANSIBLE_LIBRARY" uv run molecule converge

[group('pubnix')]
pubnix-molecule-verify role:
    #!/usr/bin/env bash
    set -euo pipefail
    cd {{ pubnix_root }}
    ANSIBLE_LIBRARY=$(uv run python3 -c "import molecule_plugins, os; print(os.path.dirname(molecule_plugins.__file__) + '/vagrant/modules')")
    cd ansible/roles/{{ role }}
    ANSIBLE_LIBRARY="$ANSIBLE_LIBRARY" uv run molecule verify

[group('pubnix')]
pubnix-molecule-destroy role:
    #!/usr/bin/env bash
    set -euo pipefail
    cd {{ pubnix_root }}
    ANSIBLE_LIBRARY=$(uv run python3 -c "import molecule_plugins, os; print(os.path.dirname(molecule_plugins.__file__) + '/vagrant/modules')")
    cd ansible/roles/{{ role }}
    ANSIBLE_LIBRARY="$ANSIBLE_LIBRARY" uv run molecule destroy

[group('pubnix')]
pubnix-tf-init:
    cd {{ pubnix_terraform }} && terraform init

[group('pubnix')]
pubnix-tf-plan:
    cd {{ pubnix_terraform }} && terraform plan

[group('pubnix')]
pubnix-tf-apply:
    cd {{ pubnix_terraform }} && terraform apply

[group('pubnix')]
pubnix-dev-up:
    cd {{ pubnix_root }} && vagrant up

[group('pubnix')]
pubnix-dev-down:
    cd {{ pubnix_root }} && vagrant halt

[group('pubnix')]
pubnix-lint:
    cd {{ pubnix_root }} && uvx pre-commit run --all-files
    cd {{ pubnix_ansible }} && uv run ansible-lint
