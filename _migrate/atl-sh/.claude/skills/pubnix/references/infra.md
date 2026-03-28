# Infrastructure Deep Reference

## Provisioning Tools

### Ansible (recommended)

dimension.sh's `infra/` repo is the reference implementation. Study it.

### Core Roles

```
ansible/roles/
├── common        ← base packages, timezone, NTP (chrony), system users
├── ssh           ← sshd hardening, fail2ban, key-only auth
├── www           ← Nginx config, user vhosts, ~/public_html
├── mail          ← Postfix (SMTP) + Dovecot (IMAP)
├── certbot       ← Let's Encrypt TLS, auto-renewal
├── gemini        ← Molly-Brown server
├── gopher        ← Gophernicus server
├── finger        ← efingerd
├── borgmatic     ← Borg backups (daily snapshots, offsite)
└── cis           ← CIS Level 1 security baseline subset
```

### Meta Roles (dimension.sh pattern)

```
├── build         ← applies: common, ssh, certbot
├── dev           ← applies: build + development tools
├── mail          ← applies: build + mail stack
├── services      ← applies: build + www + gemini + gopher
└── shell         ← applies: build + shell environment setup
```

### Secrets Management

Use Ansible vault. Never plaintext in repos.

```bash
# Create vault-encrypted variable file
ansible-vault create group_vars/all/vault.yml

# Edit encrypted file
ansible-vault edit group_vars/all/vault.yml

# Run playbook with vault
ansible-playbook site.yml --ask-vault-pass
# or with vault password file (CI/CD):
ansible-playbook site.yml --vault-password-file ~/.vault_pass
```

### Project Segfault Patterns (ansible/ repo)

- Geographic node distribution with geo-DNS
- Docker + Caddy for service deployment
- Tor onion service configs included
- Automated restarts for unstable services (systemd `Restart=always`)
- Privacy frontends hosted alongside shell services

### Puppet Alternative

tilde.town's founder (~vilmibm/nathanielksmith) published a Puppet module for bootstrapping a tilde server: `github.com/nathanielksmith/puppet-tilde`. Fallen into some disrepair but useful as a reference for the configuration surface area of a basic tilde. If you're already a Puppet shop, start here rather than scratch. For new tildes, Ansible is better-maintained in the tilde community.

### Reference Documentation

tilde.club maintains open documentation of their setup: `github.com/tildeclub/tilde.club`. Good reference for the minimum viable tilde config.

---

## User Management

### mkuser (dimension.sh pattern)

Simple CLI, 3 arguments:

```bash
mkuser <username> <email> "<ssh-pubkey>"
```

**Internals:**
- Calls system `useradd` with configured defaults
- Sets up `~/.ssh/authorized_keys` from pubkey argument
- Sends welcome email via Python `string.Template`
- Runs hooks: `/etc/mkuser/pre.d/` (before) and `/etc/mkuser/post.d/` (after)

**Hook examples:**
```
/etc/mkuser/post.d/
├── 10-create-public-html    ← mkdir ~/public_html, copy index.html
├── 20-set-quota             ← set disk quota for new user
├── 30-send-welcome-email    ← render and send welcome template
└── 40-add-to-groups         ← add to appropriate groups
```

**vern.cc pattern**: All mkuser scripts public on git.vern.cc — start from there rather than scratch.

### Admin Accounting Commands (multi-user operations)

Practical commands for understanding usage on a shared system:

```bash
# Cumulative login time per user (reads /var/log/wtmp)
users | tr ' ' '\n' | sort -u | while read -r user; do
  ac "$user" | awk -v u="$user" '{print $1, u}'
done | sort -n

# Who is currently online
who
who | awk '{print $1}' | sort -u   # usernames only

# Most recent login for each user (find dormant accounts)
lastlog

# Total command usage summary (requires process accounting enabled)
sa
```

**Notes**: `ac` depends on log retention — log rotation can make totals look low. `sa` requires process accounting to be configured first (`apt install acct`); if it has no data, process accounting is likely not enabled.

### adduser.local (Debian built-in hook)

Debian's `adduser(8)` supports an optional `/usr/local/sbin/adduser.local` script that runs automatically after every new user is created. If you're on Debian and want simple post-creation hooks without writing a full `mkuser` replacement:

```bash
# /usr/local/sbin/adduser.local
#!/bin/bash
USER=$1
# Create public_html, set permissions, copy skel extras, etc.
mkdir -p /home/$USER/public_html
cp /etc/skel/public_html/index.html /home/$USER/public_html/
chown -R $USER:$USER /home/$USER/public_html
```

This is a practical shortcut for small tildes — no need for a full mkuser CLI if your user creation process is simple. From chunboan.zone's experience: this made a custom SUID program entirely obsolete.

### Debian Local Mail (no Postfix required for basics)

Debian includes a local-only mail system out of the box. For internal admin notifications and basic inter-user messaging, you just need to install a mail client:

```bash
apt install alpine    # or neomutt
# Local mail works immediately — no SMTP configuration
```

`/etc/skel` can include a `.muttrc` or `.alpinerc`. Upgrade to full Postfix+Dovecot only when you need external email (user@yourtilde.sh addresses).

### setcap for Low Port Binding

When you need a service to bind to ports below 1024 (e.g., Gopher on port 70, Gemini on port 1965) without running as root, use `setcap` instead of SUID:

```bash
# Allow binary to bind privileged ports without root
setcap 'cap_net_bind_service=+ep' /usr/bin/writefreely

# Note: must re-run after every binary update
# Add to a post-update hook or deployment script
```

Safer than SUID — grants only the specific capability needed rather than full root. Also avoids running the service daemon as root.

### tilde.team makeuser pattern

Different from dimension.sh's CLI approach — a web form → file → shell execution pipeline:

```
1. PHP form on site validates input + SSH key
2. Appends the makeuser command (with args) to a file on disk
3. Emails admin team with signup notification
4. Admin reviews file, comments out suspicious entries
5. Admin executes the signups file as a shell script
   (each line is a valid makeuser invocation)
```

Benefits: human review before account creation, easy to comment out suspicious signups, audit trail on disk. The "execute file as shell script" pattern means no special admin UI is needed — just a text editor and a shell.

Repos: tildegit.org/team/site/src/branch/master/signup and tildegit.org/team/makeuser

### tilde-launcher (user program sharing)

A small tool for community software discovery. The `tilde` command lets any user submit their own programs for others to find and run:

```bash
tilde submit myprogram    # share a program with the community
tilde list                # browse what others have submitted
tilde run username/prog   # run a community program
```

Creates a lightweight "app store" inside the shell, encouraging users to share scripts and tools. Repo: tildegit.org/team/tilde-launcher

### Skeleton Files (/etc/skel)

Everything in `/etc/skel` is copied verbatim to every new user's home directory at account creation.

```
/etc/skel/
├── .bashrc              ← shell config with tilde-specific aliases/motd
├── .bash_profile        ← login config
├── .bash_logout         ← cleanup on logout
├── .zshrc               ← ZSH config (if offering ZSH)
├── .zprofile
├── .mkshrc              ← MKsh support
├── .profile
├── .byobu/              ← pre-configured byobu (tmux frontend) settings
├── .irssi/              ← irssi IRC client config + server presets
├── .tmux.conf           ← sensible tmux defaults
├── .new_user            ← empty marker file (scripts detect first login)
├── .ssh/
│   └── authorized_keys  ← empty placeholder (correct perms set by mkuser)
├── sieve/               ← email filtering rules (Dovecot Sieve)
│   └── rainloop.user.sieve
├── .dovecot.sieve -> sieve/rainloop.user.sieve  ← symlink for Dovecot
├── public_html/
│   └── index.html       ← default "under construction" page
├── public_gemini/
│   └── index.gmi        ← default capsule index
├── public_gopher/
│   └── gophermap        ← default gopherhole menu
└── README.md            ← welcome message explaining the system
```

**Key patterns from tilde.club's real skel:**
- `.new_user` empty marker file — allows login scripts to detect first-ever login and run onboarding flows
- `.dovecot.sieve` symlink → `sieve/rainloop.user.sieve` — gives every user email filtering out of the box (Dovecot Sieve rules)
- `.byobu/` with pre-configured backend + keybindings — users get sensible byobu without any setup
- `.irssi/config` with tilde's IRC server pre-populated — users can just type `irssi` and connect

**Good .bashrc additions for a tilde:**
```bash
# Tilde-specific aliases
alias users='who | sort | uniq'
alias chat='irc'  # or weechat, etc.

# Show MOTD on login
cat /etc/motd

# Friendly PATH additions
export PATH="$HOME/.local/bin:$HOME/bin:$PATH"
```

**Good default index.html:**
Simple, friendly, links to the tilde's main page. Not blank — blank is confusing for new users.

---

## SSH Hardening

### Multiple SSH Ports

Expose SSH on a second port (e.g., 2222) in addition to 22. Users on restrictive corporate/school networks that block 22 can still connect. envs.net pattern: ports 22 and 2222 both available. Add to sshd_config: `Port 22` and `Port 2222`.

### SSHFP DNS Records

Publish SSH fingerprints in DNS (SSHFP records). Lets users verify host identity without trusting the TOFU prompt — if their SSH client has DNSSEC and `VerifyHostKeyDNS yes` in `~/.ssh/config`, the key fingerprint is checked against DNS automatically. Add to your zone file:

```bash
# Generate SSHFP records from your server
ssh-keygen -r your.tilde.sh
# Output: SSHFP records ready to paste into your DNS zone
```

Publish these prominently in your server info page so users can verify manually too.

### sshd_config essentials

```
# Authentication
PasswordAuthentication no
PubkeyAuthentication yes
PermitRootLogin no
PermitEmptyPasswords no

# Sessions
MaxAuthTries 3
LoginGraceTime 30
ClientAliveInterval 300
ClientAliveCountMax 2

# Restriction
AllowGroups sshusers
X11Forwarding no
AllowTcpForwarding no   # unless users need port forwarding

# Logging
LogLevel VERBOSE
```

### MFA for SSH (google-authenticator)

For users who want extra security, offer TOTP-based MFA via `libpam-google-authenticator`. blinkenshell's model: MFA is optional, and only triggers from previously unseen IPs — trusted IPs (logged in within the last 14 days) bypass the OTP step.

```bash
apt install libpam-google-authenticator

# User runs to set up their TOTP seed:
google-authenticator   # generates QR code for Authy/Google Auth/etc.

# /etc/pam.d/sshd — add before auth includes:
auth required pam_google_authenticator.so nullok

# /etc/ssh/sshd_config:
ChallengeResponseAuthentication yes
```

**Admin workflow**: Add users to an MFA group rather than enabling globally. Test from a new IP before assuming it works. Compatible with Authy, Google Authenticator, and any TOTP app.

**Note**: MFA + SSH keys together means users need both key and OTP. This is the highest-security configuration but adds friction. Offer it as opt-in rather than mandatory for a tilde.

### fail2ban for SSH

```ini
# /etc/fail2ban/jail.local
[sshd]
enabled = true
port = ssh
maxretry = 3
bantime = 3600
findtime = 600
```

---

## Security Hardening

### No User-Facing Ports Policy

A common and safe policy: **don't open any firewall ports for individual users**. Users can run local-only services (cron jobs, local daemons, socket servers) but nothing reachable from the internet. tilde.town's FAQ states this explicitly: "we don't open any ports for users to use; however, you can run simple services or cron jobs for local-only access."

This prevents users from accidentally (or intentionally) running public servers, reduces attack surface, and simplifies firewall management. Exceptions:
- Per-user web served via the tilde's web server (Caddy/nginx proxying to user unix sockets or directories)
- CGI scripts running under the web server's process

If you want to allow user-controlled services, consider Unix socket-based proxying through Caddy rather than opening individual ports.

### User Isolation

```bash
# Each user in their own group (useradd default)
useradd -m -s /bin/bash -U username

# Home directory permissions
chmod 750 /home/username     # user + group readable, not world
chmod 755 /home/username/public_html  # world-readable for web

# No user should have sudo
# Audit regularly:
getent group sudo
grep -E '^sudo' /etc/sudoers
```

### Resource Limits (cgroups/systemd)

Don't remove capabilities — set limits. Users need to run long processes, use tmux, compile code.

```bash
# /etc/systemd/system/user-.slice.d/limits.conf
[Slice]
CPUQuota=50%          # max 50% CPU per user
MemoryMax=512M        # max 512MB RAM per user
TasksMax=100          # max 100 processes per user
```

Or via `/etc/security/limits.conf`:
```
@users  soft  nproc   50
@users  hard  nproc   100
@users  soft  nofile  1024
@users  hard  nofile  4096
```

**Reference numbers (envs.net):** 200 processes/threads, soft 1024MB/hard 1536MB RAM, 250MB mailbox storage. A reasonable baseline for a mid-sized tilde.

### Disk Quotas

Set on day 1. Retrofitting quotas onto a full filesystem is painful.

```bash
# Enable in /etc/fstab
/dev/sda1  /home  ext4  defaults,usrquota,grpquota  0 2

# Initialize quota db
quotacheck -cug /home
quotaon /home

# Set per-user quota (e.g., 1GB soft, 1.2GB hard)
setquota -u username 1048576 1258291 0 0 /home

# Check quotas
repquota /home
```

### Tailscale / Headscale for Management Isolation

Project Segfault puts all management interfaces and server SSH behind a self-hosted Tailscale instance (Headscale). Nothing management-facing is exposed to the public internet:

```
Public internet sees:
  - SSH to pubnix (p.projectsegfau.lt:22) — for users
  - Web services (HTTPS)

Tailnet only (invisible to public):
  - SSH to all backend servers
  - Ansible/automation access
  - Admin dashboards (Ansible Semaphore, etc.)
  - Inter-node communication
```

**Headscale**: The open-source self-hosted Tailscale control plane. Run it yourself rather than depending on Tailscale's SaaS. Gives you the WireGuard mesh VPN with full control.

This pattern means even if a service has a vulnerability, it's not exploitable from the public internet — attackers would need to compromise the Tailnet first.

### Docker / Podman Service Isolation

Project Segfault runs almost all services under Docker, with a critical principle: **code execution environments are completely isolated from the shell server**.

```
Isolation boundaries:
├── pubnix shell server  ← user SSH sessions, normal shell use
├── Gitea Actions        ← CI/CD runners, completely separate VM/container
├── Docker services      ← each service in its own container
└── Ansible Semaphore    ← management automation, separate node
```

**Why this matters**: If a user escapes their shell sandbox, they shouldn't be able to affect Gitea, the wiki, or other services. Service isolation means a compromise of one service doesn't cascade.

**Podman**: Rootless container runtime — runs containers without a root daemon. Better security posture than Docker for services that don't need elevated privileges. Project Segfault's Cockpit interface exposes Podman management.

### CIS Level 1 Baseline (subset)

Key items from dimension.sh's `cis` role:
- Disable unused filesystems (cramfs, freevxfs, jffs2, hfs, hfsplus, squashfs, udf)
- Ensure `/tmp` is mounted with `noexec,nosuid,nodev`
- Disable core dumps
- Enable ASLR (`kernel.randomize_va_space = 2`)
- Configure rsyslog, ensure log rotation
- Restrict cron to authorized users
- Ensure SSH protocol 2 only
- Set password aging policies

---

## Backup with Borgmatic

```yaml
# /etc/borgmatic/config.yaml
location:
  source_directories:
    - /home
    - /etc
    - /var/mail
  repositories:
    - path: /mnt/backup/borg
    - path: user@offsite-server.example.com:backup

retention:
  keep_daily: 7
  keep_weekly: 4
  keep_monthly: 6

consistency:
  checks:
    - name: repository
    - name: archives
      frequency: 2 weeks
```

Run daily via systemd timer or cron. Test restores quarterly.

---

## Web Server (Nginx)

### Tilde URL pattern (`/~username`)

The classic tilde path style — all users on same domain, accessed via `https://example.sh/~username/`:

```nginx
# /etc/nginx/sites-available/default
server {
    listen 80;
    server_name example.sh;
    root /var/www/html;

    # Route /~username/ to /home/username/public_html/
    location ~ ^/~(.+?)(/.*)?$ {
        alias /home/$1/public_html$2;
        index index.html index.htm;
        autoindex on;   # directory listing — remove if unwanted
    }
}
```

`autoindex on` provides directory listings when there's no index.html — useful for explorability, but disable if users should control what's visible.

### Per-user vhosts pattern (subdomain style)

```nginx
# /etc/nginx/conf.d/users.conf
server {
    listen 80;
    server_name ~^(?<user>.+)\.example\.sh$;  # wildcard subdomain

    root /home/$user/public_html;
    index index.html index.htm;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

### CGI for user scripts (tilde tradition)

```nginx
location ~ \.cgi$ {
    gzip off;
    fastcgi_pass unix:/var/run/fcgiwrap.socket;
    include fastcgi_params;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
}
```

---

## Per-User Caddyfile + Unix Socket Architecture

Project Segfault's multi-user web hosting pattern — more flexible than a single global Nginx config:

```
# Each user gets ~/Caddyfile (from skel)
# User's web server listens on ~/.webserver.sock
# Master Caddy server proxies from subdomain → user socket

# ~/Caddyfile (user-editable)
http://username.p.projectsegfau.lt {
    bind unix/.webserver.sock
    root * /home/username/public_html
    file_server
    # PHP 8.2 available out of the box via php_fastcgi
}

# Additional app subdomain (wildcard *-username.domain):
http://myapp-username.p.projectsegfau.lt {
    bind unix/.webserver.sock
    reverse_proxy localhost:8080
}
```

**Useful skel aliases:**
```bash
alias rc='caddy reload --config ~/Caddyfile'    # reload caddy
alias ft='caddy fmt --overwrite ~/Caddyfile'    # format Caddyfile
alias vt='caddy validate --config ~/Caddyfile'  # validate
```

**Benefits**: Users control their own web config without touching system files; master Caddy handles TLS; unix sockets prevent port conflicts between users.

## Distributed / Multi-Node Architecture (thunix.net model)

Most tildes run on a single server. thunix.net took a more ambitious approach after their system volume corrupted: a VPN-connected network of machines where home directories are stored on a separate NFS server.

**Stack:**
- **LDAP** — centralized authentication across all nodes (users log in to any node with the same credentials)
- **NFS** — network filesystem; home directories mounted on all nodes from a central storage server
- **VPN (Wireguard/similar)** — private network connecting all nodes; services and home dirs accessible across nodes
- **Ansible** — deploys baseline config to all machines

**Why this matters:**
- If one node goes down, users can log into another
- Scale out by adding nodes without re-provisioning users
- Single home dir accessible everywhere

**Trade-offs:** NFS introduces latency for disk I/O; LDAP is a single point of authentication failure if not replicated; more operational complexity than a single server. Only pursue this if you genuinely need multi-node setup — most tildes don't.

## Nix Package Manager for Users

Letting users install software without root — Project Segfault's approach:

```bash
# User installs packages to their own profile, no sudo
nix-env -iA nixpkgs.neovim
nix-env -iA nixpkgs.python311
nix search nixpkgs ripgrep

# Installed to ~/.nix-profile/bin — no system impact
# Rollback: nix-env --rollback
```

**Why Nix**: 80k+ packages, reproducible, no root, rollback. Best-in-class for user-controlled environments on shared systems. Alternative: allow `~/.local/bin` + `pip install --user`, `cargo install` — lower barrier, less clean.

## User Profile Files (meta-info.toml)

Project Segfault's pattern for user discoverability — richer than tilde.json:

```toml
# ~/meta-info.toml (in skel, all fields optional)
fullname = "Alice Smith"
gemini = "example.sh/~alice"
website = "https://alice.example.sh"
description = "sysadmin, permacomputing enthusiast"
email = "alice@example.com"
matrix = "@alice:example.sh"
fediverse = "fosstodon.org/@alice"
location = "Portland, OR"  # NEVER full address — warn users
```

A cron job reads all users' `~/meta-info.toml`, generates an HTML user directory page and JSON API feed. The JSON endpoint enables third-party tools and aggregators to consume user data programmatically.

**Privacy default**: All fields blank by default. Users opt-in to sharing each field explicitly.

## ~/pass Onboarding Pattern

Auto-generate a password at account creation, write to `~/pass`, user discovers it on first login:

```bash
cat ~/pass   # retrieve generated password
passwd       # change it (affects shell + PAM-authed services)
```

**Two-password reality**: When using an SSO layer (Authentik, Keycloak), users may have a separate shell/PAM password vs. SSO password. Document this distinction clearly — it's the most common confusion point for new users.

**Security**: Instruct users to save the password locally and delete `~/pass`. A plaintext password sitting in the home directory is a mild but real risk.

## SSO Built Around System Accounts

tilde.team's approach: authenticate web services directly against Unix system accounts via PAM (Pluggable Authentication Modules), rather than a separate identity provider like LLDAP+Keycloak.

**System-account SSO vs LLDAP+Keycloak:**

| | PAM / system accounts | LLDAP + Keycloak |
|-|----------------------|------------------|
| Setup complexity | Low | High |
| OAuth2/OIDC support | No | Yes |
| Service compatibility | PAM-aware services only | Any OAuth2 app |
| User management | useradd/userdel | Web UI + API |
| Best for | Simple tildes, few services | Multi-service SSO |

Services with PAM support: Gitea, some Nextcloud configs, many IRC servers, Roundcube (with plugin).

## Nextcloud

Self-hosted private cloud (files, calendar, contacts, collaborative docs). Used by tilde.team as a member service. Heavier than single-purpose tools — only add once membership is stable.

**Lighter alternatives by use case:**

| Need | Lighter option |
|------|---------------|
| Collaborative docs | CryptPad (E2E encrypted), HedgeDoc (markdown) |
| File sync | Seafile |
| Paste / share | PrivateBin |

## Email Stack (Postfix + Dovecot)

### Standard Email Port Reference

| Protocol | Port | Encryption |
|----------|------|------------|
| IMAP | 143 | STARTTLS |
| IMAPS | 993 | TLS |
| POP3S | 995 | TLS |
| SMTP (submission) | 587 | STARTTLS |
| SMTPS | 465 | TLS |

Offer both 587 and 465 for SMTP submission. Many clients autoconfigure. mutt and alpine should work out of the box on the shell.

### Plus Addressing

Dovecot supports `+tag` addressing: `username+filter@yourtilde.sh` delivers to `username`'s inbox. Useful for users who want per-service email addresses and inbox filtering. No configuration needed in Dovecot — it's built in.

### Sieve Email Filtering

Dovecot supports [Sieve](http://sieve.info/) scripts for server-side mail filtering. ManageSieve protocol (port 4190) allows external clients (Thunderbird sieve add-on) to manage scripts.

- User scripts live in `~/sieve/`
- Active script: `~/.dovecot.sieve` (symlink or file)
- Put `~/.dovecot.sieve -> sieve/default.sieve` in `/etc/skel` so users start with sensible filtering

### .forward File

Users can forward all incoming mail to another address by putting the target in `~/.forward`:

```bash
echo myother@example.com > ~/.forward
```

Simple, no admin config required. Works with any Postfix/Sendmail setup.

### Email Abuse Mitigation: Block External Protocols at Firewall

Hashnix.club's hard-won lesson: repeated abuse of IMAP, POP3, and SMTP led them to **block all three at the firewall** for external connections. Result:
- Webmail (browser-based) still works
- Command-line clients (mutt, alpine) on the shell still work
- External IMAP/POP3 sync to phone/desktop apps: blocked

This is a drastic but valid option if your email service is being abused for spam or credential stuffing. Less convenient for users; significantly reduces attack surface and abuse vectors.

**Pre-configured email clients in skel**: Put a working `.muttrc` and `.pinerc` in `/etc/skel` so users have sensible defaults out of the box. Hashnix does this and provides recovery commands if users overwrite them:

```bash
# Restore default muttrc if missing
cp -p /etc/skel/.muttrc ~/

# Prepend skel defaults to existing muttrc
sed -i -e 1r/etc/skel/.muttrc ~/.muttrc
```

### DNSSEC

Enable DNSSEC on all domains. Project Segfault enables it for all their domains. Protects against DNS cache poisoning and spoofing.

```bash
# Enable DNSSEC at your registrar (most support it now)
# Verify with:
dig +dnssec your-tilde.sh SOA
# Look for "ad" flag in response = authenticated data

# Check with online tools:
# https://dnssec-analyzer.verisignlabs.com/
# https://dnsviz.net/
```

Add DNSSEC to your launch checklist — it's a registrar setting, not a server config.

### SPF / DKIM / DMARC — do before first user email

```dns
; SPF
example.sh.  TXT  "v=spf1 mx -all"

; DMARC
_dmarc.example.sh.  TXT  "v=DMARC1; p=quarantine; rua=mailto:postmaster@example.sh"
```

DKIM requires postfix-opendkim or rspamd. Set up before sending any email — retroactively fixing deliverability is hard.

---

## MOTD (Dynamic)

Ubuntu/Debian systems support dynamic MOTD scripts in `/etc/update-motd.d/`. Files are numbered (execution order) and run as scripts on login:

```
/etc/update-motd.d/
├── 00-header          ← shows "Welcome to Ubuntu..."
├── 10-help-text       ← Ubuntu help info
├── 50-motd-news       ← news feed
└── 01-custom          ← your custom script (runs first)
```

```bash
# /etc/update-motd.d/01-custom
#!/bin/sh
echo "Who is logged in?"
users | tr ' ' '\n' | uniq
```

```bash
# Enable/disable scripts by toggling executable bit
sudo chmod -x /etc/update-motd.d/50-motd-news    # disable
sudo chmod +x /etc/update-motd.d/01-custom        # enable
```

No need to delete scripts you don't want — just `chmod -x` them. `/etc/motd` (static file) is shown verbatim; dynamic scripts in `/etc/update-motd.d/` run fresh each login.

## Community Scripts (Tilde-Specific)

The shared-system nature of tildes enables creative community scripts that aren't possible on isolated hosting:

### ~/.digest pattern

Have users maintain a `~/.digest` file with daily tips, music recommendations, etc. A cron script reads all users' files and compiles them into a community webpage:

```bash
# Collect all users' .digest files into a daily page
for user in $(ls /home); do
  if [ -f "/home/$user/.digest" ]; then
    echo "=== ~$user ===" >> /tmp/digest.html
    cat "/home/$user/.digest" >> /tmp/digest.html
  fi
done
```

### Recently updated pages

Find pages modified today across user `public_html` directories — tilde.club's production script:

```bash
# HTML list of users who updated their index.html today
find /home/*/public_html -regex "/home/_?[0-9a-zA-Z]*/public_html/index.html" \
  -type f -name "index.html" -mtime 0 \
  -printf '%T@ %p %TD %Tr %TY-%Tm-%TdT%TTZ\n' 2>/dev/null | sort -r | \
  perl -CSD -pe \
  's|([0-9.]+) /home/([\p{L}\p{N}_]*?)/public_html/index.html (.*) (.*)|<li><a href="/~$2">$2</a> <time datetime="$4">$3</time></li>|'
```

For a JSON feed of recently updated pages (used by tilde.club's API):

```bash
find /home/*/public_html -regex "/home/_?[0-9a-zA-Z]*/public_html/index.html" \
  -type f -name "index.html" -mtime 0 \
  -printf '%T@ %p %TD %Tr %TY-%Tm-%TdT%TTZ\n' 2>/dev/null | sort -r | \
  perl -CSD -pe \
  'BEGIN { print "{ \"pagelist\": [\n"; }; END { print "] }\n"; };
   if ($i > 0) { print ", "; };
   s|([0-9.]+) /home/([\p{L}\p{N}_]*?)/public_html/index.html (.*) (.*)|{ "username": "$2", "homepage": "/~$2/", "modtime": "$4" }|; $i++'
```

Key flags: `-mtime 0` = modified today; `-regex` with character class `[0-9a-zA-Z]` validates usernames; `-printf` extracts modification time in multiple formats.

Automate with cron to publish a "recent changes" index page. Note: cron jobs mail their output to the local user — another reason to have local mail configured.

### Early tilde.club community creations (patterns worth replicating)

When tilde.club launched in 2014, users immediately built community infrastructure that has since become tilde tradition:

- **24h updated pages list** (~delfuego) — find recently-modified user pages, publish as community index
- **Disk usage tracker** (~pfhawkins) — shows who's using too much space, public accountability
- **Social network graph** (~jr) — visualize who links to whom across user pages
- **Who is online** (~jon) — live page showing logged-in users
- **Webring** (~harper) — circular link chain connecting all user sites

These emerged organically within days of launch. Have your /etc/skel and community scripts ready to inspire similar creations.

### User Daemons with systemd user units

Users often want long-running processes (bots, personal servers, persistent scripts) without relying on tmux/screen. systemd user units + `loginctl enable-linger` is the clean solution:

```bash
# User creates ~/.config/systemd/user/mybot.service
[Unit]
Description=My IRC bot

[Service]
ExecStart=/home/user/mybot/run.sh
Restart=on-failure

[Install]
WantedBy=default.target
```

```bash
# User enables and starts it
systemctl --user enable --now mybot.service

# Admin enables linger so unit survives logout (one-time, per user)
loginctl enable-linger username
```

**Key detail**: Without `loginctl enable-linger`, user units stop when the user logs out. With linger enabled, units persist. Admins can pre-enable linger for all users or let users request it. Document this clearly — it's one of the most useful things a tilde can offer beyond basic shell access.

### CGI Help Ticket System

tilde.town runs a CGI-based help ticket system at `cgi.tilde.town/help/tickets` — a simple web form where users submit support requests without needing email or IRC. For small tildes a ticket system is overkill, but for any tilde with 100+ users or a non-technical userbase, CGI-based tickets reduce admin overhead. Alternatives: a `help@` email alias, a `#help` IRC channel, or a web form that emails the admin.

### SSH Audit Log

Check SSH login attempts:

```bash
grep ssh /var/log/auth.log | less
```

Useful for spotting brute force attempts before fail2ban handles them, and for auditing who's logging in when.

## Monitoring

**Minimum viable monitoring:**
- Uptime check (UptimeRobot free tier, or self-hosted)
- Disk space alert (cron job emailing admin when >80% full)
- Failed login attempts (fail2ban logs)

**Extended:**
- vnstat (bandwidth monitoring)
- Netdata or Prometheus + Grafana (system metrics; node_exporter for Prometheus)
- Logwatch (daily log digest)
- pflogsumm (Postfix log summarizer — daily mail activity digest; `apt install pflogsumm`)
- pubnix-domain-watcher (shell scripts for monitoring cert expiry and DANE/TLSA records)

**Admin notifications via Shoutrrr:**
Rather than polling logs, use [Shoutrrr](https://containrrr.dev/shoutrrr) to push alerts to wherever you are — IRC webhooks, email, Matrix, Discord, Telegram, Slack — via one URL format:
```bash
# Example: notify on signup (from signup API)
PUBLAPI_NOTIFY_SHOUTRRRURL="slack://token@channel"
# Or email:
PUBLAPI_NOTIFY_SHOUTRRRURL="smtp://user:pass@host:587/?from=admin@tilde&to=admin@tilde"
```
Used by Project Segfault's publapi signup system. Any event that should notify admin (new user, disk full, service down) can pipe to Shoutrrr.

---

## IRC Server (Running Your Own)

If you want to run your own IRC server on the tilde rather than pointing users at tilde.chat:

### charybdis

Available in Debian/Ubuntu package repos — no compile-from-source required:

```bash
apt install charybdis
charybdis-genssl   # generate SSL certs (set CN to your hostname)
```

Key `/etc/charybdis/ircd.conf` settings:
- `name`: your IRC server FQDN (match SSL cert CN)
- `sid`: unique 2-digit + 1-char identifier (e.g., `0AT`)
- `sslport`: 6697 (standard IRC SSL)
- `port`: 6667 (standard IRC plaintext)
- `hub`: `yes` if allowing server-to-server connections

**Note**: charybdis and ngircd may not interconnect server-to-server — if peering with another tilde's IRC, verify compatibility first.

**Isolation pattern** (tilde.club): run the IRC server on a separate machine from the shell server. EC2 security group allows TCP/6667 and TCP/6697 from shell server only, TCP/113 (identd) from IRC server to shell server.

**Newnet** (irc.newnet.net, port 6697 SSL): an existing IRC network some tildes use rather than self-hosting.

---

## Operational Lessons (Hard-Won)

### The One SSH Rule (Prevents Most Lockouts)

> Never close your current SSH session until you have confirmed a **new** SSH session works with your latest config changes.

This single habit prevents almost all accidental lockouts. Applies to every sshd_config change, firewall rule change, and PAM modification. Open a second terminal, confirm login works, then close the first.

### ISP Can Pull Your Plug (SDF 2003 Lesson)

SDF was co-located at NWLINK when a DDoS attack hit their server. NWLINK terminated SDF's contract immediately — without written notice, effective same day — and blacklisted them with other providers. SDF was offline for days.

**What SDF did differently after this**: They moved to Dallas, acquired their own circuits (multiple T1s they *owned* directly), so no ISP could unilaterally pull their connection.

**Lesson for tilde admins**: At small scale, you're at your hosting provider's mercy. Mitigations:
- Maintain good standing with your provider; read the ToS
- Keep emergency contact info outside your hosted email (don't use server-hosted email to log in to hosting provider)
- For large/established tildes: consider owning your upstream connection or having a pre-arranged failover

This is an edge case for most small tildes, but SDF's survival through multiple hardware failures, ISP terminations, and DDoS attacks over 35+ years offers valuable resilience lessons.

### Automation Always Beats Manual Provisioning (UUNET Pubnix Lesson)

The original commercial "Pubnix" at UUNET (early 1990s) built automated provisioning with Perl + SQL from day one. Their competitors running Windows NT-based hosting did provisioning manually. Result: the NT team had a far higher staff-to-customer ratio and was less profitable.

This lesson predates DevOps by decades and validates the modern Ansible-first approach:

> A competitor's Windows NT hosting division "had learned none of the lessons from it. Provisioning and monitoring were done manually... the staff to customer ratio for the NT service was much higher." — D-Mac's Stuff

For a tilde: every manual step that isn't automated is technical debt. Every user created by hand, every config change made without Ansible, every setting documented only in an admin's head — these compound into fragility. The community-run alternative to staff-to-customer ratio is admin burnout.

### The DDoS / Hosting Provider Incident (tilde.team post-mortem)

tilde.team's worst incident: hosting provider detected a supposed DDoS originating from the server, pulled network access. Required scrambling to coordinate and get restored.

**Two critical lessons:**

1. **Comply with your hosting provider's ToS** — read it before you need it
2. **Never use an email address hosted on your own server to log in to your hosting provider** — if your server goes down, you lose access to the email you need to recover it

Use a personal/external email (Gmail, Fastmail, Proton) for your hosting provider account. Your server email is for users, not for you to depend on operationally.

### "More Automation and Better Documentation" (~ben, tilde.team)

When asked what he'd do differently: **"More automation and better documentation."**

This is the unanimous lesson from experienced admins. Manual setup looks faster at the start, but every hour saved on documentation costs ten hours later when:
- You forget how something was configured
- A new admin needs to take over
- You need to rebuild after a failure
- You want to add a second server

The Ansible-first approach (dimension.sh, Project Segfault) isn't over-engineering — it's the only sustainable model. Start with IaC from day one, before your first user.

### Pine/Alpine .addressbook File Permissions

Pine (and Alpine) creates `.addressbook` with `744` permissions by default — world-readable. Fix this before creating any users:

1. Add `~/mail/` to `/etc/skel` with permissions `700`
2. Create `/etc/pine.conf` (or `~/.pinerc` in skel) with:
   ```
   address-book=mail/.addressbook
   ```

This moves the addressbook to `~/mail/.addressbook` which inherits the 700 directory permissions. Users won't accidentally expose their contact lists.

### Restricting Compiler Access

On a shared system, you may want to restrict who can compile code (to prevent abuse):

```bash
chmod 700 /usr/bin/gcc*
chmod 700 /usr/bin/cc*
```

This limits compilation to root and owner only. Trade-off: legitimate users who want to write C programs can't compile without being in a specific group. Less restrictive alternative: create a `compilers` group and `chmod 750 /usr/bin/gcc*` + `chown root:compilers /usr/bin/gcc*`.

**Counter-argument**: Many tildes intentionally leave compilers open — "tinkering is the point." Apply this only if you have specific abuse concerns.

### identd for IRC

When users connect from your tilde's shell to IRC servers, many IRC networks use `identd` (identity daemon) to verify the connection. Without it, users may see "ident timeout" warnings or be unable to connect:

```bash
apt install oidentd
systemctl enable --now oidentd
```

`oidentd` responds to ident queries on port 113. Configure EC2/firewall security groups to allow TCP/113 from your IRC server IPs.

### "You Cannot Force Users to Read a README" (chunboan.zone)

Despite how obvious you make the README in `/etc/skel`, users won't read it. Design your system assuming zero onboarding document readership:

- Make the default state safe and informative (MOTD, welcome email, default `index.html` with real content)
- Put the most critical info in the MOTD and welcome email — not just a file in the home directory
- Use interactive onboarding if you need users to take an action (e.g., set a password via `~/pass`)
- Accept that some friction is inevitable; reduce it through system design, not better docs
