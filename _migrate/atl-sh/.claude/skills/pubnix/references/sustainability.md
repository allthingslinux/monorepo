# Sustainability Deep Reference

## Funding Models in Detail

### Free + Donations (most common)

**How it works**: Service is free, donations accepted but never required.

**Who uses it**: tilde.team, tilde.town, blinkenshell.org, ctrl-c.club

**Donation platforms**: Ko-fi, Liberapay, Open Collective, direct bank transfer
- Liberapay: recurring donations, open source, no fees on donations
- Ko-fi: one-time and recurring, wider reach
- Open Collective: transparent accounting, fiscal host option

**Making it work:**
- Be clear about actual costs (hosting, domain, time)
- Thank donors publicly (with permission)
- Don't make users feel guilty — donations should feel like gifts
- Have a sustainability page showing costs vs. income

### Tiered Membership

**blinkenshell.org tiers** (clearest example of feature-gating by tier):

| Feature | Free | Supporter |
|---------|------|-----------|
| Disk | 100MB (x4 with compression) | 1000MB (x4) |
| Memory | 128MB RSS | 256MB RSS |
| Background processes | 2 | 5 |
| IRC access | ✔ | ✔ |
| Static website | ✔ | ✔ |
| IRC bouncer (ZNC) | ✗ | ✔ |
| IRC bots | ✗ | ✔ |
| PHP/CGI dynamic site | ✗ | ✔ |
| MySQL database | ✗ | ✔ |
| Custom vhost | ✗ | ✔ |
| Custom TCP/UDP port | ✗ | ✔ |

**Key insight**: Basic access (shell, IRC, static site) is free and genuine. Supporter tiers add resource-intensive features that would otherwise enable abuse or over-consumption. Blinkenshell has run this model since 2006. "Background processes" counts only end-user apps (irssi, email clients) — helper utilities (screen, tmux, sshd, bash) don't count toward the limit.

**sdf.org tiers:**
| Tier | Price | Benefits |
|------|-------|----------|
| Free | $0 | Shell, web, email, 200MB storage |
| ARPA | $9/yr | More storage, VoIP, dialup |
| MetaARPA | $36/yr | Even more, priority support |
| VPM | Higher | Virtual private machine |

**Key insight**: The free tier is genuine and useful. Paid tiers add value without gating basics. This creates a funnel where users who love the service opt up.

**Implementation**: Most tildes use PayPal or Stripe for payment processing. sdf.org built their own account management system over decades — don't start there.

### Freemium (tilde.org)

**tilde.org model:**
- 25MB free with basic shell
- Paid tiers for more storage, better connectivity, virtual computers
- Targeting non-technical users (lowers barrier)

**Difference from tiered**: Freemium implies the free tier is a loss leader to convert to paid. Tiered implies the free tier is genuinely the core offering.

### Non-Profit Status

**arbornet.org** (501(c)(3)):
- Charitable/educational status
- Donations are tax-deductible for US donors
- Required: board of directors, annual filings (Form 990-N for small orgs)
- Enables Amazon affiliate (Amazon donates % of purchases)

**sdf.org** (501(c)(7)):
- Social club status
- Members pay dues
- Less administrative burden than 501(c)(3)
- Does not allow tax-deductible donations

**When to pursue**:
- Planning 10+ year operation
- Collecting >$5k/yr in donations
- Want formal governance structure
- Want legitimacy for grant applications

**US filing**: File Form 1023-EZ (501(c)(3) under $50k/yr) or 1023. Typically $275–600 filing fee.

### Cash-Neutral (skylab.org)

skylab.org has operated since 1997 on a cash-neutral basis: costs exactly covered by donations, no profit, no loss.

**Why it works:**
- Low hosting costs ($10–20/month for a VPS)
- Small, stable user base with high loyalty
- Admin treats it as a public service, not a business
- Portland-based, started on a 486, evolved to cloud

**The math**: $120/year hosting ÷ 12 loyal donors = $10/year each. Very achievable.

---

## Real Cost Data

### Minimal Pubnix (~10-50 users)

| Item | Monthly Cost |
|------|-------------|
| VPS (Contabo/Hetzner) | $5–10 |
| Domain name | $1–2 (amortized) |
| Backups (Backblaze B2) | $1–3 |
| **Total** | **$7–15/month** |

### Growing Pubnix (~100-500 users)

| Item | Monthly Cost |
|------|-------------|
| VPS (2–4 CPU, 4–8GB RAM) | $20–40 |
| Domain + email | $5–10 |
| Backups | $5–10 |
| Monitoring | $0–5 |
| **Total** | **$30–65/month** |

**Reference**: hashnix.club runs on Contabo for budget. envs.net uses Hetzner (Helsinki) for their primary server.

### Historical Context

In the 1990s, people paid $30–40/month (sometimes more) for shared Unix shell accounts — the predecessors to today's tildes. The modern tilde movement inverted this: free access, community-funded, no business model. Paul Ford's framing: "Back in the 1990s some of us paid a lot of money for our tilde accounts. We paid to reach strangers with our weird ideas. Whereas now, brands pay to know users." The price dropped to zero; the spirit remained.

---

## Transparency

### crime.team model

crime.team publishes:
- Monthly costs explicitly
- Donor names (with permission)
- Current balance
- Whether they're operating at deficit or surplus

**Effect**: Users feel invested in the sustainability. Donations increase when people see real numbers.

### Sustainability page template

```markdown
# Sustaining example.sh

## Monthly costs
- Server (Hetzner CX21): €8.21/month
- Domain (example.sh): €15/year
- Offsite backups: €2/month
- **Total: ~€11/month (~€132/year)**

## Current status
[month]: €X received / €11 needed ✅

## How to donate
[Liberapay link] — recurring donations appreciated
[Ko-fi link] — one-time donations

## Donors
Thank you: alice, bob, ~celia (and 3 anonymous donors)
```

---

## Longevity Factors

From studying tildes that have lasted 10–27+ years:

### 1. Sustainable economics
Don't run at a loss. Even tiny recurring donations covering costs create stability. skylab.org (27 years), blinkenshell.org (18+ years) both run on minimal donations.

### 2. Infrastructure as Code
When the admin changes, the server should be rebuildable. Every long-running tilde uses either Ansible, NixOS, or extensive documentation. Those that don't are one admin burnout away from disappearing.

### 3. Community investment
Users who contribute (write guides, help in IRC, maintain community projects) don't leave. Create opportunities for contribution early.

### 4. Clear identity
Tildes with a specific mission or identity outlast generic ones. sdf.org (oldest UNIX system, NetBSD) and tilde.institute (OpenBSD) know exactly what they are.

### 5. Low growth expectations
The most stable tildes aren't trying to grow. They're trying to serve their existing community well. Growth happens organically when the community is healthy.

### 6. Succession planning
Every tilde that's outlasted its founder planned for succession. Every tilde that died when its admin left didn't.

---

## The Platform Evolution Pattern

skylab.org's evolution:
1. 1997: 486 PC in someone's house
2. 2000s: Dedicated server at a colocation facility
3. 2010s: Migrated to cloud VPS
4. 2020s: Modern cloud infrastructure

**The lesson**: The hardware and hosting will change. The community and identity persist. Don't over-invest in infrastructure early — optimize for the community first, infrastructure follows.
