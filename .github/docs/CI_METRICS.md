# CI workflow metrics

Use this for the “validate with metrics” rollout: compare median duration and queue time before and after workflow changes.

## Recent runs for a workflow

```bash
OWNER_REPO="allthingslinux/monorepo"   # adjust
WORKFLOW="portal-ci.yml"

gh run list --repo "$OWNER_REPO" --workflow "$WORKFLOW" --limit 30 \
  --json databaseId,conclusion,createdAt,updatedAt,event \
  --jq '.[] | {id: .databaseId, conclusion, createdAt, event}'
```

## Duration (created → updated)

```bash
gh run list --repo "$OWNER_REPO" --workflow "$WORKFLOW" --limit 50 \
  --json databaseId,createdAt,updatedAt,conclusion \
  --jq '.[] | select(.conclusion=="success") |
    ((.updatedAt | fromdateiso8601) - (.createdAt | fromdateiso8601)) as $s |
    {id: .databaseId, seconds: $s}'
```

## Job-level timing for one run

```bash
RUN_ID=12345678901
gh run view "$RUN_ID" --repo "$OWNER_REPO" --json jobs \
  --jq '.jobs[] | {name: .name, status: .status, started: .startedAt, completed: .completedAt}'
```

## Optional: Turbo remote cache

Remote caching is **not** enabled by default. To experiment in CI, set `TURBO_TOKEN` and `TURBO_TEAM` (or vendor-specific vars) as repository secrets and pass them into jobs that run `turbo`. Document any adoption in this file when enabled.
