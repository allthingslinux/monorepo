# AGENTS.md

atl.sh is a public Unix environment (pubnix) for the All Things Linux community: shell accounts, personal sites (HTTP, Gemini, Gopher), finger, FTP, and IRC. The stack is Debian 13 (Trixie), Ansible for configuration, and Terraform for staging infrastructure.

## Quick reference

| Command | Purpose |
|---------|---------|
| `just` | List all tasks |
| `just deploy dev` | Full Ansible run on the dev VM |
| `just deploy-tag <env> <role>` | Run a single role (e.g. `just deploy-tag prod services`) |
| `just create-user <name> '<ssh-ed25519 …>' <env>` / `just remove-user <name> <env>` | User lifecycle |
| `just lint` | pre-commit, then ansible-lint |
| `just syntax-check` | Ansible syntax-check only |
| `just molecule-test <role>` | Molecule lifecycle for a role |
| `just smoke-test <target>` | End-to-end test: creates temp user, validates all services, cleans up |

## Detailed instructions

- [Ansible conventions and role order](.claude/ansible.md)
- [Repository layout and tech stack](.claude/repository.md)
- [Environments and sensitive files](.claude/environments.md)
- [Testing and local dev](.claude/testing.md)
