# Pubnix / Tilde Glossary

Comprehensive terminology covering culture, jargon, history, protocols, and conventions of the pubnix/tilde ecosystem.

---

## Core Terms

### pubnix
**Public Unix.** A shared, multi-user Unix or Unix-like system that is open to the public — anyone can request an account. Distinguished from private servers by their open-access ethos. The term predates the modern tildeverse; sdf.org (1987) is the oldest continuously operating pubnix.

### tilde (~)
In the context of pubnix communities, "a tilde" refers to a public shell server in the tradition of the modern tildeverse movement (started 2014 with tilde.club). Named after the Unix convention of using `~` as shorthand for a user's home directory, and `~username` as the web path to their public page (`/home/username/public_html` → `https://example.sh/~username/`).

Also written: "tilde server", "tilde community", "tildesite".

### shell account / shell access
An account on a shared Unix system that gives you interactive command-line access via SSH. The core offering of any pubnix. Having a shell account on a well-maintained pubnix gives access to a full suite of Unix tools, compilers, editors, and often email, web hosting, and community services.

### ~username
The `~username` convention comes from Unix: `~` expands to a user's home directory in the shell, and `~username` expands to a *specific* user's home directory. On the web, it became convention to serve user pages from `public_html/` inside their home directory, accessible at `http://host/~username/`. This URL pattern became the defining aesthetic of tilde culture.

### tildeverse
The loosely federated network of tilde servers. Not a formal organization — more a community of practice. Tildeverse.org lists 14+ member tildes, maintains a wiki, hosts IRC via tilde.chat, and publishes TWIT (This Week in the Tildeverse). Membership is voluntary and informal.

### smolnet
The "small internet" or "slow internet" — an umbrella term for alternative, lightweight protocols and communities that intentionally reject the complexity of the modern web. Includes Gemini, Gopher, Finger, webrings, twtxt, and the pubnix ecosystem.

Also written: "small web", "slow web", "small technology", "smallnet". The "indie web" is a related but distinct movement.

**Smolnet values:** simplicity, low bandwidth, human scale, no JavaScript, no tracking, limited resource use by choice, close community communication over broadcasting to anonymous masses, Unix philosophy (cohesive and modular tools), and increasingly: environmental footprint awareness (see: Computing within Limits).

**The political dimension:** The smolnet community treats everyday network practice as a site of political struggle — an alternative to corporate infrastructure, not just a technical preference. Connects to commons theory and the tradition of community-run, self-hosted infrastructure as resistance to "the hold of corporate power" (Federici). This explains framing like fr.tild3.org's "hacking, mutual aid, resistance."

### PAUS (Public Access Unix System)
An alternate acronym for pubnix — "Public Access Unix System". Less common than "pubnix" but appears in some documentation and more formal writing. The terms are interchangeable.

---

## People & History

### solderpunk
The pseudonymous founder of zaibatsu.circumlunar.space and creator of the Gemini protocol. Originally hosted his phlog on SDF, then moved to zaibatsu. Created Gemini "almost accidentally" starting from notes in his phlog around 2019. Describes himself as a minimalist, decentralized internet activist, and permacomputing advocate. Identity otherwise unknown.

### ~vilmibm
Founder of tilde.town (2014). Created it after signing up for tilde.club but finding it closed before friends could join. Coined or popularized the "anarcho-monarchist" governance model. Also active in the broader FOSS/indieweb community.

### ~ben
Sole admin of tilde.team. Known for running a lean, single-admin tilde at scale (1,224 users) with minimal overhead. Demonstrates the single-admin model can work sustainably.

### Paul Ford
Writer and programmer who published "tilde.club: I had a couple of drinks and woke up with 1,000 users" in 2014, which sparked the modern tilde movement. The essay describing spinning up a shared Unix server and inviting people via Twitter went viral, inspiring dozens of new tildes.

### M-Net / arbornet.org
Founded in 1983 in Ann Arbor, Michigan — claims to be the world's longest-running public access Unix system (predating SDF). Currently runs as a 501(c)(3) nonprofit. A defining institution of pre-web BBS/pubnix culture.

### SDF (Super Dimension Fortress)
sdf.org — founded 1987 by Ted Uhlemann on an Apple IIe. The longest *continuously operating* public access Unix system. Named after the anime series "Super Dimension Fortress Macross". Has grown from a BBS to a full Unix environment running NetBSD with 47,572+ users.

Key technical history: ran Linux 1997–2001 ("the dark age" — more attacks than ever before); migrated to NetBSD on DEC Alpha hardware in 2001, dramatically improving security and stability. SDF was the largest NetBSD installation in the world (as of 2018). Still offers dial-up access. 501(c)(7) social club incorporated in Delaware, 2001.

Retrocomputing services: TOPS-20 on XKL TOAD-2 hardware, Symbolics Genera (live Lisp machine), ITS, Plan 9, CDC 6500. Arguably the world's most comprehensive publicly-accessible retrocomputing environment.

### grex.org
A historic pubnix that ran from the early 1990s until 2023 when it was gracefully shut down. Named after "grex" (Latin: herd/flock). Community-governed via a non-profit structure. Its shutdown is studied as a model for *how to close a pubnix gracefully*: announced well in advance, content archived, community thanked.

### Ted Uhlemann (iczer)
Founder of SDF in 1987 — started it on an Apple IIe as a Japanese anime BBS. Left SDF in 1992 to co-found Texas Metronet, one of the first commercial ISPs in Texas.

### Stephen Jones (smj)
SDF co-founder and the person who kept SDF running after Ted Uhlemann left in 1992. Has administered SDF for over 30 years. Ported COMMODE (a TOPS-20 chat system) to Unix as a KornShell script. Key figure behind the 2001 migration from Linux to NetBSD ("the dark age ended here").

### Kurt Lidl
Coined the word "Pubnix" in the early 1990s — not for a community tilde, but for a commercial product at UUNET Technologies (one of the first ISPs). UUNET's "Pubnix" division provided shell account access and, later, one of the first virtual web hosting services. Lidl left UMCP for UUNET and built the original automated provisioning system (Perl + SQL) that was decades ahead of its time. The commercial Pubnix was sunsetted in 2002.

**Historical significance**: The term "pubnix" originated in a commercial context and was later adopted by the community/tildeverse movement to describe something fundamentally different — non-commercial, community-governed shared Unix systems. The UUNET Pubnix evolved toward commercial web hosting; the modern tildeverse went back to shell accounts and community. Two different visions from the same word.

---

## Protocol Terms

### Gemini
A lightweight internet protocol created by solderpunk at zaibatsu.circumlunar.space around 2019–2020. Designed as a middle ground between Gopher (too simple) and HTTP (too complex). Features: TLS required, no cookies, no JavaScript, no tracking, request-response only (no streaming), text-centric. Named after the NASA Gemini program (between Mercury/Gopher and Apollo/HTTP).

Uses port 1965 (the year of the first Gemini spaceflight).

### Gemtext (.gmi)
The document format used by Gemini. Extremely simple line-oriented markup — each line has a type determined by its prefix. No inline formatting. Types: text (no prefix), heading (`#`, `##`, `###`), link (`=>`), list (`*`), blockquote (`>`), preformatted (triple backtick). Designed to be readable as plain text.

### capsule
A Gemini site. Analogous to "website" for HTTP. A user's Gemini presence is their "capsule." Located at `gemini://host/~username/` on a tilde.

### gemlog
A blog published in Gemini/Gemtext format. Analogous to "blog" for the web or "phlog" for Gopher.

### Gopher
An internet protocol predating the web (created 1991 at University of Minnesota). Hierarchical menu-based document retrieval. Largely displaced by HTTP in the mid-1990s but maintained a loyal following in the pubnix/smolnet community. Simple, fast, text-based. Uses port 70. Experiencing a revival alongside Gemini.

### gophermap
The menu/index file for a Gopher directory. Tab-delimited format where each line defines a menu item with: type character, display text, selector path, hostname, port. The `i` type creates informational (non-link) display text.

### gopherhole
A Gopher site. Analogous to "website" for HTTP. A user's Gopher presence is their "gopherhole."

### phlog
"Gopher blog" — a blog published via Gopher as a series of plain text files. The original smolnet blogging format, predating gemlogs.

### Finger
One of the oldest internet application protocols (RFC 742, 1977). Originally used to query who was logged into a remote system and see their `.plan` and `.project` files. On a pubnix, Finger lets anyone query `finger username@host` to see a user's status, plan, and project. Uses port 79.

### TOFU (Trust On First Use)
The TLS trust model used by Gemini. Rather than relying on certificate authorities (CAs), Gemini clients trust the first certificate they see from a server and alert the user if it changes — like SSH's `~/.ssh/known_hosts`. This allows self-signed certificates, removing the CA dependency entirely.

### twtxt
A decentralized, minimalist microblogging format. Each user maintains a plain text file with timestamped posts. Others subscribe by fetching your file over HTTPS. No central server required. Fits tilde aesthetics perfectly. Used on several tildes (envs.net runs a getwtxt aggregator).

### Gophernicus
The most commonly deployed Gopher server on tildes. Written in C, simple to configure, stable. Name is a play on "gopherspace" + "nicus" (suffix suggesting mastery, as in Copernicus).

### Molly-Brown
The most commonly deployed Gemini server. Written in Go by the same community that maintains the Gemini spec. Named after "The Unsinkable Molly Brown" (a reference to Gemini being more robust than Gopher).

### efingerd
A configurable Finger daemon. Allows custom scripts to generate Finger responses, making it possible to do creative things like showing your currently playing song, system status, or custom formatted user info.

### burrow
A command-line tool for creating and managing Gopher phlogs. Written by James Tomasino (a prominent tildeverse member). Simplifies the workflow of writing a new phlog entry, updating the gophermap, and organizing posts by date. Used on envs.net and other tildes.

### getwtxt
A twtxt registry server. Written by ~gbmor (admin of tilde.institute). An aggregator that indexes twtxt feeds from multiple users, letting you search and browse across a community's microblog posts. An instance runs at twtxt.tilde.institute. Repo: github.com/getwtxt/getwtxt.

### laika
A Gemini protocol server written by ~gbmor of tilde.institute. Written in Go. Supports static content and user directories. An example of pubnix admins writing their own protocol tools. Repo: github.com/gbmor/laika.

---

## File & Directory Conventions

### /etc/skel (skel, etcskel)
The skeleton directory. When a new Unix user account is created, the contents of `/etc/skel` are copied verbatim into their new home directory. On a tilde, this typically includes a default `.bashrc`, `.profile`, a starter `public_html/index.html`, and often a `README` welcoming them to the system. Getting skel right is crucial — it's every new user's first experience of your tilde.

### public_html
The conventional directory name for web-served content in a user's home directory (`~/public_html/`). The web server maps `https://host/~username/` to `/home/username/public_html/`. Contents must be world-readable (`chmod 755`).

### public_gemini
The conventional directory name for Gemini capsule content (`~/public_gemini/`). Maps to `gemini://host/~username/`. Same pattern as `public_html`.

### public_gopher
The conventional directory for Gopher content (`~/public_gopher/`). Maps to `gopher://host/1/~username`.

### .plan
A plain text file in a user's home directory. Historically shown by the Finger protocol when someone queries your account. Tradition: update it with what you're currently working on, like a status update. The original "what I'm up to" mechanism, predating Twitter by decades.

### .project
Similar to `.plan` but intended for a longer description of your current project. Also shown by Finger. Less commonly used than `.plan`.

### .bashrc / .bash_profile / .profile
Shell initialization files. On a tilde, the skel version of `.bashrc` typically sets up tilde-specific aliases, shows the MOTD, configures PATH for `~/.local/bin`, and sets a friendly prompt. First thing users customize.

### tilde.json
A machine-readable JSON file served at `https://tilde.sh/tilde.json` describing a tilde's users and metadata. Used by tildeverse aggregators, user directories, and federation tools. Includes: tilde name, URL, signup URL, description, and a list of users with their pages. Generally auto-generated from `/etc/passwd` and user metadata.

---

## Community & Culture

### MOTD (Message of the Day)
The text displayed to users on login (`/etc/motd`). On a well-run tilde, the MOTD announces maintenance windows, community events, new services, and who's been welcomed recently. A small but important community touchpoint.

### webring
A circular list of websites where each site links to the previous and next site in the ring. Predates Google — originally a way to discover content before search engines. Revived in tilde culture as a community-building tool. A user's page will have "← prev | webring | next →" navigation. The tildeverse webring connects member tildes.

### IRC (Internet Relay Chat)
The dominant real-time communication platform in tilde/pubnix culture. Most tildes maintain an IRC channel (typically on tilde.chat). IRC is where community actually forms — users idle there, help each other, share links, announce projects. Essential infrastructure for any tilde.

### tilde.chat
The IRC network serving the tildeverse. Multiple servers, federated. The central gathering place for tildeverse community members across different tilde servers. Most tildes have a channel here (e.g., `#tilde.town`, `#envs`, etc.) plus shared channels like `#meta` and `#tildeverse`.

### BBJ (Bulletin Board in JavaScript)
A terminal-based bulletin board system popular among tildes. Accessed via SSH from the command line. Gives a BBS-like threaded discussion interface without needing a web browser. Used by several tildes for community discussion.

### BBS (Bulletin Board System)
Pre-web electronic bulletin boards accessed via dial-up modem. The cultural ancestor of pubnix communities. SDF, M-Net, and other historic pubnixes grew from BBS culture. The text-based, command-line aesthetic of tildes is directly inherited from BBS culture.

### TWIT (This Week in the Tildeverse)
A community newsletter/roundup published periodically covering events, new tildes, interesting posts, and news from across the tildeverse. Community-contributed.

### anarcho-monarchist
The governance model coined by tilde.town's ~vilmibm. Users self-govern via Code of Conduct (the "anarcho" part), with the admin as a benevolent absolute authority who intervenes only when self-governance fails (the "monarchist" part). The admin is transparent about having ultimate power ("root sees all") rather than pretending otherwise. Widely cited as an effective model for small-to-medium communities.

### bus factor
The number of people who, if hit by a bus (or more realistically: burned out, moved, or quit), would cause the project to fail. A tilde with a bus factor of 1 (single admin, no documentation, no successor) is fragile. Reducing bus factor through documentation, IaC, and succession planning is essential for longevity.

### colocataires
The hosting company founded by tilde.town community member ~insom. Hosts "weird little projects" — tilde.town moved to Colocataires hosting, representing the pattern of community infrastructure being hosted by community members.

### virtuous cycle
A self-reinforcing positive feedback loop. ctrl-c.club identified two in healthy tilde communities: (1) Activity Begets Activity — more active users attract more users; (2) Knowledge Begets Knowledge — shared knowledge lowers barriers and creates more knowledgeable users who share more.

### aNONradio
An internet radio station run by SDF. Broadcasts mix of user-hosted shows and music streams. One of SDF's most beloved services — an example of the kind of community broadcasting a well-resourced pubnix can host. At anonradio.net.

### tildecoin / rtcoin
A concept for a simulated currency within the pubnix ecosystem. Not cryptocurrency — no blockchain. A game-like economy where users can earn, spend, and transfer virtual currency. Spec written by ~aewens (on tildegit.org); ~gbmor of tilde.institute began a Go implementation called `rtcoin`. Represents the playful, creative experimentation characteristic of tilde culture.

### dream
A group chat program for the shell, authored by ~ffog and deployed on Hashnix.club. An example of tilde community members writing their own communication tools rather than deploying standard IRC. Part of the tradition of bespoke tilde-specific software built for the community.

### tilde-launcher
A user program sharing tool developed for tilde.team. The `tilde` command lets users submit their own programs and scripts for discovery by other users on the system. A lightweight "app store" built into the shell — see what your fellow users have created. Repo: tildegit.org/team/tilde-launcher.

### breadpunk.club
A thematic pubnix organized around baking. An example of the long-tail of thematic tildes — any interest can be the foundation for a tilde community. Demonstrates that "what makes your tilde distinct" can be as specific and whimsical as a shared love of bread.

### unix.dog
A pubnix for furries, queer folks, and allies, running FreeBSD. Offers shell, web, email, XMPP, Sharkey (ActivityPub), Forgejo (git), Nextcloud, and Mumble VoIP. Also reachable over Tor, I2P, and Yggdrasil. Example of a well-resourced thematic identity tilde.

### catto.garden
A small community pubnix for "cats and people" — another example of animal/furry-themed identity tildes with a welcoming, curated focus.

### TildeRadio
A community internet radio station run by the tildeverse community. Available at tilderadio.org. Members from across the tildeverse host shows. A way to participate in community broadcasting without running your own streaming infrastructure. Distinct from SDF's aNONradio.

### ttbp / feels
A tilde-specific blog platform accessed from the shell. `ttbp` (originally "tilde town blog platform") lets users write entries in a terminal text editor; they're published to a web page and aggregated into a community feed. Also called "feels" after the tilde.town instance. One of the most charming tilde-native applications.

### bashblog
A simple blog generator written as a single bash script. Outputs static HTML, requires no database or framework. Users write posts as text files; `bashblog post` generates the site. Popular on tildes for its low dependencies and Unix philosophy.

### Botany
A virtual plant growing game played from the shell on tildes. Users grow plants by watering them; plants are visible to other users on the system. Entirely social — no gameplay other than tending your plant. Exemplifies the kind of charming, low-stakes social software unique to tilde culture.

### 100DaysToOffload
A community blogging challenge where participants commit to writing 100 blog posts in a year. Popular in the tildeverse and smolnet community as a way to encourage regular writing and content creation. Tags posts #100DaysToOffload on Fediverse/Gemini. Drives genuine content creation on tilde personal sites.

### Sharkey
A federated social media platform (ActivityPub), forked from Misskey. Compatible with Mastodon, Pleroma, Friendica, etc. More feature-rich than Pleroma, lighter than Mastodon. unix.dog runs Sharkey as their Fediverse frontend. An option beyond Mastodon/Pleroma for tildes wanting ActivityPub.

### Forgejo
A community-maintained fork of Gitea for self-hosted git hosting. Emerged when Gitea's governance came into question; Forgejo is more community-driven. Drop-in Gitea replacement. unix.dog and others use it. Choose Forgejo over Gitea for new deployments.

### Yggdrasil
A mesh networking overlay providing an encrypted IPv6-based network. Nodes peer with each other to form a self-organizing mesh — traffic stays within the Yggdrasil network (like I2P, unlike Tor which exits to clearnet). unix.dog publishes a Yggdrasil address alongside Tor and I2P. Niche but growing in privacy-focused communities. Uses cryptographic addresses based on public keys.

### wall
A Unix command that broadcasts a message to all logged-in users' terminals. The name comes from "write all." Used legitimately by admins to announce maintenance. Listed in tilde user guidelines as something not to abuse — spamming `wall` disrupts everyone's terminal sessions and is one of the easier ways to be antisocial on a shared system.

### lowdown
A lightweight Markdown → HTML translator (C, single binary). From Kristaps Dzonsons. Much lighter than Hugo, Pandoc, or other SSGs — fits tilde aesthetics of minimal tooling. Converts markdown files to HTML without a full build system. At kristaps.bsd.lv/lowdown/.

### frotz
A Z-machine interpreter for playing interactive fiction (text adventures) — classic Infocom games and modern IF. A staple of well-equipped tildes. Install with `apt install frotz`. Users can play Zork and thousands of other games from the shell. Represents the "learning and play" tradition of pubnix culture.

### figlet
Generates large ASCII-art text from regular text input. `figlet "hello"` produces oversized banner text. Common for MOTD headers, welcome banners, and decorating shell scripts on tildes. Install with `apt install figlet`.

### fortune-mod
Displays a random quote or joke from a database of "fortunes" on each login (when added to `.bashrc`). A Unix tradition since the 1970s. On a tilde, seeing a random fortune on login is a small community delight. Install with `apt install fortune-mod`.

### mosh (Mobile Shell)
An SSH alternative designed for spotty or high-latency connections. Uses UDP, handles roaming (IP address changes), and maintains session state across interruptions. Users on mobile connections or unreliable internet benefit significantly. Install with `apt install mosh`; requires UDP ports open on firewall. From MIT.

### talk
An ancient Unix protocol for real-time two-way text chat between users logged into the same (or different) systems. Predates IRC. Still available on some tildes as a retro/historical curiosity. Install with `apt install talk-server`. Represents the earliest layer of pubnix communication culture.

### identd / oidentd
The Ident Protocol daemon. When users connect from your tilde's shell to IRC servers, IRC networks use identd (port 113) to verify the connection source. Without it, users see "ident timeout" warnings. `oidentd` is the most common open-source implementation. `apt install oidentd`. Requires port 113 accessible from IRC servers.

### charybdis
An IRC server daemon available in Debian/Ubuntu package repositories. Used by tilde.club for their IRC server. Supports SSL (port 6697), server-to-server linking, and operator management. Configuration via `/etc/charybdis/ircd.conf`. Alternative to ngircd (note: charybdis and ngircd may not interlink server-to-server).

### tig
A text-mode interface for git. Browse commits, diffs, and branches in the terminal without leaving the shell. Common on tildes as a friendlier alternative to raw `git log`. Install with `apt install tig`.

### mlmmj
Mailing List Manager Junior — a simple, file-based mailing list manager that integrates with Postfix. Good for running low-volume community mailing lists on a tilde. Lighter than Mailman. Mentioned in tilde.club's package setup.

### sl
"Steam Locomotive" — displays an ASCII art train running across your terminal when you accidentally type `sl` instead of `ls`. A beloved Unix joke command. Install with `apt install sl`. A staple of tilde culture; often pre-installed on well-curated tildes.

### tmatrix
A Matrix-style "digital rain" animation for the terminal. Install with `apt install cmatrix` (the common equivalent) or from source. A fun tilde tradition.

### cowsay
Generates ASCII art of a cow (or other animal) speaking a message. `cowsay "hello world"`. The message source can be piped in. Combining `fortune | cowsay` on login is a tilde classic. Extensible with custom `.cow` files (as in the Hashnix beaver example). Install with `apt install cowsay`.

### ansiweather
Shows current weather conditions in the terminal using ANSI color codes. Useful as a MOTD addition or standalone command. Install with `apt install ansiweather`.

### write
A Unix command for real-time messaging between users on the same system. `write username` opens a session where text typed is immediately sent to the target user's terminal. `Ctrl-D` ends the session. If a user is logged in on multiple terminals, specify: `write username pts/0`. More direct than IRC for on-system communication; more intrusive than mail.

### chfn
"Change finger information" — sets the details shown when someone queries your account with the `finger` command. Fields: full name, office location, office phone, home phone. `chfn` is interactive.

### chsh
"Change shell" — changes your login shell. `chsh -s /bin/zsh` to switch to ZSH. Takes effect on next login.

### ac / lastlog / sa (multi-user accounting)
Unix commands for understanding usage on shared systems:
- `ac` — cumulative login time per user (reads `/var/log/wtmp`)
- `lastlog` — most recent login for each user (find dormant accounts)
- `sa` — process accounting summary (command usage patterns, requires `acct` package)

These are the basic tools for understanding who uses your tilde and how much.

---

## Technical / Sysadmin

### mkuser
The conventional name for the user creation script on a tilde. Takes username, email, and SSH public key; creates the Unix account; sets up authorized_keys; sends a welcome email; runs pre/post hooks. dimension.sh's `mkuser` is the reference implementation.

### Ansible
Infrastructure automation tool. Nearly every mature tilde uses Ansible to manage their server configuration. Ansible playbooks + roles mean the server can be rebuilt by anyone with access to the repo, reducing bus factor and enabling smooth admin transitions. dimension.sh and Project Segfault are the reference Ansible implementations for tildes.

### IaC (Infrastructure as Code)
Managing server configuration through code (Ansible, NixOS, Terraform, etc.) rather than manual commands. Essential for tilde longevity — when the admin changes, the server must be rebuildable. "If it's not in the repo, it doesn't exist."

### Borgmatic
A wrapper around the Borg backup tool. Common on tildes for automated, deduplicated, encrypted backups. Configured in YAML, supports multiple repositories (local + offsite), retention policies, and consistency checks.

### fail2ban
A daemon that monitors log files and automatically bans IP addresses showing signs of brute-force attacks. Standard on any SSH-exposed server. Configured to ban IPs after N failed auth attempts within a time window.

### cgroups (control groups)
Linux kernel feature for limiting and isolating resource usage (CPU, memory, I/O, processes) per user or group. On a tilde, used to prevent one user from monopolizing resources or crashing the system. Typically configured via systemd user slices.

### ZNC
An IRC bouncer (background proxy). Users connect their IRC client to ZNC rather than directly to IRC. ZNC stays connected while the user is offline, logging messages and replaying them on reconnect. Common service on well-equipped tildes. See also: soju (modern alternative).

### soju
A modern IRC bouncer with full IRCv3 support. Written by ~emersion (Simon Ser). More capable than ZNC for modern IRC clients — supports account-notify, away-notify, server-time, multi-prefix, and other IRCv3 extensions. Uses PAM for authentication (same password as the shell account). Project Segfault runs soju as their bouncer. Pairs well with weechat + the soju.py plugin. Available at sr.ht/~emersion/soju.

### Cockpit
A browser-based Linux server management interface. Provides a terminal, file management, Podman container management, and system stats accessible from any web browser — no SSH client required. Project Segfault runs Cockpit as an alternative access method for users without SSH clients. Authenticated with the shell account password. More capable than a simple web shell (xterm.js), less capable than a full SSH session.

### Authentik
A self-hosted identity provider and SSO (Single Sign-On) platform. More feature-rich than LLDAP+Keycloak for most pubnix use cases — handles OAuth2, OIDC, SAML, and LDAP in one service. Project Segfault uses Authentik to federate their Gitea, Wiki, HedgeDoc, FreshRSS, and Vikunja instances behind a single login. Can be seeded from PAM/system accounts or managed independently.

**Authentik vs LLDAP+Keycloak**: Authentik is a single service vs. two (LLDAP + Keycloak). Generally easier to operate for tildes. Both are valid choices.

### Headscale
An open-source, self-hosted implementation of the Tailscale control plane. Gives you the WireGuard-based mesh VPN (Tailnet) without depending on Tailscale's SaaS infrastructure. Project Segfault runs Headscale to put all management interfaces and inter-node SSH behind the Tailnet — nothing administrative is exposed to the public internet. Pairs with the standard Tailscale client on admin machines.

### Podman
A rootless container runtime — runs containers without a privileged daemon process. Drop-in replacement for most Docker commands (`podman run`, `podman compose`, etc.) but with better security defaults. Containers run as the calling user, not as root. Project Segfault exposes Podman management through their Cockpit interface.

### DNSSEC (Domain Name System Security Extensions)
Cryptographic signatures added to DNS records to protect against cache poisoning and spoofing. When DNSSEC is enabled, DNS resolvers can verify that records haven't been tampered with in transit. Configured at the domain registrar (they generate and publish the DS record) and on your authoritative DNS server. Project Segfault enables DNSSEC on all their domains. Verify with `dig +dnssec your-tilde.sh SOA` (look for the `ad` flag in the response).

### hashbang.sh
A public shell server (hashbang.sh) run by a team of admins including ~ben (of tilde.team). Known as a more technically sophisticated pubnix — larger scale and more opinionated tooling than a typical tilde. Represents the overlap between pubnix culture and serious open infrastructure projects.

### Knot DNS
A modern, high-performance authoritative DNS server. Used by vern.cc instead of the more common BIND or PowerDNS. Mentioned as a technical differentiator — publishing your Knot configs publicly helps others learn.

### OpenIndiana / Illumos
A community distribution based on OpenSolaris (Oracle killed OpenSolaris in 2010; Illumos is the open-source fork). Illumos underpins OmniOS CE and OpenIndiana. Mentioned by ~gbmor as an unexplored pubnix platform worth experimenting with — different lineage from Linux/BSD, rich ZFS and DTrace heritage.

### Plan 9
An experimental operating system from Bell Labs (successor research to Unix). Everything is a file (even more so than Unix). Distinct network transparency model. Mentioned as an unexplored pubnix platform. pub.primordial.cc and a few others have experimented with Plan 9 for shell servers.

### LLDAP + Keycloak (TGCI)
The centralized identity stack used by tilde.green (called TGCI: Tilde Green Central Identity). LLDAP provides a lightweight LDAP server; Keycloak handles SSO (Single Sign-On) and OAuth2/OIDC. Allows users to have one login across multiple services on the tilde. Complex to set up but enables a seamless multi-service experience.

### Certbot
The Let's Encrypt ACME client. Standard tool for obtaining free TLS certificates. On a tilde, typically configured with auto-renewal via systemd timer or cron. Required for HTTPS, SMTP STARTTLS, and optionally Gemini (though Gemini accepts self-signed).

### fail2ban
Intrusion prevention software. Monitors log files for suspicious patterns (failed SSH logins, etc.) and temporarily bans offending IPs using firewall rules. Standard on any internet-facing server.

### quotas (disk quotas)
Per-user limits on disk usage. Set via the OS quota system (`setquota`). Essential on a shared system — without quotas, one user filling their home directory with files can fill the whole filesystem. Must be configured before users are created; retrofitting is painful.

---

## SDF-Specific

### ARPA / MetaARPA
SDF's paid membership tiers. ARPA ($9/year) grants additional storage, VoIP access, and other services. MetaARPA ($36/year) provides even more. Named after ARPANET, the precursor to the internet. The free tier is genuine and useful; ARPA is a way to support the service.

### VPM (Virtual Private Machine)
SDF's highest tier — a full virtual machine running your own instance of NetBSD or other supported OS. The premium offering for users who need root access to their own environment.

### maint
SDF's maintenance shell — a restricted interactive shell for account management. New users access `maint` to verify their account (by entering a validation code), change their shell, set up services, and manage their profile. An example of a tilde-side account management interface that doesn't require full shell access.

### com / bboard
Two SDF-specific terminal communication tools. `com` is a real-time group chat program for the shell (similar to `write` or `talk` but multi-user). `bboard` is a text-based forum/bulletin board read directly in the TTY. Predating web forums — the way SDF users have always communicated.

### BBoard
SDF's command-line bulletin board system. A text-based discussion forum accessed via the shell. One of SDF's oldest services, predating the web.

### COMMODE
SDF's text chat program, ported from DEC TOPS-20. A historical artifact that's still available — typical of SDF's commitment to preserving computing history.

### TOPS-20 / ITS / Symbolics Genera
Retrocomputing systems still accessible on SDF. TOPS-20 runs on XKL TOAD-2 hardware; Symbolics Genera is a live Lisp machine environment; ITS is the Incompatible Timesharing System from MIT. SDF is one of the few places these historic systems are publicly accessible.

### THXMOO
SDF's text-based virtual world (MOO) themed around the post-WWIII dystopia of THX-1138. Accessible via telnet. An example of a tilde offering a MOO as a community space — a text-based virtual world where users interact, build objects, and explore.

### MOO (MUD Object-Oriented)
A text-based virtual world / interactive fiction environment. Users connect via telnet or SSH and navigate rooms, interact with objects and other users, and often build new rooms and objects themselves. MUDs (Multi-User Dungeons) are the older form; MOOs add object-oriented programming. Some tildes host MOOs as community spaces (SDF's THXMOO). Classic alternative to IRC for social interaction.

### SMAUG
A popular open-source MUD server codebase, derived from DIKU/Merc. Used by dimension.spodnet.uk.com (1997-era predecessor of dimension.sh) as their community game. SMAUG-based MUDs are a historically common way tildes have offered shared gaming experiences — more structured than MOOs but similarly text-based and community-oriented.

### ytalk
A terminal-based multi-user chat program, the multi-party successor to `talk`. Unlike `talk` (two-party only), `ytalk` allows several users on the same system or different systems to chat in a split-screen terminal interface. Used by dimension.spodnet.uk.com in the late 1990s as their primary group communication tool before IRC. Available as `apt install ytalk` but largely superseded by IRC and BBJ in modern tildes.

### toobnix.org
SDF's user video gallery — a PeerTube-like video hosting service for SDF members. An example of a mature pubnix offering multimedia hosting beyond text and web pages.

### SDFARC (SDF Amateur Radio Club)
The SDF Amateur Radio Club — an example of a community organization growing organically from a pubnix. Members coordinate via SDF's systems. Shows how pubnix communities extend into adjacent hobbies.

### MetaArray
SDF's large disk array server available to MetaARPA members. Provides significantly more storage than the standard quota. An example of the tiered resource model where sustaining members get access to more infrastructure.

### SSHFS (SSH Filesystem)
Mounts a remote directory over SSH as a local filesystem. Lets users edit files on a pubnix using their local text editor or IDE rather than a terminal editor. Common workflow: `sshfs user@tilde.sh:/home/user ~/mnt/tilde`. Requires FUSE on the local machine. More convenient than SCP/rsync for interactive editing sessions.

---

## Protocol History

### RFC 742
The original Finger protocol specification (1977). One of the oldest application-layer internet protocols still in active use in the tilde community.

### Port 70
The standard port for Gopher. Assigned in 1991.

### Port 79
The standard port for Finger. Assigned in 1977.

### Port 1965
The standard port for Gemini. Chosen to reference the year of the first Gemini spaceflight.

### USENET / NNTP
A distributed discussion system predating the web. Still maintained by some tildes (notably arf20.com/ARFNET). Accessed via NNTP protocol, newsreader clients like `tin` or `slrn`. Cultural ancestor of online forums and Reddit.

### M-Net and Chinet
The first two public access Unix systems, both started in 1982. M-Net was in Ann Arbor, MI (still running as arbornet.org — the world's longest-running pubnix). Chinet was in Chicago, IL. Both were dial-in systems — users paid long-distance phone charges to connect, which constrained user bases to local calling areas, creating geographically grounded communities where online friends might literally live nearby. By the late 1980s, 70+ public access Unix systems existed; at their early-1990s peak, Usenet lists contained 100+ entries.

### The Eternal September
The degradation of online community quality after AOL, Prodigy, and CompuServe brought massive waves of new users to the internet in the early 1990s. Previously, each September a new cohort of college students would join Usenet and need to learn norms — the community would absorb them. With commercial services, "September never ended": a continuous flood of new users overwhelmed existing norms permanently. For public access Unix systems specifically, this period also brought "script kiddies" who abused open services (spam, hacking, illegal files), forcing admins to lock down previously open functionality. Pubnix culture today is partly shaped as a reaction to Eternal September — the deliberate barriers to entry (SSH keys, technical knowledge) serve as norm filters.

---

## Philosophy & Values

### Shoutrrr
A Go notification library (containrrr.dev/shoutrrr) that sends notifications to dozens of services (Slack, Discord, Matrix, email, Telegram, etc.) via a single URL format. Used by publapi (Project Segfault's signup API) to notify admins of new registrations. Pattern: when a user signs up via web form, the API fires a Shoutrrr notification to wherever the admin is — IRC via webhook, email, or chat. No need to poll a database.

### pflogsumm
Postfix Log Summarizer — generates a daily digest of mail server activity from Postfix logs. Shows message counts, rejected/bounced messages, top senders/recipients, and delivery statistics. Run daily via cron and email the report to admin. Used by dimension.sh's Ansible postfix role.

### meta-ring
A "ring of webrings" — a webring whose members are other webrings rather than individual sites. meta-ring.hedy.dev lists tilde and smolnet webrings, making it a discovery layer above individual webrings. Navigation: `next.js`, `previous.js`, `random.js` serverless functions (Netlify).

### pubnixhist
The Pubnix History Project — a cmccabe/rawtext.club research archive documenting 173 public access Unix systems with structured profiles (start year, OS, location, key figures, local software) and 82 nixpub snapshots from 1987-1995. Hosted on Gopher at `gopher://rawtext.club/1/~cmccabe/pubnixhist/`. The primary historical record of pre-tilde pubnixes. Co-maintained by cmccabe and gauntlet@ctrl-c.club.

### nixpub
A historical mailing list of public access Unix systems, posted to Usenet from 1987 through the mid-1990s. The nixpub list was the canonical directory of BBS-like Unix systems before the web — the predecessor to tilde aggregators like tilde.club/~pfhawkins/othertildes.html. 82 snapshots archived in the pubnixhist project.

### tilde.news
A tildeverse-run link aggregator in the style of Lobste.rs (itself a curated Hacker News clone). Hosted at tilde.news, maintained by ~ben/tilde.team. An example of the tildeverse building its own community infrastructure — a shared news feed for the community rather than using Reddit or HN. Invitations required (like Lobste.rs).

### biboumi
An XMPP-to-IRC gateway that allows XMPP/Jabber users to connect to IRC channels without an IRC client. tilde.team runs a biboumi instance for tilde.chat: XMPP users join IRC channels using the format `#channel@biboumi.tilde.team`. Lets XMPP-native users participate in tilde.chat without switching clients.

### Mumble
Open-source, low-latency voice chat software. tilde.chat runs a Mumble server at `tilde.chat` (default port) with password `tilde.chat`. An example of a tildeverse community offering voice alongside text — rare in pubnix culture but a meaningful supplement to IRC for real-time collaboration.

### ttm.sh
A URL shortener run by the tildeverse (tilde.team's ~ben). Publicly available. An example of the tildeverse self-hosting utility services rather than relying on commercial providers.

### Neocities
A web hosting platform for hand-crafted personal websites, inspired by the old GeoCities. Adjacent to pubnix culture — Neocities users and tilde users overlap significantly in aesthetics and values (hand-crafted HTML, personal expression, anti-corporate ethos). Neocities lacks the shell access and community infrastructure of a tilde but shares the spirit. Many pubnix users also maintain a Neocities site.

### i2p (Invisible Internet Project)
An anonymous network layer for internet communication, similar in purpose to Tor but architecturally different. Where Tor uses onion routing through exit nodes to the clearnet, i2p is a fully internal darknet — traffic stays within i2p. Sites on i2p are called "eepsites" (with `.i2p` addresses). Less common than Tor in the pubnix world but used by privacy-focused communities. Mentioned alongside Gopher, Gemini, and webrings as part of the "hidden corners" of the internet that overlap with pubnix culture.

### pubnix values
The commonly cited values of the pubnix/tilde ecosystem (synthesized across communities):
- **Open source** — preference for FOSS software throughout the stack
- **Knowledge sharing** — wikis, guides, helping newcomers in IRC
- **Program creation / development** — providing compilers, editors, dev tools
- **Community project promotion** — webrings, shared services, federation
- **Free access** — shell accounts at no cost as the norm
- **Privacy** — alternatives to surveillance-based commercial services
- **Mutual aid** — fr.tild3.org frames it as "hacking, mutual aid, resistance"

### Small Technology
A framing used by the Damaged Earth Catalog and adjacent communities to describe the broader project of using alternative network infrastructures to delink from the commercial internet. Encompasses smolnet protocols, pubnixes, self-hosting, and community-run servers. Emphasizes that resource minimalism is both a technical choice and a political one — limiting CPU, memory, disk, and bandwidth by design rather than necessity.

### Computing within Limits
A named academic/activist framing connecting computing practices to environmental sustainability and planetary limits. The smolnet's emphasis on minimal resource use, simple protocols, and long-lived hardware aligns with this movement. Running a tilde on a low-power VPS or recycled hardware rather than an energy-intensive cloud cluster is part of this ethos.

### Small Internet Manifesto
A 2019 document by ~spring (published as a phlog entry on republic.circumlunar.space) articulating the values and practices of the small internet. One of the foundational texts of the modern smolnet movement. Articulates the core distinction: small communities engaged in close communication, as opposed to broadcasting to an anonymous mass.

### demoscene
A computer art subculture focused on creating real-time audio-visual demonstrations ("demos") under extreme technical constraints — most famously the "4k intro" where the entire executable must fit in 4096 bytes. Originated in the 1980s cracker/warez scene and evolved into a legitimate art form. The demoscene's ethos of "squeezing the most out of very restricted computing resources" is a direct ancestor of permacomputing. Ville-Matias Heikkilä (Viznut), who coined permacomputing, came from the demoscene.

### permacomputing
A philosophy of computing that emphasizes longevity, repairability, and minimal resource use. Coined by **Ville-Matias Heikkilä (Viznut)** in a 2020 text on his website, drawing from his demoscene background and taking direct inspiration from permaculture. The term was subsequently adopted by artists, programmers, and activists, and a community wiki was started at permacomputing.net in 2022.

**Core principles:**
- **Planned longevity** over planned obsolescence — design for long life, reuse, and repair rather than replacement cycles
- **Waste as a resource** — treat discarded hardware as material to work with, not discard
- **Diversity of approaches** over one dominant technology and linear "progress"
- **Accountability** — only do heavy computation if it saves resources elsewhere; automation justified only when it saves more energy than it consumes
- **Maintenance culture** — refactor and rewrite programs to keep them small and efficient, rather than relying on Moore's Law to compensate for software bloat
- **Commons contribution** — place technology in the public domain, share resources
- **Decentralisation and modularity** — adaptable to local community needs

**The Moore's Law critique**: Permacomputing explicitly pushes back against the assumption that hardware improvements will always bail out bloated software. Programs should be written to be small and efficient now, not "good enough for current hardware."

**Connections to pubnix**: Running a tilde on minimal hardware, using text-based protocols, preferring simple tools, maintaining long-lived servers — all align with permacomputing values. solderpunk (Gemini creator) is described as a permacomputing advocate.

**Notable permacomputing projects**: Ariane (Gemini browser for Android), the solar-powered Leaf server.

### salvage computing
Using discarded or obsolete hardware for new purposes. Related to permacomputing. solderpunk is described as a "salvage computing theorist and practitioner." The demoscene tradition of making art on old constrained hardware is a cultural ancestor.

### planned longevity
The permacomputing alternative to planned obsolescence. Designing systems, hardware, and software to last decades rather than years. Choosing technologies with long support horizons (OpenBSD, Debian LTS, NetBSD — all common on tildes). Preferring simple protocols that won't be deprecated over complex ones that will. Contrasted with the commercial tech industry's incentive to make things obsolete to drive upgrade cycles.

### Appropriate Technology (AT)
A concept originating with economist Ernst Schumacher's 1973 book *Small is Beautiful: Economics as If People Mattered*. Originally called "intermediate technology," it describes technology designed with special consideration to the environmental, ethical, cultural, social, political, and economic aspects of the community it is intended for. The movement peaked in the late 1970s–80s.

**Core values** (1983 OECD definition): low investment cost per workplace, organizational simplicity, high adaptability to particular social or cultural environments, sparing use of natural resources, low cost of final product.

**"Enoughness"**: AT centers on sufficiency rather than maximization — technology that is *enough* for the need, not the most powerful or scalable. This maps directly to smolnet/pubnix values of using simple protocols and minimal resources.

**OSAT (Open Source Appropriate Technology)**: A contemporary evolution combining AT principles with open source. All designs free as in gratis and libre, peer-reviewed, iteratively improved. Open Source Ecology's Global Village Construction Set (GVCS) is a prominent example.

**The political critique**: AT critics (Brown & Mesly) note that technology alone doesn't drive social transformation — a clear political agenda must accompany it. The smolnet community largely agrees: running a Gemini server is a technical act, but its meaning comes from the values and political commitments behind it.

**Relevance to pubnix**: A pubnix designed with AT principles would be: simple to administer, adapted to its community's specific needs, using minimal resources, long-lived, open source, and not dependent on large commercial infrastructure.

### Convivial Computing / Tools for Conviviality
Ivan Illich's 1973 book *Tools for Conviviality* argued for tools that are transparent, accessible, and under the control of their users — as opposed to tools that make users dependent on specialists and institutions. A "convivial tool" empowers the people using it rather than the institutions providing it.

The Damaged Earth Catalog places this alongside permacomputing and appropriate technology as a related intellectual tradition. The pubnix model — giving users actual shell access, real Unix tools, and the ability to understand and modify their environment — is more "convivial" in Illich's sense than SaaS platforms where the user has no visibility into or control over the underlying system.

### anti-corporate / counter-cultural
A common value in tilde culture. rawtext.club describes itself as "not cool, not easy, not big" — a deliberate rejection of growth-hacking, VC funding, and corporate tech aesthetics. fr.tild3.org uses the framing "hacking, mutual aid, resistance." tilde.32bit.cafe is explicitly "anti-capitalistic."

### public service / public TV model
The ethos of nyx.net — running a pubnix as a public service, like public broadcasting, rather than a commercial venture. Inspired by PBS/NPR: free to access, supported by those who value it.

### "community first, technology second"
tilde.town's explicit priority ordering. Technical features exist to serve community needs, not vice versa. Sense of belonging is the primary goal; cool services are secondary. This principle explains many decisions: why tilde.town doesn't have the most services, but does have the most active community culture.

### cash-neutral
Operating at exactly break-even: costs are covered but no profit is extracted. skylab.org has maintained this for 27+ years. Implies: no growth pressure, no investor obligations, sustainable indefinitely as long as the community contributes enough to cover costs.

### "slowest, plainest, coziest"
ctrl-c.club's self-description. A deliberate embrace of the slow, text-based, low-stimulus internet aesthetic. Contrast with the fast, visual, attention-maximizing commercial web.

### graceful shutdown
The concept of closing a pubnix responsibly: announce well in advance, archive content, provide migration paths for users, express gratitude. grex.org is the model example. The opposite of a sudden disappearance, which is unfortunately common among smaller tildes.
