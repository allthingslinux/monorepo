---
name: pubnix
description: Build, operate, and grow a pubnix or tilde server — a shared public Unix system with community culture. Use whenever the user mentions tilde, pubnix, shell server, tildeverse, smolnet, Gemini/Gopher server setup, community governance for Unix servers, atl.sh, or shared hosting with SSH accounts. Also trigger when designing multi-user Linux/BSD systems with community focus, alternative protocols, or public access Unix infrastructure.
tags: [pubnix, tilde, unix, linux, bsd, community, sysadmin, shell-server, atl.sh]
allowed-tools: [Read, Write, Edit, Glob, Grep, Bash]
---

# Pubnix / Tilde Server

> "Community first, technological project second." — tilde.town
> "The slowest, plainest, coziest place on the internet." — ctrl-c.club
> "Tilde.club is one cheap, unmodified Unix computer on the Internet." — Paul Ford, 2014

A **pubnix** (public Unix) is a shared, multi-user Unix system open to the public. A **tilde** (~) is a pubnix in the tradition of the modern tildeverse movement (started 2014 with tilde.club), named after the `~username` path convention for user home directories.

**This skill is backed by research into 49 active tildes/pubnixes and 40 cloned repos.**
Reference files are in `references/` — read them when going deep on a specific topic.

| Reference File | Read when... |
|---|---|
| `references/glossary.md` | Defining any pubnix/tilde term, explaining jargon, culture, or history |
| `references/tildes.md` | Comparing real tildes, looking up specific examples |
| `references/governance.md` | Designing CoC, admin structure, succession planning |
| `references/infra.md` | Ansible roles, mkuser, skel, security hardening |
| `references/protocols.md` | Gemini, Gopher, Finger, Tor, webrings, Fediverse |
| `references/sustainability.md` | Funding models, economics, longevity |

---

## Glossary

| Term | Meaning |
|------|---------|
| **pubnix** | Public Unix — any shared multi-user system open to the public |
| **tilde** | A pubnix in the modern tildeverse tradition; named after `~username` |
| **tildeverse** | Federation of 14+ interconnected tildes (tildeverse.org) |
| **~username** | Standard path to a user's web directory (`/home/user/public_html`) |
| **smolnet** | The small/slow internet: Gemini, Gopher, Spartan, Finger, webrings |
| **phlog** | A blog hosted on Gopher |
| **gemlog** | A blog hosted on Gemini |
| **capsule** | A Gemini site |
| **gopherhole** | A Gopher site |
| **skel / etcskel** | `/etc/skel` — default files copied to every new user's home dir |
| **webring** | Circular link chain connecting community member sites |
| **BBJ** | Bulletin Board in JavaScript — terminal BBS used by tildes |
| **tilde.chat** | IRC network serving the tildeverse |
| **solderpunk** | Creator of Project Gemini; admin of zaibatsu.circumlunar.space |
| **anarcho-monarchist** | tilde.town's governance: self-governance + benevolent admin backstop |
| **ARPA/MetaARPA** | SDF's paid membership tiers ($9/yr and $36/yr) |

---

## 1. Identity — Choose Your Niche First

Before anything technical, decide what makes your pubnix distinct.

```
What is your identity?
│
├── Regional / Language
│   └── Serve a geographic or linguistic community
│       (texto-plano.xyz = Spanish, fr.tild3.org = French, aussies.space = AU)
│
├── Thematic / Interest
│   └── Organized around a specific interest or subculture
│       (cosmic.voyage = sci-fi storytelling, remotes.club = remote workers)
│
├── Identity / Safe Space
│   └── Serve a specific demographic with curated membership
│       (crime.team = trans women/CAMAB non-men)
│
├── Technical / Protocol
│   └── Focus on a specific OS, platform, or protocol
│       (tilde.institute = OpenBSD, zaibatsu = Gemini/Gopher)
│
├── Mission / Values
│   └── Social purpose drives decisions
│       (yunix.net = "those in need", rawtext.club = anti-corporate)
│
└── General / Community
    └── Broad, welcoming, no specific niche
        (tilde.club = original, tilde.team = low-maintenance general)
```

Write your identity statement before your first config file.

---

## 2. Operating System

```
Which OS?
│
├── Linux (most common, easiest staffing)
│   ├── Debian  → Stability, long LTS, most tildes use this
│   ├── Ubuntu  → Familiar, beginner-friendly
│   └── Fedora  → tilde.club; bleeding-edge packages
│
├── BSD (philosophy-aligned, strong security)
│   ├── OpenBSD  → Security-first; tilde.institute
│   ├── FreeBSD  → Stability + ports; tilde.guru, skylab.org (27+ years)
│   └── NetBSD   → SDF (oldest pubnix, 47k+ users since 1987)
│
└── Unique (strong differentiation, dedicated niche)
    └── IBM i/AS400 → pub400.com (70,000+ users, 15 years)
```

| Factor | Debian/Ubuntu | OpenBSD | FreeBSD |
|--------|--------------|---------|---------|
| Package availability | Excellent | Good | Good |
| Security default | Good | Excellent | Good |
| Sysadmin familiarity | Highest | Lower | Moderate |
| Philosophy alignment | Neutral | Strong | Strong |
| Recommended for | Most tildes | Security-focused | BSD philosophy |

**Recommendation**: Start with Debian unless your identity is BSD-specific.

---

## 3. Governance

→ For deep governance patterns, CoC templates, and succession planning: **read `references/governance.md`**

```
Governance model?
│
├── Anarcho-Monarchist (recommended for most)
│   └── Self-governance via CoC; admin intervenes only when it fails
│       → tilde.town (3,000 users, 10+ years)
│
├── Single Admin
│   └── One person runs everything; low overhead, high bus-factor risk
│       → tilde.team (1,224 users)
│
├── Multi-Admin / Volunteer Collective
│   └── Distributed responsibility
│       → blinkenshell.org (18+ years)
│
├── Non-Profit (501c3/501c7)
│   └── Formal structure for fundraising
│       → sdf.org, arbornet.org
│
└── Community-Governed
    └── Users vote on major decisions
        → grex.org (ran 30+ years, graceful shutdown 2023)
```

**Core principle**: Be transparent about admin power. Telling users "root sees all and can do all" builds trust rather than undermining it (tilde.town lesson).

---

## 4. Service Stack

→ For Ansible roles, mkuser, skel files, security hardening: **read `references/infra.md`**
→ For Gemini, Gopher, Finger, Tor, webrings: **read `references/protocols.md`**

### Minimal Viable Pubnix — Growth Phases

```
Phase 1 — Shell + Web (establish community first)
├── SSH shell access
├── ~/public_html web hosting (Nginx/Apache)
├── IRC channel (join tilde.chat)
├── FAQ / wiki
└── Email or form-based signup

Phase 2 — Email + Communication
├── Postfix + Dovecot (SMTP + IMAP)
├── ZNC IRC bouncer
└── BBJ bulletin board

Phase 3 — Alternative Protocols (smolnet)
├── Gemini (Molly-Brown)
├── Gopher (Gophernicus)
├── Finger (efingerd)
└── Webring

Phase 4 — Community Features
├── Gitea (self-hosted Git)
├── Fediverse (Pleroma/Mastodon)
└── Collaborative tools (CryptPad, HedgeDoc)

Phase 5 — Federation
├── Join tildeverse.org
├── Implement tilde.json
└── Inter-tilde webring
```

### Web Server

| Server | Notes |
|--------|-------|
| **Nginx** | Most common on tildes; fast static files |
| **Caddy** | Auto HTTPS; Project Segfault uses this |
| **Apache** | .htaccess for per-user config |

### Subdomain vs Path Architecture

```
Standard:   https://example.sh/~username
Subdomain:  https://username.example.sh   ← envs.net, remotes.club
```

Subdomains require wildcard DNS (`*.example.sh`) + wildcard cert (Certbot DNS challenge). More professional; worth the setup cost.

---

## 5. Funding

→ For detailed funding models, economics, and real cost data: **read `references/sustainability.md`**

```
Funding model?
│
├── Free + Donations     → Most common (tilde.team, tilde.town)
├── Tiered Membership    → sdf.org: free → ARPA ($9/yr) → MetaARPA ($36/yr)
├── Freemium             → tilde.org (25MB free, paid tiers)
├── Non-Profit Donation  → arbornet.org (501c3 + Amazon affiliate)
└── Cash-Neutral         → skylab.org (27+ years, break-even)
```

A minimal pubnix runs on **$5–10/month** (Contabo, Hetzner, Linode). The community matters more than the hardware.

---

## 6. Community Building

### The Two Virtuous Cycles (ctrl-c.club's model)

```
R1 — Activity Begets Activity:
  More active users → more interesting IRC/content → more new users

R2 — Knowledge Begets Knowledge:
  More shared knowledge → lower barrier → more capable users → more knowledge
```

Seed both loops early: be active in IRC yourself, write guides, invite curious people.

### IRC is the Heartbeat

Join **tilde.chat** immediately. Create `#yourtilde`. Encourage users to idle there. blinkenshell.org explicitly expects members to "hang around" in IRC — this is how community forms.

### Signup UX

| Method | Used by | Tradeoff |
|--------|---------|----------|
| Web form | Most tildes | Easy but spam-prone |
| Email to admin | spuos.net | Personal but slow |
| SSH-based reg | tilde.fun | Clever, requires SSH key upfront |
| Web shell | picrofo.com | No SSH client needed |
| Invite-only | crime.team | Safe space, curated, limits growth |

---

## 7. Anti-Patterns

**❌ Starting too big** — Launch with shell + web. Add services in response to user requests, not anticipation.

**❌ No succession plan** — Single admin with no documented handoff. When burnout hits, the tilde dies. Document everything in Ansible; designate a successor early.

**❌ Vague CoC** — "Be nice" is not a CoC. Write what "nice" means, what happens when it isn't, and who enforces it.

**❌ Over-locking users** — So restricted users can't run `screen`, `tmux`, or install to `~/.local`. Use resource limits (cgroups) rather than capability removal. Tinkering is the point.

**❌ Treating it as a sysadmin project** — The servers are the easy part. Every admin who burned out did so because they neglected the community side.

**❌ Password auth in SSH** — Never. SSH keys only, always.

---

## 8. ⚠️ Sharp Edges

| Issue | Severity | Lesson from |
|-------|----------|-------------|
| Admin burnout, no successor | Critical | grex.org shutdown 2023 |
| All secrets only in admin's head | Critical | thunix.net — always document |
| Webserver misconfigured: users read each other's files | Critical | Test with unprivileged account |
| Email with no SPF/DKIM/DMARC | High | Set up before first user email |
| No disk quotas at launch | High | Set quotas on day 1, not after |
| User isolation — one user kills all | High | Use cgroups/systemd slices |
| SSH brute force | High | fail2ban + key-only auth |
| Growing too fast | Medium | tilde.club closed signups early |
| Never testing as a non-admin | Medium | Always have a test unprivileged account |

---

## Quick Reference

For real tilde examples and case studies → **read `references/tildes.md`**
