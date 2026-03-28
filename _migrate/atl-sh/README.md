# atl.sh

**atl.sh** is a public Unix environment (pubnix) for the [All Things Linux](https://allthingslinux.org) community. Get a shell account, host a personal website, and connect with others on a shared server.

---

## Quick Links

| For users | For admins |
|-----------|------------|
| [Get an account](https://portal.allthingslinux.org) | [Admin Guide](https://docs.atl.sh/admin-guide) |
| [User Guide](https://docs.atl.sh/user-guide) | [Operations](https://docs.atl.sh/operations) |
| [FAQ](https://docs.atl.sh/faq) | [Testing Guide](https://docs.atl.sh/testing) |
| [Documentation](https://docs.atl.sh) | [Code of Conduct](https://docs.atl.sh/code-of-conduct) |

---

## Features

### Shell & Development

- **SSH access** on ports 22 and 2222 (key-only, passwords disabled)
- **Shells**: bash, zsh, fish, mksh, tcsh, ksh93, rc, elvish, nushell, dash
- **Editors**: vim, neovim, nano, emacs, micro, joe
- **Languages**: Python, Node.js, Go, Rust, Ruby, C/C++, Haskell, Elixir, Java, and 20+ more
- **Tools**: tmux, git, ripgrep, fzf, jq, bat, eza, lazygit, and many more
- **Networking**: gping, trippy, xh, drill, prettyping, fping, sipcalc, termshark, speedtest-cli, rclone, and more
- **Package managers**: pip/pipx/uv, npm/pnpm, cargo, gem, go install — install to `~/.local/`

### Hosting & Protocols

- **Web**: Static sites at `https://atl.sh/~username` with CGI support
- **Gemini**: Capsules at `gemini://atl.sh/~username`
- **Gopher**: Holes at `gopher://atl.sh/~username`
- **FTP/S**: Explicit FTP over TLS (port 21); SFTP via SSH
- **Finger**: Profiles at `finger username@atl.sh` via `~/.plan` and `~/.project`

### Community

- **Social commands**: `menu` (interactive guide), `online`, `community`, `plan`, `lastplan`
- **Webring**: Self-managing ring of member sites — join with `touch ~/.ring`
- **Games**: NetHack with shared high scores, botany virtual plant, angband, crawl, and arcade games
- **Messaging**: `talk`, `wall` for real-time user-to-user communication
- **Dictionary**: `dict` — offline lookups across 7 databases (English, WordNet, Jargon File, FOLDOC, acronyms, and more)
- **IRC**: `#support` on `irc.atl.chat` (port 6697, SSL)

### Resource Limits (per user)

| Resource | Limit |
|----------|-------|
| Disk | 5 GB soft / 6 GB hard |
| RAM | 1.5 GB |
| CPU | 200% (2 cores) |
| Processes | 200 |

---

## Tech Stack

| Component | Technology |
|:----------|:-----------|
| OS | Debian 13 (Trixie) |
| Configuration | Ansible |
| Infrastructure | Terraform (Hetzner Cloud, Cloudflare) |
| Web server | Nginx + fcgiwrap |
| Gemini | molly-brown |
| Gopher | Gophernicus |
| Finger | efingerd (systemd socket-activated) |
| Dictionary | dictd (RFC 2229) |
| FTP | vsftpd |
| Backups | Borgmatic (BorgBackup) |
| Monitoring | Prometheus Node Exporter, smartmontools, lm-sensors |
| Security | UFW, Fail2ban, Auditd, AIDE, unattended-upgrades |
| Docs | Fumadocs (Next.js, deployed to Cloudflare Workers) |

---

## Security

- **CIS hardening**: kernel parameters (ASLR, ptrace restrictions), network protections, module blacklisting
- **SSH**: key-only auth, ports 22 + 2222, max 3 auth attempts, allowed groups enforced
- **Fail2ban**: 1-hour bans after 5 failures in 10 minutes
- **Firewall**: UFW with allowlist — only necessary ports open
- **AIDE**: file integrity monitoring, daily checks at 05:00 UTC
- **Auditd**: 40+ rules covering identity files, privilege escalation, suspicious tools, and syscalls
- **Resource isolation**: systemd cgroup v2 user slices per user
- **Private `/tmp`**: `pam_namespace` polyinstantiation — each session gets an isolated tmpdir
- **Automatic updates**: unattended security upgrades

---

## Development

This project uses [just](https://github.com/casey/just) as a task runner. Run `just` to list all commands.

### Prerequisites

- [Ansible](https://docs.ansible.com/)
- [just](https://github.com/casey/just)
- [Vagrant](https://www.vagrantup.com/) + [vagrant-libvirt](https://github.com/vagrant-libvirt) (for local dev)
- [Terraform](https://www.terraform.io/) 1.8+ (for infrastructure)

```bash
just install   # install Ansible roles and collections
```

### Environments

| Target | Description |
|--------|-------------|
| `dev` | Local Vagrant VM (port 2223) |
| `staging` | Hetzner Cloud VPS |
| `prod` | Physical Hetzner server |

### Local Development

```bash
just dev-up          # start Vagrant VM
just deploy dev      # run Ansible against dev VM

# SSH into dev VM
ssh -p 2223 -i .ssh/dev_key root@127.0.0.1
```

Requires `.ssh/dev_key` and `.ssh/dev_key.pub` — see [docs/testing.md](docs/testing.md) for setup.

### Deployment

```bash
# Infrastructure
just tf-init
just tf-apply

# Configuration
just deploy prod

# Selective deploy by role tag
just deploy-tag prod infra
just deploy-tag prod services

# User management
just create-user <username> '<ssh-ed25519 AAAA...>' prod
just remove-user <username> prod
```

### Repository layout

| Path | Contents |
|------|----------|
| `ansible/` | Playbooks, inventory, and roles (see table below) |
| `terraform/` | Hetzner Cloud + Cloudflare for staging; details in [terraform/README.md](terraform/README.md) |
| `docs/` | Fumadocs site source for [docs.atl.sh](https://docs.atl.sh) |
| `skel/` | Templates for new user home directories; see [skel/README.md](skel/README.md) |

### Ansible Roles

Roles run in the order defined in [`ansible/site.yml`](ansible/site.yml):

| Role | Purpose |
|------|---------|
| `common` | Apt cache, base packages, NTP, journald, shared logrotate |
| `packages` | Shells, languages, editors, multiplexers, CLI tools, games, and related packages |
| `security` | Kernel and auth hardening, SSH, firewall, fail2ban, auditd, AIDE, unattended upgrades |
| `users` | Skel files, MOTD, PAM limits, social commands (`menu`, `plan`, `online`, `community`) |
| `environment` | Cgroup limits, disk quotas, private `/tmp`, XDG dirs, PATH |
| `services` | Nginx, Gemini, Gopher, finger, dictd, games, webring |
| `ftp` | vsftpd (FTP/S) |
| `monitoring` | Prometheus node exporter, smartmontools, lm-sensors |
| `backup` | Borgmatic / BorgBackup |

### Extra `just` commands

| Command | Use |
|---------|-----|
| `just smoke-test <target>` | End-to-end test: creates temp user, validates all services, cleans up |
| `just deploy-check <target>` | Ansible in check mode (no changes) |
| `just deploy-list-tags` | Tags you can pass to `deploy-tag` |
| `just vault-edit` | Edit encrypted `ansible/inventory/group_vars/all/vault.yml` |
| `just molecule-test <role>` | Full Molecule lifecycle for a role under `ansible/roles/` |

### Linting

```bash
pre-commit install
just lint          # runs pre-commit, ansible-lint, terraform fmt/validate
just syntax-check  # ansible playbook syntax check only
```

---

## Documentation

Full documentation is at **[docs.atl.sh](https://docs.atl.sh)**, built with Fumadocs and deployed to Cloudflare Workers from the `docs/` directory.

---

## Contributing

Source and issue tracker: **[github.com/allthingslinux/atl.sh](https://github.com/allthingslinux/atl.sh)**. Pull requests and bug reports are welcome.

---

## License

[GNU GPL-3.0](LICENSE)
