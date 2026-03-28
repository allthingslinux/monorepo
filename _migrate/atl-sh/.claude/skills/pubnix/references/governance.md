# Governance Deep Reference

## Governance Models in Detail

### Anarcho-Monarchist (tilde.town)

The most battle-tested model for general-purpose tildes. tilde.town has run for 10+ years with 3,000 users on this structure.

**How it works:**
- Users self-govern via Code of Conduct for day-to-day issues
- Admin (~vilmibm) intervenes only when self-governance fails
- Root access limited to 3–4 people maximum
- Deputization: temporary sudo granted for specific needs, then revoked
- Admin is explicit about capabilities: "root sees all and can do all"

**Why transparency about admin power works:**
Users who join knowing root can read their files are self-selected for comfort with shared systems. Pretending otherwise creates false expectations and erodes trust when reality emerges. Stating it openly actually builds trust.

**When self-governance fails:**
- Repeat CoC violators (requires admin intervention to ban)
- Disputes that IRC/community can't resolve
- Security incidents

**Admin contact pattern:**
- IRC `!admins` command → pings all online admins
- Direct message to operator accounts
- Not email (too slow for community issues)

### Single Admin (tilde.team)

~ben runs tilde.team alone. 1,224 users. Low overhead, high bus-factor.

**What makes it work:**
- Ansible IaC means the server can be rebuilt without ~ben
- All credentials documented (somewhere ~ben trusts)
- Clear "this is a hobby project" expectations set with users
- tilde.chat IRC handles most community issues organically

**Bus-factor mitigation:**
- Infrastructure-as-code is non-negotiable
- At minimum: document all credentials + server access in a secure location
- Designate a "break glass" person who can take over

### Non-Profit (sdf.org, arbornet.org)

**sdf.org**: 501(c)(7) (social club). Enables tiered dues, legitimizes the organization.
**arbornet.org**: 501(c)(3) (charitable). Enables tax-deductible donations, Amazon affiliate.

**501(c)(3) vs 501(c)(7):**
- 501(c)(3): Charitable, educational, or religious purpose. Donors can deduct. More restrictions.
- 501(c)(7): Social club. Members pay dues. Less restriction. sdf.org model.

**When to pursue non-profit status:**
- You want formal structure beyond personal liability
- You're collecting significant donations
- You want tax benefits for donors
- You're planning 10+ year operation

### Leadership Succession (thunix.net model)

thunix.net has had **3 smooth transitions** since founding in 2017:
1. hexhaxtron → ubergeek (2018)
2. ubergeek → deepend (2023)

**What made each transition work:**
- Each transition was planned before it was necessary
- Infrastructure was documented (IaC-based)
- Community was notified publicly
- New admin was introduced to community before taking over
- Old admin remained reachable for questions

**Succession checklist:**
- [ ] Document all credentials in a secure shared location
- [ ] Ansible/IaC means server is rebuildable by anyone
- [ ] Designate successor before you need one
- [ ] Test: can successor access and operate server without you?
- [ ] Public announcement when transitioning
- [ ] Archive all content even if shutting down

### Graceful Shutdown (grex.org model)

grex.org ran from the early 1990s until 2023. The shutdown was handled well.

**What graceful shutdown looks like:**
- Announcement well in advance (not sudden)
- Clear end date communicated to users
- Content archived and made available
- Forwarding information for where users can go
- Gratitude expressed to community

**The lesson**: Plan for closure from the start. Where will user data go? How will you notify them? What's the archive plan?

### Admin Sacred Vows (tilde.club model)

Paul Ford's original admin commitment email to tilde.club users established a pattern worth adopting explicitly. State these promises publicly when you launch:

1. **Backup promise**: Regular backups of user public_html directories — when someone hacks in, you can restore
2. **Shutdown warning**: No shutdown without a month of advance notice
3. **Archive commitment**: On shutdown, all public content archived and uploaded to archive.org
4. **Community preservation**: If a community forms, don't dissolve it without pointing users to alternatives (IRC, other tildes, etc.)

These are the minimum promises that make users feel safe investing time in your tilde. Write them on your about page. People will hold you to them — that's the point.

---

## Code of Conduct

### Minimum Viable CoC

Every pubnix needs a CoC. The minimum:
1. State community values explicitly
2. Define acceptable/unacceptable behavior with examples
3. Describe the escalation path (self → community → admin)
4. Name who enforces it and how
5. Set expectations for response time
6. Date and version it

### tilde.club's Approach ("No Drama" rule)

Simple but effective:
- Be welcoming and helpful to new users
- Don't laugh at or belittle anyone
- No drama — if you have a problem, address it directly or bring it to admin
- Volunteer-led means if you want something, help make it happen

### rawtext.club's Approach (social contract membership)

cmccabe frames membership as a social contract rather than a transaction: "You pay to be a member of rawtext.club by being an active community member — make neat things, test out what others have made, and teach others what you know. You can't buy a community like this."

This model:
- No money changes hands, no ads, no data selling
- Active participation *is* the currency
- Creates self-selection: people who join for consumption drift away; people who stay become creators
- Resource minimalism enables it: 1GB RAM, 25GB disk VPS — a whole social club on a tiny server

Contrast with sdf.org's tiered dues model: both work, but rawtext.club's model shapes community character differently — everyone there is there for intrinsic reasons.

### blinkenshell's Approach (vouch system + quiz)

blinkenshell uses a multi-step signup process that's deliberately friction-heavy to filter out non-serious users:

1. **Email verification** — basic bot filter
2. **Rules quiz** (~20 questions) — must demonstrate knowledge of rules and basic shell commands before getting an account
3. **Join IRC** — required, not optional; forces community contact
4. **Two vouches from existing members** — each existing member gets 1 vouch token/day (max 2 stored); requires two *different* users to approve; negative vouches possible
5. **Waiting period** — minimum 1 hour between signup creation and activation

**How the vouch token works:** Members spend tokens to vouch for applicants. If they vouch for bad actors, their own account is at risk. Negative vouches subtract from an applicant's score. This creates accountability — vouching is not free.

**Paid bypass:** Supporter accounts skip the vouch queue — paid users skip straight to step 3 (or can pay 50 SEK for instant activation). This is explicit: paying = trust signal.

**The mechanism:** A special SSH user (`signup/signup23`) exists solely to run the signup CLI — users never get a shell until fully approved. Similar to tilde.fun's ssh-reg but more elaborate.

**Why it works for blinkenshell:** Their IRC-centric culture makes "must join IRC" natural, not punitive. The quiz filters people who won't follow the rules. The vouch system makes the community self-policing. Been running since 2007.

**Trade-off:** High friction means slower growth. For a community that values quality over quantity, this is correct. Blinkenshell has been intentionally small-ish and stable for 18+ years.

### crime.team's Approach (curated safe space)

- Invite-only signup via Google Form
- Explicit about who the space is for (trans women/CAMAB non-men)
- Curation is the safety mechanism, not just rules
- Small size (23 members) makes enforcement tractable

### Enforcement Principles

**Self-governance first**: Most issues resolve without admin involvement if the community has strong norms and active IRC culture.

**Admin as appeal, not first resort**: Treat admin intervention as the exception, not the rule. If every minor dispute goes to admin, you'll burn out.

**Consistency matters more than strictness**: A mild CoC enforced consistently is better than a strict one enforced arbitrarily.

**Document enforcement actions**: Not publicly, but keep a private log. Patterns matter — repeat violations need escalating responses.

---

## Root Access Philosophy

**Principle of minimal root**: Only the number of people absolutely necessary should have root. For most tildes, this means 1–3 people.

**Deputization pattern** (tilde.town):
- Grant temporary sudo for specific, scoped tasks
- Revoke when task is complete
- Never make permanent sudo a default for helpers

**What root access enables (be explicit with users):**
- Read all files (including private ones)
- See all processes and their arguments
- Log all shell activity (if configured)
- Access email content

Being explicit about this upfront is non-negotiable for trust.

---

## Communication Medium as Community Design

cmccabe (founder of rawtext.club) made a deliberate choice: **no IRC** as the primary communication channel. IRC is real-time and synchronous; rawtext.club uses async communication (bulletin board, email). The reasoning draws on media theorists:

> "The way people communicate can shape the type of interaction users have." — cmccabe, citing Marshall McLuhan and Neil Postman

**McLuhan's insight**: The medium is the message. IRC creates fast, reactive, ephemeral conversation. Async formats (BBJ, email, phlog) create reflective, considered exchange.

**Practical implication for tilde admins**: Choose your communication tools deliberately, not by default. IRC is the tilde standard — but that means your community will develop IRC culture (fast, reactive, present). If you want a different texture (slower, more thoughtful, more writing-focused), choose a different medium. Both are valid; neither is accidental.

**rawtext.club's result**: Distinctly different community feel from IRC-centric tildes. Smaller, but coherent around a particular kind of interaction.

This principle also applies to *within* a tilde's services: offering a bulletin board (BBJ) alongside IRC gives users a choice of pace.

---

## Joining the Tildeverse

If you want your tilde to become an official tildeverse member (listed on tildeverse.org, part of tilde.chat):

**Criteria:**
1. Server online and stable for an extended period — at least a year
2. Admin has good standing within the community
3. Admin/server expresses interest in sharing or collaborating on services
4. A `#yourtilde` channel on the tilde.chat IRC network
5. Tilde aligns with tildeverse codes of conduct

**Process:** Make a request to existing tildeverse member admins. All current admins discuss and vote — admission, rejection, or a trial period.

**Timeline context:** tilde.chat itself formed April–June 2018 when tilde.team, tilde.town, and yourtilde.com created a shared IRC network, then registered tildeverse.org to coordinate. Members were admitted over subsequent years as the community grew. Don't rush to join — establish community first.
