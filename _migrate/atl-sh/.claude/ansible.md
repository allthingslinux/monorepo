# Ansible guidelines

## Conventions

- All tasks use fully qualified collection names (`ansible.builtin.*`, `community.general.*`, `ansible.posix.*`).
- Handler names are capitalized (e.g., `Restart sshd`, `Reload nginx`).
- Variables are defined in `group_vars/all/` — secrets live in `vault.yml` (encrypted; edit with `just vault-edit`).
- Galaxy roles and collections are declared in `ansible/requirements.yml` and installed to `.ansible/` (gitignored).
- The `.ansible-lint` config uses `offline: true` and skips `var-naming[no-role-prefix]` and `name[casing]`.

## Role order

Roles run in this order (`ansible/site.yml`):

1. **common** — apt cache, base packages, NTP, journald, logrotate
2. **packages** — shells, languages, editors, CLI tools, games packages
3. **security** — kernel hardening, SSH, firewall, fail2ban, auditd, AIDE, unattended-upgrades
4. **users** — skel files, MOTD, PAM limits, systemd user slices
5. **environment** — cgroup limits, disk quotas, private `/tmp`, XDG dirs, PATH
6. **services** — nginx, Gemini (molly-brown), Gopher (gophernicus), finger (efingerd), webring, games
7. **ftp** — vsftpd (explicit FTP over TLS)
8. **monitoring** — Prometheus node exporter, smartmontools, lm-sensors
9. **backup** — borgmatic (BorgBackup)

## Linting note

ansible-lint runs outside of pre-commit due to known hangs with pre-commit 4.x and ansible-lint v26. `just lint` runs pre-commit first, then ansible-lint as a separate step.
