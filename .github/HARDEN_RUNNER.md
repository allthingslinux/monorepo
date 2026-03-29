# Harden Runner usage

We use [step-security/harden-runner](https://github.com/step-security/harden-runner) on **Ubuntu** jobs that perform network access during CI (installs, deploys, codecov, etc.) with `egress-policy: audit` unless a job requires an allow list.

## Standard

- **Apply** to jobs that: install packages, call external APIs, or deploy.
- **Default**: `egress-policy: audit` so unexpected egress is visible in logs.

## Exceptions (typically omit harden-runner)

- **Reusable workflows** that only run short trusted commands and you want minimal overhead (e.g. `reusable-py-check.yml`) — optional; add if you want parity.
- **`pull_request_target`** workflows that only call a single trusted action and do not checkout untrusted code (e.g. `pr-title.yml`).
- **Self-hosted** runners (not applicable in this repo today).

## Pin

Keep the same full commit SHA across workflows unless upgrading deliberately; note the bump in the PR description.
