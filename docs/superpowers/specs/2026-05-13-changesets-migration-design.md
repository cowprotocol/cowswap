---
title: Migrate monorepo release tooling from release-please to changesets
date: 2026-05-13
status: approved
owner: alexandr@cow.fi
---

# Migrate monorepo release tooling from release-please to changesets

## Why

`release-please` walks commit history through GitHub's GraphQL `Commit.history()`,
which returns commits in **committer-date order** and stops as soon as it sees
the previous release commit SHA. When a long-lived branch is merged into the
release branch mid-cycle, its commits carry their original (older) committer
dates and end up "behind" the previous release SHA in the date-ordered walk —
release-please skips them. This produced concrete data loss
(e.g. PR #7397 missing from a release) and is the trigger for this migration.

Changesets, driven by a converter that uses `git log <tag>..HEAD`, is
**reachability-based**: a commit is included if it is reachable from `HEAD`
but not from the baseline tag, regardless of its committer date. The merge-late
scenario stops being a hazard.

The migration also has to preserve three things the team relies on today:

1. All existing `CHANGELOG.md` files keep their full history.
2. All app/lib versions in `package.json` stay where release-please left them.
3. The existing npm publishing GitHub Action (Nx-based) keeps working.

## Constraints decided up front

| Decision | Choice | Rationale |
|---|---|---|
| Bump source | Derived from conventional commits via a custom converter | Preserves existing contributor workflow (commitlint already enforces conventional commits). |
| Tracking scope | 28 packages tracked (4 apps + 24 libs); 8 libs published | Mirrors the set of packages with existing `CHANGELOG.md` files. Apps + non-publishable libs keep their `CHANGELOG.md` and `package.json` version bumps. |
| Changelog format for new entries | `@changesets/changelog-github` (flat list + PR/author links) | Standard, low-maintenance. Old entries (emoji sections) stay intact above new entries. |
| Publish command | `pnpm exec nx release publish` (unchanged) | Minimal CI risk. `prepare-publish.mjs` continues to resolve `workspace:*` deps. |
| Release trigger | `push: main` (unchanged from today) | Same flow contributors already understand. |

## Architecture

```
                      push to main
                           │
                           ▼
            ┌──────────────────────────────┐
            │ .github/workflows/release.yml│
            │                              │
            │  1. commits-to-changesets    │  (custom script)
            │     parses conv. commits     │
            │     → writes .changeset/*.md │
            │                              │
            │  2. changesets/action@v1     │  (official action)
            │     - if .changeset/*.md     │
            │       present → open/update  │
            │       "Version Packages" PR  │
            │     - if PR was just merged  │
            │       → published = true     │
            └──────────────┬───────────────┘
                           │
                           ▼
          ┌────────────────────────────────────┐
          │ Version Packages PR (auto-opened)  │
          │  - bumps package.json versions     │
          │  - appends CHANGELOG.md entries    │
          │  - removes consumed .changeset/*   │
          └────────────────┬───────────────────┘
                           │ merge
                           ▼
            ┌──────────────────────────────┐
            │  publish job (existing one)  │
            │  - nx build (8 publish libs) │
            │  - prepare-publish.mjs       │
            │  - nx release publish        │
            │  - tag release-<ISO>         │
            └──────────────────────────────┘
```

Two new units of code: one converter script and one workflow file. Everything
else either stays or is deleted.

## Component: commit-to-changeset converter

**Path**: `tools/scripts/commits-to-changesets.mjs`

**Responsibility**: walk commits since the last release tag, emit one
`.changeset/auto-<short-sha>-<pkg>.md` per `(commit, affected-package)` pair.

### Baseline discovery

```
BASELINE_REF env var (workflow_dispatch override)
  └── if unset: git describe --match 'release-*' --abbrev=0
       └── if no tag exists: log warning + exit 0 (no changesets emitted)
```

Baseline is **always** a git ref (tag or SHA). Dates are never used. The
"no baseline at all" case happens exactly once — on the push event fired by
the migration PR's own merge, before any `release-*` tag exists. In that case
the converter exits 0 with a clear message ("No baseline tag found; pass
`baseline_ref` via workflow_dispatch to bootstrap"), `changesets/action` sees
no `.changeset/*.md` files and does nothing. The operator then runs
`workflow_dispatch` with `baseline_ref` set to the migration merge SHA.

### Walk command

```
git log --no-merges --reverse "$BASELINE..HEAD"
```

- `--no-merges`: merge commits ("Merge branch 'develop'") aren't conventional, so we skip them. The content commits they bring in are still included because each is reachable from `HEAD`.
- `--reverse`: oldest first, for deterministic, idempotent changeset filenames.
- **Not** `--first-parent`: that would skip commits on merged branches that are exactly the case we're trying to capture.

### Bump derivation

| Commit type / marker | Bump |
|---|---|
| `BREAKING CHANGE:` footer, or `<type>!:` in subject | `major` |
| `feat` | `minor` |
| `fix`, `perf`, `refactor`, `docs`, `test`, `chore`, anything else | `patch` |

Unparseable commits → `patch` + warning log. Releases must not be unblockable.

### Affected-package detection

For each commit:

1. `git diff --name-only <commit>^ <commit>` → list of touched files.
2. For each file, find the longest matching package path from
   `tools/release/tracked-packages.json`.
3. Collect the unique set of affected packages.
4. Files outside any tracked package (root configs, `tools/`, `docs/`,
   `apps/cowswap-frontend-e2e`, `apps/sdk-tools`, `apps/storybook`) are
   ignored. If a commit touches **only** untracked paths, no changeset is
   emitted.

### Output format

```markdown
---
"@cowprotocol/events": minor
---

feat: bring cow.fi back (sdk) (#7359)
```

- Filename: `.changeset/auto-<short-sha>-<pkg-slug>.md` (deterministic for idempotency).
- Summary line: the commit subject as-is. `@changesets/changelog-github` hydrates it with PR + author links during `changeset version`.
- One file per `(commit, package)` pair. Multi-package commits produce multiple files.

### Idempotency

Before writing each file, check if it exists; skip if it does. Safe to re-run
(e.g., `workflow_dispatch` retries).

### Explicitly out of scope

- Transitive workspace-dep bumps (handled by `changesets` `updateInternalDependencies: "patch"`).
- Manual hand-written `.changeset/*.md` from contributors (the converter doesn't touch files it didn't create; manual and auto coexist).

## Component: tracked-packages registry

**Path**: `tools/release/tracked-packages.json`

Single source of truth for the 28 tracked package paths. Consumed by the
converter and a unit test that asserts the file matches the set of `package.json`
files in `apps/*` and `libs/*` that are *not* in the untracked allowlist
(`cowswap-frontend-e2e`, `sdk-tools`, `storybook`).

Format:

```json
{
  "packages": [
    "apps/cow-fi",
    "apps/cowswap-frontend",
    "apps/explorer",
    "apps/widget-configurator",
    "libs/abis",
    "libs/analytics",
    "libs/assets",
    "libs/balances-and-allowances",
    "libs/common-const",
    "libs/common-hooks",
    "libs/common-utils",
    "libs/core",
    "libs/currency",
    "libs/ens",
    "libs/events",
    "libs/hook-dapp-lib",
    "libs/iframe-transport",
    "libs/multicall",
    "libs/permit-utils",
    "libs/snackbars",
    "libs/tokens",
    "libs/types",
    "libs/ui",
    "libs/ui-utils",
    "libs/wallet",
    "libs/wallet-provider",
    "libs/widget-lib",
    "libs/widget-react"
  ]
}
```

## Component: changesets config

**Path**: `.changeset/config.json`

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.0/schema.json",
  "changelog": [
    "@changesets/changelog-github",
    { "repo": "cowprotocol/cowswap" }
  ],
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

- `commit: false` → action opens a PR rather than direct-committing.
- `baseBranch: "main"` → same release branch as today.
- `updateInternalDependencies: "patch"` → mirrors release-please's `node-workspace` cascade.
- `ignore: []` → empty by design. Non-publishable packages are excluded via
  `"private": true` on each package, not here — `ignore` would prevent
  versioning entirely, but we still want CHANGELOG.md updates for apps and
  non-publishable libs.

## Component: package privacy flags

Target state:

| Set | Count | `"private": true`? |
|---|---|---|
| Publishable libs (`events`, `currency`, `types`, `permit-utils`, `widget-lib`, `widget-react`, `iframe-transport`, `hook-dapp-lib`) | 8 | **no** |
| Non-publishable libs (`abis`, `analytics`, `assets`, `balances-and-allowances`, `common-const`, `common-hooks`, `common-utils`, `core`, `ens`, `multicall`, `snackbars`, `tokens`, `ui`, `ui-utils`, `wallet`, `wallet-provider`) | 16 | **yes** |
| Apps (`cowswap-frontend`, `explorer`, `cow-fi`, `widget-configurator`) | 4 | **yes** |
| **Total tracked** | **28** | — |

Implementation step in the migration PR: audit all 28 tracked `package.json`
files, set `"private": true` on the 20 non-publishable ones if not already.
The 8 publishable libs must NOT have `"private": true`; `prepare-publish.mjs`
keeps its existing safety net (warn + strip) as defense-in-depth.

Some packages may already have `"private": true` (e.g., `libs/ui`); the audit
step is a no-op for those. The principle: publishable ⇔ `private` absent;
everything else ⇔ `"private": true`.

## Component: GitHub workflow

**Path**: `.github/workflows/release.yml` (replaces `release-please.yml`)

### Trigger

```yaml
on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      baseline_ref:
        description: "Override baseline (commit SHA or tag). Leave empty to use latest release-* tag."
        required: false
```

### Job 1: `release`

Outputs: `published` (gate for job 2).

Permissions: `contents: write`, `pull-requests: write`.

Steps:

1. `actions/checkout@v4` with `fetch-depth: 0`, `fetch-tags: true`, and the
   reused `RELEASE_PLEASE_AUTH` token. **Fetch depth and tags are essential**
   — without them `git log $TAG..HEAD` silently returns nothing.
2. `pnpm/action-setup` + `actions/setup-node` (same pins as today).
3. `pnpm install --frozen-lockfile`.
4. `node tools/scripts/commits-to-changesets.mjs` (with `BASELINE_REF` env
   from the workflow input).
5. `changesets/action@v1` with:
   - `version: pnpm changeset version`
   - `publish: echo "publish handled in next job"` (no-op; the `published`
     output is what we want).
   - `commit: "chore(main): release"`, `title: "chore(main): release"`.
   - `createGithubReleases: false`.

How the action's behavior maps to the two states we care about:

- **`.changeset/*.md` files present on main** → action opens/updates
  `changeset-release/main` Version PR; sets `published=false`. Job 2 skipped.
- **No `.changeset/*.md` files but package versions ahead of npm** → action
  detects publishable bumps, runs the (no-op) publish command, sets
  `published=true` + `publishedPackages`. Job 2 runs.

The action ignores private packages when computing `published`, so the gate
fires only when at least one of the 8 publishable libs has a bump.

### Job 2: `publish`

Identical to the current publish job, gated on `needs.release.outputs.published == 'true'`. New final step:

```yaml
- name: Tag release baseline
  run: |
    TAG="release-$(date -u +%Y%m%dT%H%M%SZ)"
    git tag -a "$TAG" -m "Release published at $TAG"
    git push origin "$TAG"
```

This tag becomes the converter's baseline for the next run, eliminating the
need for `workflow_dispatch` after the first run.

## Migration sequence

Lands as **one PR** so the repo never sits in a half-migrated state.
Internally ordered for review readability:

1. **Add new infra (no behavior change)**
   - `tools/release/tracked-packages.json`
   - `tools/scripts/commits-to-changesets.mjs`
   - `tools/scripts/commits-to-changesets.test.mjs` with fixtures:
     - feat commit → minor
     - fix commit → patch
     - `feat!:` → major
     - `BREAKING CHANGE:` footer → major
     - non-conventional commit → patch + warning
     - commit touching two packages → two changesets
     - commit touching only `tools/` → no changeset
     - re-run produces no new files (idempotency)
   - `.changeset/config.json` + `.changeset/README.md`
   - `package.json`: devDeps `@changesets/cli`, `@changesets/changelog-github`;
     scripts `"changeset"`, `"changeset:version"`.
2. **Flip privacy flags** on 20 non-publishable packages (one-line diffs).
3. **Swap the workflow**
   - Add `.github/workflows/release.yml`.
   - Delete `.github/workflows/release-please.yml`,
     `release-please-config.json`, `.release-please-manifest.json`.

The secret rename `RELEASE_PLEASE_AUTH` → `RELEASE_BOT_TOKEN` is a follow-up
to avoid coordinating an Actions secret rename with the merge.

## First run

No `release-*` tag exists at merge time, so the converter has no baseline.

Two events happen in order:

1. **Automatic push event** (fires when the migration PR is merged): converter
   finds no baseline → logs warning → exits 0. `changesets/action` runs with
   no `.changeset/*.md` files present and no version discrepancy vs npm → exits
   cleanly. Workflow ends green, having done nothing. This is the desired
   bootstrap state.
2. **Manual `workflow_dispatch`**: operator triggers it with `baseline_ref`
   set to the migration PR's merge SHA. Converter walks
   `git log $MERGE_SHA..HEAD` → zero commits (nothing has merged since) →
   zero changesets emitted. Same outcome as step 1, but now we've smoke-tested
   the converter end-to-end.

The next real PR merged to `main` is the first commit past the baseline.
That push run still finds no `release-*` tag — so the operator needs to use
`workflow_dispatch` with `baseline_ref` once more (pointing at the migration
merge SHA) for the first real release. After that first publish, the publish
job creates `release-<ISO>`, and from then on `git describe` works
automatically — no more manual triggers needed.

## Version + CHANGELOG preservation

- `package.json` `version` fields are untouched by the migration. They stay
  at the values release-please last set (matching `.release-please-manifest.json`,
  which we then delete; `package.json` becomes sole source of truth as
  changesets expects).
- All 28 existing `CHANGELOG.md` files are untouched. `changeset version`
  appends to existing files; it doesn't rewrite them.
- Existing release-please tags (e.g., `events-v4.3.1`) are not deleted. They
  remain valid history. New tags use the `release-<ISO>` pattern; we don't
  retrofit per-package tags.

## Verification

**Before merge**:

1. Run `node tools/scripts/commits-to-changesets.mjs` locally against a known
   commit range. Verify expected `.changeset/*.md` outputs.
2. Run `pnpm changeset version` locally on those generated files. Verify
   versions bump and `CHANGELOG.md` files get appended correctly. **Discard**
   the result (do not commit).
3. Lint the new workflow file with `actionlint` if available.
4. Unit tests for the converter pass (see fixtures list above).

**After merge, before the first real release**:

1. Trigger `workflow_dispatch` with `baseline_ref` = migration merge SHA.
   Expect: zero changesets emitted, no Version PR opened, workflow succeeds.
2. Wait for the next normal PR to merge to `main`. The automatic push run
   will be a no-op (no baseline tag yet) — this is expected.
3. Trigger `workflow_dispatch` again with `baseline_ref` = migration merge SHA.
   Expect: one changeset per touched package, Version PR opens with expected
   bump.
4. Merge the Version PR. Expect: publish job runs, `nx release publish`
   succeeds, `release-<ISO>` tag is pushed.
5. From this point on, push-triggered runs work automatically. Verify by
   merging a second PR and watching the next push run open a new Version PR
   without manual intervention.

## Rollback

- Before the first changesets release publishes anything: revert the
  migration PR. Everything new is removed, release-please files come back,
  npm is untouched.
- After the first changesets release publishes: revert restores
  release-please's workflow files but leaves `package.json` versions ahead
  of `.release-please-manifest.json`. Recovery: a one-time hand-edit of the
  restored `.release-please-manifest.json` to match the new `package.json`
  versions (~26 lines). npm versions cannot be unpublished, so this asymmetry
  is unavoidable.

## Deliverables summary

| Action | Files |
|---|---|
| **New** | `tools/scripts/commits-to-changesets.mjs`, `tools/scripts/commits-to-changesets.test.mjs`, `tools/release/tracked-packages.json`, `.changeset/config.json`, `.changeset/README.md`, `.github/workflows/release.yml` |
| **Modified** | Root `package.json` (devDeps + scripts), 20 package `package.json` files (add `"private": true`) |
| **Deleted** | `.github/workflows/release-please.yml`, `release-please-config.json`, `.release-please-manifest.json` |
| **Unchanged** | All `CHANGELOG.md` files, `nx.json`, `tools/scripts/prepare-publish.mjs`, `commitlint.config.js`, structure of the publish job |
