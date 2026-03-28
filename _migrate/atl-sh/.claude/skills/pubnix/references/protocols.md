# Alternative Protocols Deep Reference

The **smolnet** (small internet) — Gemini, Gopher, Finger — is core to tilde culture. These protocols exist as a deliberate reaction to the complexity, surveillance, and bloat of the modern web.

> solderpunk (creator of Gemini) designed it "almost accidentally" at zaibatsu.circumlunar.space. It was heavily inspired by Gopher and grew beyond anyone's expectations.

---

## Gemini

**Protocol**: TLS-only, text-centric, strict by design
**Port**: 1965
**Format**: `.gmi` (Gemtext) — a simple line-oriented markup
**Terminology**: Users write *gemlogs* (Gemini blogs) and host *capsules* (Gemini sites)

**Design constraints (intentional, not accidental):**
- No inline images
- No external stylesheets or fonts
- No JavaScript
- No cookies or tracking
- No iframes
- No additional network transactions after the initial request — one request, one response, done
- TLS required (HTTPS-equivalent, but TOFU trust model — no CA dependency)

This isn't minimalism for its own sake: each constraint is deliberate to prevent the protocol from accreting complexity over time. Solderpunk described it as "leaner than the web" while expanding on Gopher's simplicity with TLS. The result is a protocol with an environmental footprint fraction of HTTP — no render-blocking resources, no ad trackers, no CDN calls.

### Server: Molly-Brown (recommended)

Written in Go. Most popular Gemini server. Simple config.

```toml
# /etc/molly-brown/molly-brown.conf
Port = 1965
Hostname = "example.sh"
CertPath = "/etc/molly-brown/cert.pem"
KeyPath = "/etc/molly-brown/key.pem"
DocBase = "/var/gemini"

# User capsules at gemini://example.sh/~username/
[UserDir]
  Path = "public_gemini"
  # users put .gmi files in ~/public_gemini/
```

**TLS for Gemini**: Use a self-signed cert or Let's Encrypt. Gemini clients accept self-signed — this is intentional (Gemini's trust model is TOFU: Trust On First Use).

```bash
# Generate self-signed cert (valid 10 years)
openssl req -x509 -newkey rsa:4096 \
  -keyout /etc/molly-brown/key.pem \
  -out /etc/molly-brown/cert.pem \
  -days 3650 -nodes \
  -subj "/CN=example.sh"
```

### User capsule setup

Add to `/etc/skel`:
```
~/public_gemini/
└── index.gmi    ← default capsule index
```

Default `index.gmi`:
```gemtext
# Welcome to my capsule

This is my space on example.sh.

=> gemini://example.sh/ Back to the main server
```

### Gemtext format basics

```gemtext
# Heading 1
## Heading 2
### Heading 3

Regular paragraph text (no inline formatting)

=> gemini://example.sh/page.gmi Link text
=> https://example.com External link

* List item
* Another item

> Blockquote

```
Preformatted block
```
```

---

## Spartan

**Protocol**: Minimalist request/response protocol simpler than Gemini — no TLS, no client certs
**Port**: 300 (default)
**Format**: Gemtext (`.gmi`) or plain text — same as Gemini but without TLS requirement
**Terminology**: Users host content at `~/public_spartan/`

Spartan is newer than Gemini (post-2021) and even simpler: no TLS, no certificates, just a hostname/path/token request and a status code + body response. The data block feature allows server-side input (forms without JavaScript). Intentionally lighter than Gemini.

**Trade-off vs Gemini**: No TLS means no privacy/authentication. Spartan is appropriate for public content where simplicity matters more than confidentiality. Many tildes run both.

### Server: spsrv (recommended)

Written in Go by ~hedy. Serves `~/public_spartan/` user directories, directory listing, CGI.

```bash
go install git.sr.ht/~hedy/spsrv@latest
# Or grab prebuilt binary from git.sr.ht/~hedy/spsrv/refs
```

```toml
# /etc/spsrv.conf
port = 300
hostname = "example.sh"
rootdir = "/var/spartan"
userdirEnable = true
userdir = "public_spartan"   # relative to /home/user/
dirlistEnable = true
```

**Known tildes running Spartan**: tilde.cafe, tilde.team, earthlight.xyz
**IRC**: `#spartan` on tilde.chat
**Source**: git.sr.ht/~hedy/spsrv

### User directory setup

Add to `/etc/skel`:
```
~/public_spartan/
└── index.gmi    ← served at spartan://example.sh/~username/
```

---

## Gopher

**Protocol**: Hierarchical menu system predating the web (1991), port 70
**Format**: Gopher maps (tab-delimited menu files)
**Terminology**: Users write *phlogs* (Gopher blogs) and host *gopherholes*

### Server: Gophernicus (recommended)

Simple C server. Stable, widely deployed on tildes.

```bash
apt install gophernicus

# /etc/gophernicus.conf (or command line flags)
# -h hostname -p port -r document root
```

```
# /etc/systemd/system/gophernicus.service
[Unit]
Description=Gophernicus Gopher Server

[Service]
ExecStart=/usr/sbin/gophernicus -h example.sh -p 70 -r /var/gopher
User=gopher
Restart=always

[Install]
WantedBy=multi-user.target
```

### User gopherhole setup

```
~/public_gopher/
├── gophermap     ← menu file (optional, auto-generated if absent)
└── phlog/        ← phlog entries as plain text files
    ├── 2024-01-15.txt
    └── 2024-02-03.txt
```

**Gophermap format:**
```
iWelcome to my gopherhole	fake	fake	0
1My phlog	/~username/phlog	example.sh	70
0A text file	/~username/readme.txt	example.sh	70
```
- `i` = info line (display text)
- `1` = directory link
- `0` = text file link
- Fields: type+label, selector, hostname, port (tab-separated)

### WriteFreely (blog + phlog in one)

WriteFreely is a federated (ActivityPub) blogging platform with a built-in Gopher server option. Enable it and your blog becomes accessible over Gopher automatically — every post becomes a phlog entry.

```toml
# config.ini (WriteFreely)
[server]
gopher_port = 70   # enable Gopher output
```

**Trade-off**: Requires `setcap 'cap_net_bind_service=+ep'` after every WriteFreely update to maintain port 70 binding. Worth it if you want Gopher with minimal tooling.

### burrow (phlog tool)

`burrow` by James Tomasino — command-line Gopher phlogging tool. Creates a new dated text file, opens it in your editor, and updates the gophermap automatically. Removes the friction of manual gophermap editing.

```bash
burrow phlog   # create new phlog entry (opens $EDITOR)
burrow edit    # edit an existing entry
```

Used on envs.net and other tildes. Repo: github.com/jamestomasino/burrow

### Gopher-to-Web Proxy

Bridges the Gopher protocol to HTTP, allowing web browsers to read Gopher content. Useful for cross-promoting Gopher content to web users:

```
# envs.net pattern
gopher://envs.net/1/~username/  →  https://gopher.envs.net/envs.net/1/~username/
```

A PHP script or server-side proxy reads Gopher resources and renders them as web pages with links. Lets users write Gopher-first but still have an accessible web URL. Some tildes run a public Gopher proxy alongside their Gopher server.

---

## Finger

**Protocol**: Query user info, RFC 742 (1977), port 79
**Use**: Show user bio, status, `.plan` file — charming and fits pubnix culture perfectly

### Server: efingerd

```bash
apt install efingerd

# efingerd reads:
# ~/.plan      ← what the user is working on (classic Unix tradition)
# ~/.project   ← longer project description
```

**Example ~/.plan:**
```
Currently working on:
- My gemlog about packet radio
- Learning Rust (slowly)

Last updated: 2024-03-07
```

**Query:**
```bash
finger username@example.sh
```

**System-wide finger** (who's logged in):
```bash
finger @example.sh
```

### Finger as activity signal

Many tildes use finger as a lightweight "what is everyone doing" tool. Encouraging users to maintain a `.plan` creates organic community texture.

---

## VoIP / SIP

SDF runs a SIP-based VoIP extension system, letting users call each other using SIP phone numbers within the SDF network. A niche but charming service that fits the "communication infrastructure" identity of a mature pubnix.

```
# SDF pattern
# Each user gets a SIP extension (e.g., 2369)
# Callable internally: sip:2369@sip.sdf.org
# Accessible from external SIP clients if firewalls permit
```

**Requirements**: SIP server software (Asterisk, FreeSWITCH), SIP-capable clients (Linphone, Zoiper, MicroSIP on Windows). ARPA membership required for SDF access — funding model justifies the operational cost.

**When to add VoIP**: Only after core services are stable. SDF runs VoIP as a premium/paid tier feature — reasonable model. arf20.com/ARFNET also includes VoIP as part of their comprehensive service stack.

### Audio Streaming (aNONradio pattern)

SDF runs **aNONradio** (anonradio.net) — an internet radio station where community members can host shows. The streaming infrastructure (Icecast) is separate from the shell server but integrated into the community.

```
# Icecast model: community broadcasts
# Users apply to host shows
# Streams are publicly accessible
```

This is a Phase 4+ addition — only worth building once you have an active community with members who want to broadcast.

**TildeRadio** (tilderadio.org): A community internet radio station run by the tildeverse community — separate from SDF's aNONradio. Open to tilde members who want to host shows. You can participate without running your own streaming infrastructure.

---

## i2p (Invisible Internet Project)

An anonymous network distinct from Tor. Where Tor routes traffic through exit nodes to the clearnet, i2p is a fully internal darknet — traffic stays within the i2p network. Sites are called "eepsites" with `.i2p` addresses.

Less common than Tor in the pubnix world, but mentioned alongside Gopher, Gemini, and webrings as part of the "hidden corners" ecosystem that overlaps with tilde culture. If your tilde has a strong privacy focus, i2p is worth considering alongside or instead of Tor.

**Tor vs i2p for a tilde:**
| | Tor | i2p |
|-|-----|-----|
| Clearnet access | Yes (via exit nodes) | No (internal only) |
| Setup complexity | Lower | Higher |
| Tilde adoption | xinu.me and others | Rare |
| Best for | Privacy layer on existing services | Fully internal anonymous community |

## Tor Onion Service

xinu.me runs both clearnet and an onion service. Adds privacy for users in sensitive regions.

```
# /etc/tor/torrc
HiddenServiceDir /var/lib/tor/pubnix/
HiddenServicePort 22 127.0.0.1:22    # SSH via Tor
HiddenServicePort 80 127.0.0.1:80    # Web via Tor
HiddenServicePort 70 127.0.0.1:70    # Gopher via Tor
HiddenServicePort 1965 127.0.0.1:1965  # Gemini via Tor
```

After restart, find your onion address:
```bash
cat /var/lib/tor/pubnix/hostname
# abc123def456.onion
```

Publish the `.onion` address prominently. Users who need it will know what it is.

---

## Webrings

A webring is a circular chain of community member websites with prev/next navigation.

### The tildeverse webring

- Existing tildes can join the tildeverse webring
- Adds webring nav widget to member sites
- Run by the tildeverse community
- See: tildeverse.org for join instructions

### Running your own webring

Simple implementation: a JSON list of member URLs + a small JS/server-side widget.

```json
{
  "name": "example.sh webring",
  "members": [
    {"name": "~alice", "url": "https://example.sh/~alice/"},
    {"name": "~bob", "url": "https://example.sh/~bob/"}
  ]
}
```

**Navigation widget**: Each member page embeds prev/next links generated from the member list.

**spuos.net** went further and built their own **webring + search engine** for the smallnet community.

---

## Fediverse Integration

### Mastodon/Pleroma for your tilde

**tilde.zone** runs a Mastodon instance as a Fediverse gateway for the tildeverse.
**envs.net** runs Pleroma (lighter weight than Mastodon) at pleroma.envs.net.

```
# Mastodon: heavy (requires PostgreSQL, Redis, Sidekiq, Elasticsearch)
# Pleroma/Akkoma: lighter (PostgreSQL only, single Elixir process)
# Misskey/Calckey/Sharkey: heavier than Pleroma, more features
# Lemmy: link aggregator with discussion (Reddit-style), ActivityPub; SDF runs lemmy.sdf.org
```

**Recommendation**: Pleroma for a tilde with limited resources. Mastodon if you want the most compatibility.

### twtxt

envs.net runs **twtxt** (getwtxt) — microblogging for hackers via plain text files and HTTP.

```
# ~/.twtxt.txt
2024-03-07T12:00:00Z	Just set up my gemlog. Check it out at gemini://example.sh/~username/
```

Simple, no database, fits tilde aesthetics.

---

## tilde.json

Machine-readable feed of your tilde's users and activity. Used by tildeverse aggregators. Spec written by William Jackson (william@protocol.club) in December 2014 as the Tilde Description Protocol (~dp).

```json
{
  "name": "example.sh",
  "url": "https://example.sh",
  "signup_url": "https://example.sh/signup",
  "want_users": true,
  "user_count": 42,
  "admin_email": "admin@example.sh",
  "description": "A tilde for Linux enthusiasts",
  "users": [
    {
      "username": "alice",
      "title": "Alice's homepage",
      "url": "https://example.sh/~alice/",
      "mtime": 1709856000
    }
  ]
}
```

**Key fields:**
- `want_users` (boolean) — whether signups are open; aggregators use this to show availability
- `user_count` (number) — total registered users
- `mtime` (timestamp in user object) — last modification time of user's index.html; powers "recently updated" feeds

Serve at `https://example.sh/tilde.json`. Auto-generate from `/etc/passwd` with a cron job.

**Privacy opt-out**: tildejsongen supports a `.hidden` file in user home directories — if `~/.hidden` exists, that user is excluded from the tilde.json output. Implement this in your generator so users who want privacy can opt out of the public feed without contacting an admin.

**Generator implementations:**
- tilde.team: Python generator at tildegit.org/team/site
- tilde.institute: Rust-based `instistats` (github.com/tildeinstitute/instistats)
- dimension.sh: `tildejsongen` app (github.com/dimension-sh/tildejsongen)
- ~ben's explorer: tilde.team/~ben/tilde.json/

---

## tilde.chat (IRC Network)

The shared IRC network for the tildeverse. All tildes should point users here rather than running isolated IRC.

**Connection:**
- Host: `irc.tilde.chat`, port 6697 (SSL/TLS) — the standard connection
- Plaintext localhost 6667 available on shell servers that run a chat node
- Web clients: [kiwi](https://tilde.chat/kiwi/) and [gamja](https://tilde.chat/gamja/)

**Authentication options:**
- **CertFP**: authenticate via TLS client certificate — most secure, no password needed
- **SASL**: standard SASL authentication (PLAIN over TLS)
- Both configured in your IRC client's server settings

**XMPP gateway (biboumi):**
XMPP users can access tilde.chat channels without an IRC client via the biboumi gateway on tilde.team:
- Room format: `#channel@biboumi.tilde.team`
- Requires an XMPP account

**Matrix:** tilde.chat explicitly does not offer or allow Matrix bridges.

**Mumble voice chat:**
Voice channel available at `tilde.chat` on the default Mumble port. Password: `tilde.chat`. Web client at tilde.chat/mumble/. Announce in IRC before joining — might be empty otherwise.

**Key channels:** `#helpdesk` (support), `#meta` (general), `#gemini`, `#gopher`, `#bots` (bot testing). Each tilde has its own `#tildename` channel. Channel stats at tilde.chat/stats/.
