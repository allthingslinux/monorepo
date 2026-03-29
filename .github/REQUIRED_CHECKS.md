# Required checks and merge queue mapping

Use this when configuring branch protection or rulesets for `main`. **Export the live list** from GitHub (Settings → Rules → Rulesets / Branch protection → Required status checks) and reconcile with the table below.

## How to export current required checks

```bash
# Rulesets (org or repo) — requires gh auth and appropriate scope
gh api repos/:owner/:repo/rulesets --jq '.[] | select(.enforcement=="active")'

# Classic branch protection (if used)
gh api repos/:owner/:repo/branches/main/protection/required_status_checks
```

After export, ensure every **required** check has a producing job that runs on `merge_group` when merge queue is enabled. If a workflow is path-filtered and does not run for a merge group entry, the check can stay **pending** and block the queue.

## Workflows → typical check names

| Workflow file           | Jobs (GitHub check name suffix)                                                                              | `merge_group`                   | Notes                                                                                                                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `portal-ci.yml`         | File Detection, Lint, Type Check, Build, Test, Dead Code (Knip), Release                                     | Yes                             | `pull_request` / `push` are path-scoped; `merge_group` is **not** path-scoped. Gated jobs include `merge_group` in their `if:` so checks do not skip. `Release` only on `push` to `main`. |
| `web-deploy.yml`        | File Detection, Deploy, Destroy PR preview                                                                   | Yes                             | `pull_request` / `push` are path-scoped; `merge_group` is **not** path-scoped. On `merge_group`, the Deploy job runs a **Turbo build only** (no Alchemy / Cloudflare deploy).             |
| `chat-ci.yml`           | File Detection, reusable Python check, Test Bridge, Docker \*, Infra Compose Validation, Client Assets Check | Yes                             | `pull_request` / `push` are path-scoped; `merge_group` is **not** path-scoped so required checks always execute for queued merges.                                                        |
| `chat-web-ci.yml`       | Quality                                                                                                      | Yes                             | `pull_request` / `push` are path-scoped; `merge_group` is **not** path-scoped.                                                                                                            |
| `docs-ci.yml`           | Mintlify validate                                                                                            | Yes                             | `pull_request` / `push` are path-scoped; `merge_group` is **not** path-scoped.                                                                                                            |
| `tools-ci.yml`          | Type Check, Lint                                                                                             | Yes                             | `pull_request` / `push` are path-scoped; `merge_group` is **not** path-scoped.                                                                                                            |
| `lint-infra.yml`        | File Detection, Actionlint, Hadolint, Shellcheck                                                             | Yes                             | `pull_request` / `push` are path-scoped; `merge_group` is **not** path-scoped.                                                                                                            |
| `dependency-review.yml` | Review                                                                                                       | Yes                             | Runs on `pull_request` and `merge_group`.                                                                                                                                                 |
| `codeql.yml`            | Analyze (\*)                                                                                                 | Yes                             |                                                                                                                                                                                           |
| `pubnix-ci.yml`         | Ansible Lint, Terraform Validate, ShellCheck                                                                 | Yes                             | `pull_request` / `push` are path-scoped. `merge_group` cannot use `paths` (GitHub limitation), so pubnix runs for every queued merge when this workflow is enabled.                       |
| `pr-title.yml`          | Validate PR Title                                                                                            | No (`pull_request_target` only) | Usually **not** required for merge queue.                                                                                                                                                 |
| `pr-label.yml`          | Label                                                                                                        | No                              | Optional; merge queue typically does not need this.                                                                                                                                       |
| Deploy / maintenance    | Various                                                                                                      | N/A                             | Not usually merge-queue gates.                                                                                                                                                            |

## Operator checklist after changing paths or `if:` conditions

1. For each **required** check, confirm the job runs (not skipped) for a representative `merge_group` run.
2. If a workflow is skipped entirely due to `paths`, remove that check from required rules **or** widen triggers / add a no-op success job.
3. Prefer explicit comparisons for change outputs: `needs.*.outputs.* == 'true'`, never bare string `if: needs.foo.outputs.bar`.

## CI metrics (before / after)

See [CI_METRICS.md](./docs/CI_METRICS.md) for `gh` commands to sample workflow duration and concurrency.

## Harden Runner policy

See [.github/HARDEN_RUNNER.md](./HARDEN_RUNNER.md) for when `step-security/harden-runner` is used and exceptions.
