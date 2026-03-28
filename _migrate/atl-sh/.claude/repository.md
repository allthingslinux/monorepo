# Repository layout and tech stack

## Layout

```
ansible/           Playbooks, inventory, roles, and ansible.cfg
ansible/site.yml   Main playbook — roles run in order listed here
ansible/roles/     9 roles: common, packages, security, users, environment, services, ftp, monitoring, backup
ansible/playbooks/ Standalone playbooks (create-user.yml, remove-user.yml)
ansible/inventory/ hosts.yml (dev/staging/prod), group_vars/
terraform/         Hetzner Cloud + Cloudflare (staging infra)
docs/              Fumadocs site (Next.js, deployed to Cloudflare Workers)
skel/              Template files copied to new user home directories
justfile           Task runner — run `just` to list all commands
```

## Tech stack

| Component | Technology |
|-----------|------------|
| OS | Debian 13 (Trixie) |
| Config management | Ansible (ansible-core 2.20+) |
| Infrastructure | Terraform (Hetzner Cloud, Cloudflare) |
| Web server | Nginx + fcgiwrap |
| Gemini | molly-brown |
| Gopher | Gophernicus |
| Finger | efingerd (systemd socket-activated) |
| FTP | vsftpd |
| Backups | Borgmatic (BorgBackup) |
| Monitoring | Prometheus Node Exporter |
| Docs | Fumadocs (Next.js → Cloudflare Workers) |
