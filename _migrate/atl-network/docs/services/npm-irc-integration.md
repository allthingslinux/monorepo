# Nginx Proxy Manager: UnrealIRCd Integration

This guide outlines how to configure Nginx Proxy Manager (NPM) on the `atl.network` VPS to handle SSL/TLS termination and traffic proxying for the UnrealIRCd server on `atl.chat` over Tailscale.

## 1. Stream Host (Direct IRC - Port 6697)

Standard IRC clients connect via TCP. Since IRC depends on real client IPs for security (G-lines, clones), we must use the **PROXY Protocol**.

1.  Log in to the NPM Admin UI.
2.  Go to **Streams** -> **Add Stream Host**.
3.  **Incoming Port:** `6697`
4.  **Forward Host:** `<ATL_CHAT_TAILSCALE_IP>`
5.  **Forward Port:** `6697`
6.  **TCP Forwarding:** Enabled
7.  **UDP Forwarding:** Disabled
8.  **SSL:** Enabled
    - Select your SSL Certificate (e.g., `*.atl.chat` or `irc.atl.chat`).
9.  **Advanced Tab:**
    - **PROXY Protocol:** **Enabled** (CRITICAL: UnrealIRCd expects this).

## 2. Proxy Host (Webhooks/Websockets - Port 8000)

The web client uses WebSockets (`wss://`). NPM handles the SSL termination and passes the WebSocket traffic to UnrealIRCd.

1.  Go to **Hosts** -> **Proxy Hosts** -> **Add Proxy Host**.
2.  **Domain Names:** `irc.atl.chat` (or dedicated `webchat.atl.chat`)
3.  **Scheme:** `http` (NPM terminates SSL)
4.  **Forward Host name / IP:** `<ATL_CHAT_TAILSCALE_IP>`
5.  **Forward Port:** `8000`
6.  **Websockets Support:** **Enabled**
7.  **SSL Tab:**
    - Select your SSL Certificate.
    - **Force SSL:** Enabled
    - **HTTP/2 Support:** Enabled

## 3. Proxy Host (Webpanel - Port 8080)

The UnrealIRCd Webpanel is a standard web application.

1.  Go to **Hosts** -> **Proxy Hosts** -> **Add Proxy Host**.
2.  **Domain Names:** `panel.atl.chat`
3.  **Scheme:** `http`
4.  **Forward Host name / IP:** `<ATL_CHAT_TAILSCALE_IP>`
5.  **Forward Port:** `8080`
6.  **SSL Tab:**
    - Select your SSL Certificate.
    - **Force SSL:** Enabled

## Security Note

By using this setup:
- The `atl.chat` VPS IP is hidden. All public traffic hits (`atl.network`).
- Traffic between `atl.network` and `atl.chat` is automatically encrypted by Tailscale.
- UnrealIRCd is configured to **only** listen on the Tailscale interface, preventing direct public access.
