---
title: Restore release-please-style version headers in changesets CHANGELOG.md
date: 2026-05-21
status: approved
owner: alexandr@cow.fi
---

# Restore release-please-style version headers in changesets CHANGELOG.md

## Why

When the repo switched from `release-please` to `@changesets/cli` (see
[2026-05-13-changesets-migration-design.md](./2026-05-13-changesets-migration-design.md)),
the version headers in `CHANGELOG.md` files regressed from

```
## [3.10.2](https://github.com/cowprotocol/cowswap/compare/cowswap-v3.10.1...cowswap-v3.10.2) (2026-05-14)
```

to

```
## 3.12.0
```

The richer header — link to the GitHub compare view plus the release date — is
useful for skimming history and matches the format readers expect from the
existing CHANGELOG.md files (most of which were written by release-please).

The header is emitted by `@changesets/apply-release-plan`, not by the
configured changelog plugin (`@changesets/changelog-github`), so it cannot be
restored via plugin configuration. We post-process instead.

## Approach

A new Node script, `tools/scripts/format-changelog-headers.mjs`, runs
immediately after `changeset version` and rewrites the topmost plain
`## X.Y.Z` header in each tracked package's `CHANGELOG.md` to the
release-please-style format.

The script is wired in two places:

1. `package.json`: `"changeset:version"` runs `changeset version && node tools/scripts/format-changelog-headers.mjs`.
2. `.github/workflows/release.yml`: the `changesets/action` step calls
   `pnpm changeset:version` (instead of `pnpm changeset version`) so the
   formatter runs inside the action's commit lifecycle.

## Algorithm

For each `path` in `tools/release/tracked-packages.json`:

1. Read `<path>/package.json` (skip if missing or has no `name`).
2. Read `<path>/CHANGELOG.md` (skip if missing).
3. Match the topmost plain version header: `/^## (\d+\.\d+\.\d+(?:-[\w.]+)?)\s*$/m`.
4. If no match → skip (already formatted, or no entry yet).
5. If matched version ≠ `pkg.version` → skip (no fresh bump this run).
6. Find the *next* version header below the matched one, accepting either
   plain (`## X.Y.Z`) or already-formatted (`## [X.Y.Z]`) form. That version is
   `prev`.
7. Compute `shortName`: same logic as `detect-pending-releases.mjs` —
   `pkg.name.includes('/') ? pkg.name.split('/').pop() : pkg.name`.
8. Read `repo` from `.changeset/config.json` (the second element of
   `changelog` is `{ repo: 'cowprotocol/cowswap' }`).
9. `date = new Date().toISOString().slice(0, 10)` (UTC).
10. Rewrite the matched header:
    - With prev: `## [VER](https://github.com/REPO/compare/SHORT-vPREV...SHORT-vVER) (DATE)`
    - First release (no prev): `## [VER](https://github.com/REPO/releases/tag/SHORT-vVER) (DATE)`
11. Write the file back.

## Test plan

`tools/scripts/format-changelog-headers.test.mjs` using `node --test` and a
tmp directory fixture (mirroring `commits-to-changesets.test.mjs`). Cases:

| Case | Input top header | Expected output |
|---|---|---|
| Normal bump with prior version | `## 3.12.0`, next: `## 3.11.0` | `## [3.12.0](.../compare/cowswap-v3.11.0...cowswap-v3.12.0) (TODAY)` |
| Prior is release-please-style | `## 3.10.3`, next: `## [3.10.2](...) (...)` | compare link uses `3.10.2` as prev |
| First release | `## 1.0.0`, no other headers | `## [1.0.0](.../releases/tag/foo-v1.0.0) (TODAY)` |
| Already formatted (no-op) | `## [3.12.0](...) (...)` | unchanged |
| No bump this run | top is `## 3.12.0` but `pkg.version` is `3.11.0` | unchanged |
| Pre-release version | `## 4.0.0-beta.1`, next: `## 3.9.0` | compare link includes `4.0.0-beta.1` |
| Scoped name | pkg `@cowprotocol/wallet` | tag prefix is `wallet-v` |
| Unscoped name | pkg `cowswap-monorepo` | tag prefix is `cowswap-monorepo-v` |

The script is also added to `pnpm test:tools` via the existing
`node --test tools/scripts/*.test.mjs` glob — no change needed to the test
runner.

## Out of scope

- Reformatting historical headers. Old release-please entries already have the
  correct format; old changesets-era entries (e.g. `## 3.12.0`, `## 3.11.0`)
  stay as-is. Only the just-bumped top header is touched on each run.
- Changing the content of release notes (bullets). The `@changesets/changelog-github`
  plugin still produces those.
- Changing the GitHub release body produced in `release.yml`'s `Create tags and
  GitHub releases` step. That step reads notes via `awk` between the first two
  `## ` lines and is agnostic to header content.
