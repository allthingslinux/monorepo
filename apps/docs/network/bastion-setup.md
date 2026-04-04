# SSH Bastion Setup

**Bastion IP:** `PUBLIC IP ADDRESS`
**Bastion Tailnet IP:** `100.64.1.1`

## Implementation

### 1. Root Access

`root` is setup to only allow specific admins for management purposes.

**/root/.ssh/authorized_keys**

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAINwyVKhwdg8dlt6PAGRl/ayGWUV7H3rfVpg1Ys8MUpV6 admin@kzn.sh
```

### 2. Jump User

Setup `jump` user for ssh jumping and ssh jumping only.
`useradd -m -s /usr/sbin/nologin jump`

### 3. SSHD Hardening

**/etc/ssh/sshd_config**

```ssh
# Basic SSH settings
Port 22
Protocol 2
AddressFamily inet

# Authentication settings
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
PasswordAuthentication no
PermitEmptyPasswords no
ChallengeResponseAuthentication no
UsePAM yes
UseDNS no
GSSAPIAuthentication no

# Root access restrictions
PermitRootLogin prohibit-password
AllowUsers root jump

# Security hardening
MaxAuthTries 3
MaxSessions 2
MaxStartups 2:30:10
LoginGraceTime 30
ClientAliveInterval 300
ClientAliveCountMax 2

# Disable dangerous features
PermitUserEnvironment no
AllowAgentForwarding no
AllowTcpForwarding no
X11Forwarding no
PermitTunnel no
GatewayPorts no
Subsystem sftp /usr/lib/openssh/sftp-server

# Crypto hardening
Ciphers chacha20-poly1305@openssh.com,aes256-gcm@openssh.com,aes128-gcm@openssh.com,aes256-ctr,aes192-ctr,aes128-ctr
MACs hmac-sha2-256-etm@openssh.com,hmac-sha2-512-etm@openssh.com,hmac-sha2-256,hmac-sha2-512
KexAlgorithms curve25519-sha256@libssh.org,diffie-hellman-group16-sha512,diffie-hellman-group18-sha512

# Logging
LogLevel VERBOSE
SyslogFacility AUTH

# Banner
Banner /etc/ssh/banner

# Match blocks for specific users
Match User root
    AllowTcpForwarding no
    AllowAgentForwarding no
    X11Forwarding no
    PermitTTY yes
    ForceCommand none

Match User jump
    AllowTcpForwarding local
    AllowAgentForwarding yes
    PermitTTY no
    X11Forwarding no
    ForceCommand /usr/local/bin/ssh-jump-wrapper
```

### 4. Jump Wrapper Script

**/usr/local/bin/ssh-jump-wrapper**

```bash
#!/bin/bash

# Allowed internal destinations
declare -A ALLOWED_HOSTS
ALLOWED_HOSTS["network"]="100.64.1.0"
### more can be inserted here as needed ###

# Log connection attempt
logger -t ssh-jump "Jump attempt from $SSH_CLIENT to $SSH_ORIGINAL_COMMAND"

# Parse SSH command
if [[ "$SSH_ORIGINAL_COMMAND" =~ ^ssh.*[[:space:]]+([^[:space:]]+@)?([^[:space:]]+) ]]; then
    TARGET="${BASH_REMATCH[2]}"

    # Check if target is allowed
    ALLOWED=false
    for host in "${!ALLOWED_HOSTS[@]}"; do
        if [[ "$TARGET" == "$host" ]] || [[ "$TARGET" == "${ALLOWED_HOSTS[$host]}" ]]; then
            ALLOWED=true
            break
        fi
    done

    if [[ "$ALLOWED" == "true" ]]; then
        exec $SSH_ORIGINAL_COMMAND
    else
        echo "Access denied: $TARGET not in allowed hosts" >&2
        logger -t ssh-jump "DENIED: Jump attempt to unauthorized host $TARGET from $SSH_CLIENT"
        exit 1
    fi
else
    echo "This account can only be used for SSH jumping to: ${!ALLOWED_HOSTS[*]}" >&2
    logger -t ssh-jump "DENIED: Invalid command from $SSH_CLIENT: $SSH_ORIGINAL_COMMAND"
    exit 1
fi
```

### 5. Banner

**/etc/ssh/banner**

```
********************************************************************
*                              WARNING                             *
********************************************************************
* This is a private system. Unauthorized access is prohibited.     *
* All activities are logged and monitored.                         *
* By connecting, you consent to monitoring and investigation.      *
********************************************************************
```

### 6. Firewall (UFW)

```
Status: active
To                         Action      From
--                         ------      ----
Anywhere on lo             ALLOW       Anywhere
22/tcp                     ALLOW       Anywhere
Anywhere (v6) on lo        ALLOW       Anywhere (v6)
22/tcp (v6)                ALLOW       Anywhere (v6)
```

### 7. Fail2Ban

**/etc/fail2ban/jail.d/sshd-custom.conf**

```ini
[sshd]
enabled = true
port = 22
filter = sshd
logpath = /var/log/auth.log
maxretry = 2
findtime = 300
bantime = 3600
ignoreip = 127.0.0.1/8

[sshd-aggressive]
enabled = true
port = 22
filter = sshd-aggressive
logpath = /var/log/auth.log
maxretry = 1
findtime = 600
bantime = 86400
```

**/etc/fail2ban/filter.d/sshd-aggressive.conf**

```ini
[INCLUDES]
before = common.conf

[Definition]
failregex = ^%(__prefix_line)s(?:error: PAM: )?[aA]uthentication (?:failure|error|failed) for .* from <HOST>( via \S+)?\s*$
            ^%(__prefix_line)s(?:error: )?Received disconnect from <HOST>: 3: .*: Auth fail$
            ^%(__prefix_line)sFailed \S+ for invalid user .* from <HOST> port \d*
            ^%(__prefix_line)sFailed \S+ for .* from <HOST> port \d*
            ^%(__prefix_line)sInvalid user .* from <HOST> port \d*

ignoreregex =
```

### 8. System Hardening

**/etc/audit/rules.d/ssh.rules**

```
-w /usr/sbin/sshd -p x -k ssh-daemon
-w /etc/ssh/sshd_config -p wa -k ssh-config
-w /home/jump/.ssh/ -p wa -k ssh-jump-keys
-w /root/.ssh/ -p wa -k ssh-root-keys
-w /usr/local/bin/ssh-jump-wrapper -p x -k ssh-jump-wrapper
```

**/etc/sysctl.conf**

```
# Network security
net.ipv4.ip_forward = 0
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.send_redirects = 0
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.default.accept_source_route = 0
net.ipv4.conf.all.log_martians = 1
net.ipv4.conf.default.log_martians = 1
net.ipv4.icmp_ignore_bogus_error_responses = 1
net.ipv4.icmp_echo_ignore_broadcasts = 1
net.ipv4.tcp_syncookies = 1

# Memory protection
kernel.dmesg_restrict = 1
kernel.kptr_restrict = 2
kernel.yama.ptrace_scope = 1
```

### 9. Adding New VPS

To add a new server to the jump list:

1.  Modify `/usr/local/bin/ssh-jump-wrapper` on Bastion.
2.  Add: `ALLOWED_HOSTS["new-host-name"]="<TAILNET-IP>"`
3.  Secure the new VPS SSHD config using the standard template.
