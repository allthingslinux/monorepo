# Contribute to the documentation

Thank you for helping improve **All Things Linux** documentation. ATL is a volunteer-driven **501(c)(3)** non-profit Linux community ([allthingslinux.org](https://allthingslinux.org)). This site lives in the monorepo under `apps/docs` and deploys with [Mintlify](https://mintlify.com). For who we are and ecosystem names, see the published **About** page (`about.mdx`).

## How to contribute

### Edit on GitHub

1. Open the page on the published docs site (when available) or browse [`apps/docs` in the monorepo](https://github.com/allthingslinux/monorepo/tree/main/apps/docs).
2. Use GitHub’s editor or your local clone to change the relevant `.mdx` file or `docs.json`.
3. Open a pull request against `main` (or the default branch your team uses).

### Local development

1. Clone [allthingslinux/monorepo](https://github.com/allthingslinux/monorepo).
2. Install dependencies from the repo root: `pnpm install`.
3. Run `pnpm --filter @atl/docs dev` and edit under `apps/docs`.
4. Before opening a PR: `pnpm --filter @atl/docs exec mint validate` and `mint broken-links`.

See [development.mdx](development.mdx) and [contributing.mdx](contributing.mdx) for details.

## Writing guidelines

- **Active voice**: “Run the command” not “The command should be run.”
- **Address the reader** with “you.”
- **One idea per sentence** where possible.
- **Lead with the goal** in procedural sections.
- **Consistent terminology** — align with [AGENTS.md](AGENTS.md).
- **Examples** over abstract descriptions when teaching a workflow.

## Mintlify dashboard (Pro)

Maintainers configure hosted features in the [Mintlify dashboard](https://dashboard.mintlify.com). After upgrading to Pro, confirm the following at least once (settings live in the product, not in git):

1. **Assistant** — Enabled; **deflection email** or contact path when the model cannot answer; optional **starter questions**; **tier / overages / usage alerts** appropriate for the team budget.
2. **Search domains** (optional) — Only if the assistant should supplement docs with approved public URLs.
3. **GitHub app** — Connected so merges deploy previews and production as expected.

## Analytics review (monthly)

Use Mintlify **Analytics** in the dashboard on a recurring schedule (for example monthly):

1. Filter **human** vs **AI** traffic and note trends after major doc changes.
2. Review **Assistant** categories and exported conversations for recurring gaps; add or clarify pages accordingly.
3. For humans, review **search** queries and low click-through results.
4. For AI agents, review **MCP searches** (if shown) to improve headings and descriptions.

Export CSV when you need deeper analysis outside the dashboard.

## Mintlify Agent (evaluation)

The [Mintlify Agent](https://mintlify.com/docs/agent) can propose documentation updates from PRs, Slack, Linear, or the Agent API. We have not committed to a default workflow in this repository.

**When evaluating:**

- Read [Agent workflows](https://mintlify.com/docs/agent/workflows) and [automate-agent](https://mintlify.com/docs/guides/automate-agent) for fit with our monorepo and review process.
- Align automation with [AGENTS.md](AGENTS.md) and [`.mintlify/Assistant.md`](.mintlify/Assistant.md) so generated text matches terminology and boundaries.
- Prefer trials on a branch or staging project before enabling broad auto-merge.

Record any team decision in GitHub discussions or internal runbooks when you adopt or reject the agent.

## Coverage of Mintlify’s own documentation

Mintlify publishes a full page list at `https://www.mintlify.com/docs/llms.txt`. Periodically skim new or updated paths (or diff `llms.txt` month to month) so we adopt relevant features (components, `docs.json` keys, deploy options) intentionally rather than by surprise.

## Assistant behavior in git

- **[`.mintlify/Assistant.md`](.mintlify/Assistant.md)** — Hosted assistant system prompt additions (tone, ATL context, escalation).
- **[`AGENTS.md`](AGENTS.md)** — Instructions for humans and coding agents editing this repo; keep both aligned.

---

Questions? Open an issue or discussion on [github.com/allthingslinux](https://github.com/allthingslinux).