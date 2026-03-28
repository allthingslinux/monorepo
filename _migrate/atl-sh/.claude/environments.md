# Environments and sensitive files

## SSH targets

| Target | Description | SSH |
|--------|-------------|-----|
| `dev` | Local Vagrant VM (libvirt) | `ssh -p 2223 -i .ssh/dev_key root@127.0.0.1` |
| `staging` | Hetzner Cloud VPS (Terraform-managed) | `ssh root@staging.atl.sh` |
| `prod` | Physical Hetzner dedicated server | `ssh root@atl.sh` |

## Do not commit

- `ansible/inventory/group_vars/all/vault.yml` — Ansible Vault (encrypted secrets)
- `terraform/terraform.tfvars` — Terraform variables with API tokens
- `.ssh/dev_key` / `.ssh/dev_key.pub` — Dev VM SSH keys

These paths are listed in `.gitignore`.
