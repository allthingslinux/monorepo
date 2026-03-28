# IDEAS.md

Future feature ideas for atl.sh, roughly ordered by effort.

## Quick wins

- **inetd retro services** — daytime, QOTD (fortune-based), chargen on classic ports via openbsd-inetd (already installed for talkd)
- **Local mail delivery** — exim4 or postfix in local-only mode so mutt/alpine/mail work between users on the box
- **Plan aggregator** — script + cron that watches ~/.plan changes and generates a "what's new" feed for web, Gemini, and Gopher
- **Service catalog command** — a `services` shell command showing available services, ports, protocols, and usage examples

## Medium effort

- **IRC bouncer** — znc (in Debian repos) for persistent IRC connections; self-service account creation
- **Smokeping** — latency graphs to ISPs, DNS resolvers, other tildes; `smokeping` is in Debian repos
- **Local NNTP** — leafnode (in repos) for internal newsgroups: announcements, projects, chatter
- **Mailing lists** — mlmmj (in repos) for lightweight community lists
- **Phlog/gemlog aggregator** — aggregate user Gopher phlogs, Gemini gemlogs, and .plan updates into a unified "planet" feed
- **QOTD daemon** — custom fortune-based quote-of-the-day on port 17 via inetd, with user-submitted quotes
- **Public status page** — per-service uptime, cert expiry, DNS health, IPv6 scorecard

## Bigger projects

- **BBS** — ENiGMA½ or Synchronet over SSH/telnet; message boards, file areas, ANSI art
- **Self-service subdomains** — user-managed DNS records via Cloudflare API wrapper
- **Reverse tunnel service** — temporary public URLs for user projects (bore, rathole, or ssh -R wrapper)
- **Network lab** — containers or jails where users can safely run daemons on assigned ports, experiment with nginx/bind/etc.
- **Tor onion mirror** — .onion addresses for user web/Gemini pages
- **MUD / talker** — multi-user dungeon or social chat rooms with server lore
- **Spartan / Nex protocol servers** — protocol zoo for minimalist alternatives to Gemini/Gopher

## Community & culture

- **Textfiles / zine archive** — hosted collection of textfiles, e-zines, ANSI art, Unix lore, searchable from shell
- **Local source code museum** — mirrors of historical Unix tools, classic codebases, browsable in cgit
- **RFC / manpage mirror** — local searchable RFC archive, cross-linked POSIX/spec browser
- **Shell radio / bulletin feeds** — weather, solar conditions, space weather, NTP status via shell commands or finger
- **Quotes / lore database** — user-submitted quotes, server lore, BOFH excuses, Unix haiku
- **SDF-style social commands** — `who`, `plan`, `lastplan`, `whereisuser` wrappers that make the machine feel inhabited
- **Text browser homepage** — hand-built start page for lynx/w3m with weather, new plans, phlogs, service status

## Networking & observability

- **Looking glass** — web page for ping, traceroute, dig, BGP/ASN lookup from the server's perspective
- **Smokeping observatory** — track latency to major ISPs, DNS resolvers, other tildes, fediverse instances
- **RIPE Atlas probe** — make the server useful to the wider internet as a measurement node
- **SSH extras** — SSH certificate auth, per-user forced-command helpers, SSH chat toys, honeypot metrics dashboard

## Email infrastructure

- **Per-user mailboxes** — full local mail with IMAP (dovecot) for shell mail clients
- **Mailing lists** — community lists as primary communication channel
- **DKIM/SPF/DMARC learning tools** — educational email authentication setup
