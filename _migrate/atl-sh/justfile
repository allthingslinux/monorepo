# atl.sh — just recipes
# Run `just` to list available commands

# List all available recipes
default:
    @just --list

# Roles: .ansible/roles/; Collections: .ansible/collections/ansible_collections/

[private]
_ansible := justfile_directory() + "/.ansible"
[private]
_ansible_dir := justfile_directory() + "/ansible"
[private]
_molecule_lib := `python3 -c "import molecule_plugins, os; print(os.path.dirname(molecule_plugins.__file__))"` + "/vagrant/modules"

# Install Ansible collections and roles (run before first deploy or when requirements.yml changes)
install:
    cd {{ _ansible_dir }} && ansible-galaxy role install -r requirements.yml -p {{ _ansible }}/roles --force
    cd {{ _ansible_dir }} && ansible-galaxy collection install -r requirements.yml -p {{ _ansible }}/collections --force

# Deploy dry run (check mode; no changes)
deploy-check target:
    cd ansible && ansible-playbook site.yml -l "{{ target }}" --check --diff

# List available tags for selective deploy
deploy-list-tags:
    cd ansible && ansible-playbook site.yml --list-tags

# List tasks that would run (target: dev, staging, prod)
deploy-list-tasks target:
    cd ansible && ansible-playbook site.yml -l "{{ target }}" --list-tasks

# Test SSH connectivity to target
ping target:
    cd ansible && ansible "{{ target }}" -m ping

# Validate playbook syntax
syntax-check:
    cd ansible && ansible-playbook site.yml --syntax-check

# List inventory hosts (target: all, dev, staging, prod)
inventory-list target="all":
    cd ansible && ansible-inventory -l "{{ target }}" --list

# Show inventory as graph
inventory-graph:
    cd ansible && ansible-inventory --graph

# Look up Ansible module docs (e.g. just ansible-doc copy)
ansible-doc module:
    ansible-doc "{{ module }}"

# Show effective Ansible config
config-dump:
    cd ansible && ansible-config dump

# Terraform — initialize backend and providers
tf-init:
    cd terraform && terraform init

# Terraform — show planned changes
tf-plan:
    cd terraform && terraform plan

# Terraform — apply changes to infrastructure
tf-apply:
    cd terraform && terraform apply

# Deploy: dev (Vagrant VM), staging (Hetzner VPS), prod (physical)
deploy target:
    cd ansible && ansible-playbook site.yml -l "{{ target }}"

# Deploy specific roles by tag (e.g. common,packages,users)
deploy-tag target tag:
    cd ansible && ansible-playbook site.yml -l "{{ target }}" --tags "{{ tag }}"

# Create pubnix user account (target: staging or prod)
create-user username key target:
    cd ansible && ansible-playbook playbooks/create-user.yml -e "username={{ username }}" -e "ssh_public_key='{{ key }}'" -e "target_hosts={{ target }}"

# Remove pubnix user account (target: staging or prod)
remove-user username target:
    cd ansible && ansible-playbook playbooks/remove-user.yml -e "username={{ username }}" -e "target_hosts={{ target }}"

# Verify dev prerequisites (.ssh/dev_key, .ssh/dev_key.pub) before dev-up
dev-check:
    #!/usr/bin/env bash
    if [ ! -f .ssh/dev_key ] || [ ! -f .ssh/dev_key.pub ]; then
        echo "Missing .ssh/dev_key or .ssh/dev_key.pub"
        echo "Create with: mkdir -p .ssh && ssh-keygen -f .ssh/dev_key -t ed25519 -N \"\""
        exit 1
    fi
    echo "Dev prerequisites OK"

# Development environment (Vagrant + libvirt; requires .ssh/dev_key.pub)
dev-up:
    just dev-check
    VAGRANT_DEFAULT_PROVIDER=libvirt vagrant up

# Halt dev VM
dev-down:
    vagrant halt

# Run pre-commit hooks on all files
lint:
    pre-commit run --all-files
    ansible-lint

# Edit Ansible vault (secrets)
vault-edit:
    ansible-vault edit ansible/inventory/group_vars/all/vault.yml

# Run full molecule test lifecycle for a role (create → converge → verify → destroy)
molecule-test role:
    cd ansible/roles/{{ role }} && ANSIBLE_LIBRARY={{ _molecule_lib }} uv run molecule test

# Run molecule converge only (applies the role, keeps instance running)
molecule-converge role:
    cd ansible/roles/{{ role }} && ANSIBLE_LIBRARY={{ _molecule_lib }} uv run molecule converge

# Run molecule verify only (runs verify.yml against existing instance)
molecule-verify role:
    cd ansible/roles/{{ role }} && ANSIBLE_LIBRARY={{ _molecule_lib }} uv run molecule verify

# Destroy molecule instance for a role
molecule-destroy role:
    cd ansible/roles/{{ role }} && ANSIBLE_LIBRARY={{ _molecule_lib }} uv run molecule destroy

# Run end-to-end smoke test (creates temp user, validates all services, cleans up)
smoke-test target="dev":
    cd ansible && ansible-playbook playbooks/smoke-test.yml -e "target_hosts={{ target }}"

# SSH into molecule instance for a role
molecule-login role:
    cd ansible/roles/{{ role }} && ANSIBLE_LIBRARY={{ _molecule_lib }} uv run molecule login
