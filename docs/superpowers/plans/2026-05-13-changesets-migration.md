# Migrate from release-please to changesets — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace release-please with `@changesets/cli` driven by a converter that turns conventional commits into `.changeset/*.md` files, eliminating release-please's date-ordered commit walk bug while preserving CHANGELOG.md files, package versions, and the existing nx-based publish workflow.

**Architecture:** A single workflow on push to `main` runs a custom Node script (`tools/scripts/commits-to-changesets.mjs`) that walks `git log $BASELINE..HEAD` (reachability-based) and writes one changeset per `(commit, affected-package)` pair. Then `changesets/action@v1` opens/updates a Version PR or signals "publish ready". The existing nx-based publish job runs on Version PR merge and tags `release-<ISO>` for the next run's baseline.

**Tech Stack:** Node ESM (`.mjs`), `node:test` built-in test runner, `@changesets/cli`, `@changesets/changelog-github`, `changesets/action@v1`, pnpm workspaces, Nx monorepo.

**Spec reference:** `docs/superpowers/specs/2026-05-13-changesets-migration-design.md`

---

## File layout

| Path | Purpose |
|---|---|
| `tools/release/tracked-packages.json` | Single source of truth: list of 28 package paths the converter operates on |
| `tools/release/tracked-packages.test.mjs` | Asserts the registry matches reality (apps/* + libs/* minus the 3-app allowlist) |
| `tools/scripts/commits-to-changesets-lib.mjs` | Pure functions: conventional-commit parser, file→package mapper, file/content formatters |
| `tools/scripts/commits-to-changesets.test.mjs` | `node:test` unit tests for the pure functions |
| `tools/scripts/commits-to-changesets.mjs` | Main entry: git I/O, file writing, orchestration |
| `.changeset/config.json` | Changesets config |
| `.changeset/README.md` | Brief contributor note |
| `.github/workflows/release.yml` | New release workflow (replaces release-please.yml) |
| `package.json` | Add `@changesets/cli`, `@changesets/changelog-github` devDeps + scripts |
| `apps/cow-fi/package.json`, `apps/cowswap-frontend/package.json`, `apps/explorer/package.json`, `apps/widget-configurator/package.json` | Add `"private": true` |
| `.github/workflows/release-please.yml`, `release-please-config.json`, `.release-please-manifest.json` | **Deleted** |

---

### Task 1: Create the tracked-packages registry + audit test

**Files:**
- Create: `tools/release/tracked-packages.json`
- Create: `tools/release/tracked-packages.test.mjs`

- [ ] **Step 1: Write the failing audit test**

Create `tools/release/tracked-packages.test.mjs`:

```js
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '../..')

// Apps/libs that exist on disk but are intentionally NOT tracked by changesets
// (they have no CHANGELOG.md, are not published, and are not versioned).
const UNTRACKED_APPS = new Set(['cowswap-frontend-e2e', 'sdk-tools', 'storybook'])
const UNTRACKED_LIBS = new Set([])

function expectedPackages() {
  const out = []
  for (const dir of readdirSync(join(rootDir, 'apps')).sort()) {
    if (UNTRACKED_APPS.has(dir)) continue
    if (!existsSync(join(rootDir, 'apps', dir, 'package.json'))) continue
    out.push(`apps/${dir}`)
  }
  for (const dir of readdirSync(join(rootDir, 'libs')).sort()) {
    if (UNTRACKED_LIBS.has(dir)) continue
    if (!existsSync(join(rootDir, 'libs', dir, 'package.json'))) continue
    out.push(`libs/${dir}`)
  }
  return out
}

describe('tracked-packages.json', () => {
  const registry = JSON.parse(
    readFileSync(join(__dirname, 'tracked-packages.json'), 'utf-8'),
  )

  it('matches the set of apps/* and libs/* on disk (minus the untracked allowlist)', () => {
    const expected = expectedPackages()
    assert.deepEqual([...registry.packages].sort(), expected)
  })

  it('every entry has a readable package.json with a name', () => {
    for (const path of registry.packages) {
      const pkg = JSON.parse(readFileSync(join(rootDir, path, 'package.json'), 'utf-8'))
      assert.ok(pkg.name, `${path} package.json missing name`)
    }
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
node --test tools/release/tracked-packages.test.mjs
```

Expected: FAIL with `ENOENT: no such file or directory ... tracked-packages.json`.

- [ ] **Step 3: Create the registry file**

Create `tools/release/tracked-packages.json`:

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

- [ ] **Step 4: Run the test to verify it passes**

```bash
node --test tools/release/tracked-packages.test.mjs
```

Expected: PASS, 2 subtests pass.

- [ ] **Step 5: Commit**

```bash
git add tools/release/tracked-packages.json tools/release/tracked-packages.test.mjs
git commit -m "chore(release): add tracked-packages registry for changesets migration"
```

---

### Task 2: Pure-function library — write the failing tests first

**Files:**
- Create: `tools/scripts/commits-to-changesets-lib.mjs` (stub only — no implementation yet)
- Create: `tools/scripts/commits-to-changesets.test.mjs`

The pure functions are the unit under test. The orchestration script that calls git lives in a separate file (Task 4) so we don't need to mock git for unit tests.

- [ ] **Step 1: Create the stub library**

Create `tools/scripts/commits-to-changesets-lib.mjs`:

```js
// Stub — implementations come in Task 3.
export function parseConventionalCommit(_subject, _body) { throw new Error('not implemented') }
export function resolvePackageForFile(_filePath, _packagePaths) { throw new Error('not implemented') }
export function resolveAffectedPackages(_filePaths, _packagePaths) { throw new Error('not implemented') }
export function changesetFilename(_sha, _pkgPath) { throw new Error('not implemented') }
export function changesetContent(_packageName, _bump, _summary) { throw new Error('not implemented') }
```

- [ ] **Step 2: Write the test file**

Create `tools/scripts/commits-to-changesets.test.mjs`:

```js
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  parseConventionalCommit,
  resolvePackageForFile,
  resolveAffectedPackages,
  changesetFilename,
  changesetContent,
} from './commits-to-changesets-lib.mjs'

describe('parseConventionalCommit', () => {
  it('feat → minor', () => {
    const r = parseConventionalCommit('feat: add foo')
    assert.equal(r.bump, 'minor')
    assert.equal(r.type, 'feat')
    assert.equal(r.breaking, false)
    assert.equal(r.parsedOk, true)
  })

  it('fix → patch', () => {
    assert.equal(parseConventionalCommit('fix: bug').bump, 'patch')
  })

  it('perf, refactor, docs, test, chore, build, ci, style, revert → patch', () => {
    for (const t of ['perf', 'refactor', 'docs', 'test', 'chore', 'build', 'ci', 'style', 'revert']) {
      assert.equal(parseConventionalCommit(`${t}: x`).bump, 'patch', `${t} should be patch`)
    }
  })

  it('unknown conventional type → patch (parsedOk true)', () => {
    // e.g. "wip: x" — parses as conventional but type isn't in the bump map.
    const r = parseConventionalCommit('wip: x')
    assert.equal(r.parsedOk, true)
    assert.equal(r.bump, 'patch')
  })

  it('feat with scope', () => {
    const r = parseConventionalCommit('feat(events): add foo')
    assert.equal(r.bump, 'minor')
    assert.equal(r.scope, 'events')
  })

  it('feat! → major (bang)', () => {
    const r = parseConventionalCommit('feat!: rewrite')
    assert.equal(r.bump, 'major')
    assert.equal(r.breaking, true)
  })

  it('feat(scope)! → major', () => {
    assert.equal(parseConventionalCommit('feat(api)!: rewrite').bump, 'major')
  })

  it('BREAKING CHANGE: footer → major', () => {
    const r = parseConventionalCommit('feat: thing', 'BREAKING CHANGE: removed old API')
    assert.equal(r.bump, 'major')
    assert.equal(r.breaking, true)
  })

  it('BREAKING-CHANGE: hyphen variant → major', () => {
    const r = parseConventionalCommit('feat: thing', 'BREAKING-CHANGE: removed')
    assert.equal(r.bump, 'major')
  })

  it('non-conventional → patch + parsedOk false', () => {
    const r = parseConventionalCommit('random message without prefix')
    assert.equal(r.bump, 'patch')
    assert.equal(r.parsedOk, false)
  })

  it('empty subject → patch + parsedOk false', () => {
    const r = parseConventionalCommit('')
    assert.equal(r.bump, 'patch')
    assert.equal(r.parsedOk, false)
  })
})

describe('resolvePackageForFile', () => {
  const pkgs = ['apps/explorer', 'libs/events', 'libs/widget-lib', 'libs/widget-react']

  it('matches file inside package', () => {
    assert.equal(resolvePackageForFile('libs/events/src/foo.ts', pkgs), 'libs/events')
  })

  it('returns null for tools/', () => {
    assert.equal(resolvePackageForFile('tools/scripts/foo.js', pkgs), null)
  })

  it('returns null for untracked apps', () => {
    assert.equal(resolvePackageForFile('apps/storybook/src/foo.ts', pkgs), null)
  })

  it('disambiguates by longest match (widget-react vs widget-lib)', () => {
    assert.equal(resolvePackageForFile('libs/widget-react/src/foo.ts', pkgs), 'libs/widget-react')
    assert.equal(resolvePackageForFile('libs/widget-lib/src/foo.ts', pkgs), 'libs/widget-lib')
  })

  it('does not match prefix without trailing slash', () => {
    // libs/widget-lib should NOT match libs/widget-react/...
    assert.equal(resolvePackageForFile('libs/widget-react/src/foo.ts', ['libs/widget-lib']), null)
  })

  it('matches exact path (no trailing content)', () => {
    assert.equal(resolvePackageForFile('libs/events', ['libs/events']), 'libs/events')
  })
})

describe('resolveAffectedPackages', () => {
  const pkgs = ['libs/events', 'libs/types', 'apps/explorer']

  it('multiple packages in one commit', () => {
    const r = resolveAffectedPackages(
      ['libs/events/src/a.ts', 'libs/types/src/b.ts'],
      pkgs,
    )
    assert.deepEqual([...r].sort(), ['libs/events', 'libs/types'])
  })

  it('only untracked files → empty set', () => {
    const r = resolveAffectedPackages(['tools/x.js', 'docs/y.md'], pkgs)
    assert.equal(r.size, 0)
  })

  it('mix of tracked and untracked', () => {
    const r = resolveAffectedPackages(
      ['libs/events/src/a.ts', 'tools/x.js'],
      pkgs,
    )
    assert.deepEqual([...r], ['libs/events'])
  })

  it('deduplicates multiple files in same package', () => {
    const r = resolveAffectedPackages(
      ['libs/events/src/a.ts', 'libs/events/src/b.ts', 'libs/events/README.md'],
      pkgs,
    )
    assert.deepEqual([...r], ['libs/events'])
  })
})

describe('changesetFilename', () => {
  it('uses 7-char sha and slug', () => {
    assert.equal(
      changesetFilename('abcdef1234567890', 'libs/events'),
      'auto-abcdef1-libs-events.md',
    )
  })

  it('handles app paths', () => {
    assert.equal(
      changesetFilename('0123456789', 'apps/cowswap-frontend'),
      'auto-0123456-apps-cowswap-frontend.md',
    )
  })
})

describe('changesetContent', () => {
  it('formats correctly', () => {
    assert.equal(
      changesetContent('@cowprotocol/events', 'minor', 'feat: bring cow.fi back (sdk) (#7359)'),
      `---
"@cowprotocol/events": minor
---

feat: bring cow.fi back (sdk) (#7359)
`,
    )
  })

  it('preserves quotes in package name', () => {
    const out = changesetContent('@scope/name', 'patch', 'fix: x')
    assert.ok(out.startsWith('---\n"@scope/name": patch\n---\n'))
  })
})
```

- [ ] **Step 3: Run the tests to confirm they fail**

```bash
node --test tools/scripts/commits-to-changesets.test.mjs
```

Expected: FAIL — every test throws "not implemented".

- [ ] **Step 4: Commit (red phase)**

```bash
git add tools/scripts/commits-to-changesets-lib.mjs tools/scripts/commits-to-changesets.test.mjs
git commit -m "test(release): add failing tests for commits-to-changesets converter"
```

---

### Task 3: Implement the pure-function library (tests pass)

**Files:**
- Modify: `tools/scripts/commits-to-changesets-lib.mjs`

- [ ] **Step 1: Replace the stub with the real implementation**

Overwrite `tools/scripts/commits-to-changesets-lib.mjs` with:

```js
const TYPE_BUMP = {
  feat: 'minor',
  fix: 'patch',
  perf: 'patch',
  refactor: 'patch',
  docs: 'patch',
  test: 'patch',
  chore: 'patch',
  build: 'patch',
  ci: 'patch',
  style: 'patch',
  revert: 'patch',
}

const CONVENTIONAL_RE =
  /^(?<type>[a-zA-Z]+)(?:\((?<scope>[^)]+)\))?(?<bang>!)?:\s+(?<rest>.+)$/

export function parseConventionalCommit(subject, body = '') {
  const match = CONVENTIONAL_RE.exec(subject || '')
  if (!match) {
    return { parsedOk: false, bump: 'patch', type: null, scope: null, breaking: false }
  }
  const { type, scope, bang } = match.groups
  const hasBreakingFooter = /^BREAKING[ -]CHANGE:/m.test(body || '')
  const breaking = Boolean(bang) || hasBreakingFooter
  let bump = TYPE_BUMP[type.toLowerCase()] ?? 'patch'
  if (breaking) bump = 'major'
  return { parsedOk: true, bump, type, scope: scope || null, breaking }
}

export function resolvePackageForFile(filePath, packagePaths) {
  let best = null
  for (const pkgPath of packagePaths) {
    if (filePath === pkgPath || filePath.startsWith(pkgPath + '/')) {
      if (!best || pkgPath.length > best.length) {
        best = pkgPath
      }
    }
  }
  return best
}

export function resolveAffectedPackages(filePaths, packagePaths) {
  const set = new Set()
  for (const f of filePaths) {
    const p = resolvePackageForFile(f, packagePaths)
    if (p) set.add(p)
  }
  return set
}

export function changesetFilename(sha, pkgPath) {
  const slug = pkgPath.replace(/\//g, '-')
  return `auto-${sha.slice(0, 7)}-${slug}.md`
}

export function changesetContent(packageName, bump, summary) {
  return `---
"${packageName}": ${bump}
---

${summary}
`
}
```

- [ ] **Step 2: Run the tests to verify they pass**

```bash
node --test tools/scripts/commits-to-changesets.test.mjs
```

Expected: PASS — all subtests pass, 0 failures.

- [ ] **Step 3: Commit (green phase)**

```bash
git add tools/scripts/commits-to-changesets-lib.mjs
git commit -m "feat(release): implement conventional-commit-to-changeset pure functions"
```

---

### Task 4: Implement the main converter script (orchestration)

**Files:**
- Create: `tools/scripts/commits-to-changesets.mjs`

The main script does git I/O and file writing — not covered by unit tests. We smoke-test it end-to-end after writing.

- [ ] **Step 1: Create the main script**

Create `tools/scripts/commits-to-changesets.mjs`:

```js
#!/usr/bin/env node

import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  parseConventionalCommit,
  resolveAffectedPackages,
  changesetFilename,
  changesetContent,
} from './commits-to-changesets-lib.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '../..')
const changesetDir = join(rootDir, '.changeset')

// Sentinels chosen so they cannot appear in a real commit message.
const COMMIT_SEP = '<<<COMMIT_SEP_5b3c>>>'
const FIELD_SEP = '<<<FIELD_SEP_5b3c>>>'

function git(args) {
  return execFileSync('git', args, { cwd: rootDir, encoding: 'utf-8' }).trimEnd()
}

function tryGit(args) {
  try {
    return git(args)
  } catch {
    return null
  }
}

function resolveBaseline() {
  const fromEnv = (process.env.BASELINE_REF || '').trim()
  if (fromEnv) {
    console.log(`[converter] Using BASELINE_REF=${fromEnv}`)
    return fromEnv
  }
  const tag = tryGit(['describe', '--match', 'release-*', '--abbrev=0'])
  if (tag) {
    console.log(`[converter] Using latest release tag: ${tag}`)
    return tag
  }
  console.warn(
    '[converter] No baseline tag found and BASELINE_REF not set. ' +
      'No changesets will be generated. ' +
      'To bootstrap, re-run via workflow_dispatch with `baseline_ref` set.',
  )
  return null
}

function loadTrackedPackages() {
  const registry = JSON.parse(
    readFileSync(join(rootDir, 'tools/release/tracked-packages.json'), 'utf-8'),
  )
  const result = []
  for (const path of registry.packages) {
    const pkgJsonPath = join(rootDir, path, 'package.json')
    const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'))
    if (!pkg.name) throw new Error(`${path}/package.json is missing "name"`)
    result.push({ path, name: pkg.name })
  }
  return result
}

function getCommits(baseline) {
  const format = `${COMMIT_SEP}%H${FIELD_SEP}%s${FIELD_SEP}%b`
  const raw = git([
    'log',
    '--no-merges',
    '--reverse',
    `${baseline}..HEAD`,
    `--format=${format}`,
  ])
  if (!raw) return []
  return raw
    .split(COMMIT_SEP)
    .filter(Boolean)
    .map((chunk) => {
      const [sha, subject, ...rest] = chunk.split(FIELD_SEP)
      return {
        sha: (sha || '').trim(),
        subject: (subject || '').trim(),
        body: (rest.join(FIELD_SEP) || '').trim(),
      }
    })
    .filter((c) => c.sha)
}

function getChangedFiles(sha) {
  const raw = git(['show', '--name-only', '--format=', sha])
  return raw
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
}

function main() {
  const baseline = resolveBaseline()
  if (!baseline) return

  if (!existsSync(changesetDir)) {
    mkdirSync(changesetDir, { recursive: true })
  }

  const tracked = loadTrackedPackages()
  const trackedPaths = tracked.map((p) => p.path)
  const pathToName = new Map(tracked.map((p) => [p.path, p.name]))

  const commits = getCommits(baseline)
  console.log(`[converter] Found ${commits.length} commit(s) since ${baseline}`)

  let written = 0
  let skipped = 0
  let touchedNothing = 0

  for (const commit of commits) {
    const parsed = parseConventionalCommit(commit.subject, commit.body)
    if (!parsed.parsedOk) {
      console.warn(
        `[converter] commit ${commit.sha.slice(0, 7)} ("${commit.subject}") is not conventional; defaulting bump=patch`,
      )
    }

    const files = getChangedFiles(commit.sha)
    const affected = resolveAffectedPackages(files, trackedPaths)
    if (affected.size === 0) {
      touchedNothing++
      continue
    }

    for (const pkgPath of affected) {
      const pkgName = pathToName.get(pkgPath)
      if (!pkgName) continue
      const filename = changesetFilename(commit.sha, pkgPath)
      const filePath = join(changesetDir, filename)
      if (existsSync(filePath)) {
        skipped++
        continue
      }
      writeFileSync(filePath, changesetContent(pkgName, parsed.bump, commit.subject))
      written++
    }
  }

  console.log(
    `[converter] Wrote ${written} changeset(s); skipped ${skipped} pre-existing; ` +
      `${touchedNothing} commit(s) touched no tracked package`,
  )
}

main()
```

- [ ] **Step 2: Smoke-test the script against the current repo**

First, find a recent commit to use as a baseline:

```bash
git log --oneline -20
```

Pick a SHA that's ~5-10 commits behind HEAD (e.g., the SHA of `b537df28e` or similar — anything that has touched a tracked package will do).

Run the converter with that SHA:

```bash
BASELINE_REF=<some-sha> node tools/scripts/commits-to-changesets.mjs
```

Expected output: lines like `[converter] Using BASELINE_REF=...`, `[converter] Found N commit(s)...`, `[converter] Wrote M changeset(s)...`.

Inspect what was written:

```bash
ls .changeset/
cat .changeset/auto-*.md | head -50
```

Each file should look like:

```
---
"@cowprotocol/<name>": <bump>
---

<commit subject>
```

- [ ] **Step 3: Test idempotency — re-run, expect no new files**

```bash
BASELINE_REF=<same-sha> node tools/scripts/commits-to-changesets.mjs
```

Expected: `Wrote 0 changeset(s); skipped N pre-existing`.

- [ ] **Step 4: Test the "no baseline" path**

First confirm no `release-*` tag exists in the local clone (the migration PR's branch shouldn't have one):

```bash
git tag --list 'release-*'
```

Expected: empty output. If any tags appear, the next check will use one of them — that's fine, the behavior under test is just "the script doesn't crash".

```bash
unset BASELINE_REF
node tools/scripts/commits-to-changesets.mjs
```

Expected (when no `release-*` tag exists): warning "No baseline tag found and BASELINE_REF not set..." and exit 0.
Expected (when a tag does exist): "Using latest release tag: ..." and normal processing.

Either outcome is acceptable — we're verifying the script handles both branches.

- [ ] **Step 5: Clean up smoke-test artifacts**

```bash
rm -f .changeset/auto-*.md
```

- [ ] **Step 6: Commit**

```bash
git add tools/scripts/commits-to-changesets.mjs
git commit -m "feat(release): add commits-to-changesets converter script"
```

---

### Task 5: Add changesets config + dev dependencies

**Files:**
- Modify: `package.json` (root)
- Create: `.changeset/config.json`
- Create: `.changeset/README.md`

- [ ] **Step 1: Add devDeps + scripts to root `package.json`**

In `/Users/shoom/IdeaProjects/cowswap-2/package.json`:

Add to `devDependencies` (keep alphabetical with existing entries):

```json
    "@changesets/changelog-github": "^0.5.0",
    "@changesets/cli": "^2.27.0",
```

Add to `scripts` (just below `"prepare": "husky"` is fine):

```json
    "changeset": "changeset",
    "changeset:version": "changeset version",
    "release:generate-changesets": "node tools/scripts/commits-to-changesets.mjs",
```

- [ ] **Step 2: Install the new dev dependencies**

```bash
pnpm install
```

Expected: lockfile updates, both packages install cleanly.

- [ ] **Step 3: Verify the CLI works**

```bash
pnpm changeset --help
```

Expected: changesets CLI help text appears.

- [ ] **Step 4: Create the changesets config**

Create `.changeset/config.json`:

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

- [ ] **Step 5: Create the contributor README**

Create `.changeset/README.md`:

```markdown
# Changesets

Most changesets in this repo are auto-generated from conventional commits by
`tools/scripts/commits-to-changesets.mjs`, which runs in the release workflow
on push to `main`. You normally do not need to add changesets by hand.

If you want a specific bump or summary that differs from what the converter
would derive from your commit message, you can add a manual changeset to your
PR:

```bash
pnpm changeset
```

This drops a `.changeset/<random-name>.md` file you can edit and commit
alongside your code changes. Manual and auto-generated changesets coexist —
the converter only writes files it didn't create itself.

See `docs/superpowers/specs/2026-05-13-changesets-migration-design.md` for the
full release flow.
```

- [ ] **Step 6: Verify changesets sees the config (sanity)**

```bash
pnpm changeset status --since=HEAD~0
```

Expected: a status report (likely "No changesets present"). Should not error on config.

- [ ] **Step 7: Commit**

```bash
git add package.json pnpm-lock.yaml .changeset/config.json .changeset/README.md
git commit -m "chore(release): add changesets config and CLI dependencies"
```

---

### Task 6: Flip privacy flags on the 4 apps

The 8 publishable libs (per `nx.json` `release.projects`) are already correctly NOT marked private. The 16 non-publishable libs are already correctly marked private. Only the **4 apps** need `"private": true` added so changesets doesn't treat them as publishable.

**Files:**
- Modify: `apps/cow-fi/package.json`
- Modify: `apps/cowswap-frontend/package.json`
- Modify: `apps/explorer/package.json`
- Modify: `apps/widget-configurator/package.json`

- [ ] **Step 1: Audit current state**

```bash
for app in cow-fi cowswap-frontend explorer widget-configurator; do
  node -e "const p=require('./apps/$app/package.json'); console.log('$app: private=' + (p.private===true))"
done
```

Expected: all four print `private=false`.

- [ ] **Step 2: Add `"private": true` to each app's `package.json`**

For each of the four files (`apps/cow-fi/package.json`, `apps/cowswap-frontend/package.json`, `apps/explorer/package.json`, `apps/widget-configurator/package.json`):

Locate the `"version"` field and add `"private": true` on the line immediately after it.

Example for `apps/cow-fi/package.json`:

Before:
```json
{
  "name": "@cowprotocol/cow-fi",
  "version": "2.5.7",
  ...
```

After:
```json
{
  "name": "@cowprotocol/cow-fi",
  "version": "2.5.7",
  "private": true,
  ...
```

Apply the same change to the other three app `package.json` files.

- [ ] **Step 3: Verify the audit now shows all four private**

```bash
for app in cow-fi cowswap-frontend explorer widget-configurator; do
  node -e "const p=require('./apps/$app/package.json'); console.log('$app: private=' + (p.private===true))"
done
```

Expected: all four print `private=true`.

- [ ] **Step 4: Verify publishable libs are still NOT private (regression check)**

```bash
for lib in events currency types permit-utils widget-lib widget-react iframe-transport hook-dapp-lib; do
  node -e "const p=require('./libs/$lib/package.json'); console.log('$lib: private=' + (p.private===true))"
done
```

Expected: all eight print `private=false`.

- [ ] **Step 5: Verify changesets sees the right publishable set**

```bash
pnpm changeset status
```

Expected: no errors. If status reports anything about packages, the publishable count should reflect that only the 8 libs above are publishable (changesets ignores private packages when computing publishability).

- [ ] **Step 6: Commit**

```bash
git add apps/cow-fi/package.json apps/cowswap-frontend/package.json apps/explorer/package.json apps/widget-configurator/package.json
git commit -m "chore(release): mark apps as private for changesets

Apps are versioned and get CHANGELOG.md entries, but are never published to
npm. Marking them private prevents \`changeset publish\` (and any future use
of it) from attempting to publish them. The nx-based publish job already
gates on nx.json release.projects, so this is defense-in-depth."
```

---

### Task 7: Replace the release workflow

**Files:**
- Create: `.github/workflows/release.yml`
- Delete: `.github/workflows/release-please.yml`
- Delete: `release-please-config.json`
- Delete: `.release-please-manifest.json`

- [ ] **Step 1: Create the new workflow**

Create `.github/workflows/release.yml`:

```yaml
name: Release

on:
  push:
    branches:
      - main
  workflow_dispatch:
    inputs:
      baseline_ref:
        description: "Override baseline (commit SHA or tag) for the changeset generator. Leave empty to use the latest release-* tag."
        required: false

env:
  NODE_VERSION: lts/jod

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
    outputs:
      published: ${{ steps.changesets.outputs.published }}
      publishedPackages: ${{ steps.changesets.outputs.publishedPackages }}
    steps:
      - name: Checkout code
        uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd # v6.0.2
        with:
          fetch-depth: 0
          fetch-tags: true
          token: ${{ secrets.RELEASE_PLEASE_AUTH }}

      - name: Install pnpm
        uses: pnpm/action-setup@41ff72655975bd51cab0327fa583b6e92b6d3061 # v4.2.0

      - name: Set up node
        uses: actions/setup-node@48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e # v6.4.0
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Generate changesets from conventional commits
        env:
          BASELINE_REF: ${{ inputs.baseline_ref }}
        run: node tools/scripts/commits-to-changesets.mjs

      # IMPORTANT: pin to the SHA of the latest changesets/action v1.x release.
      # Look it up at https://github.com/changesets/action/releases and
      # replace the SHA below before merging this PR.
      - name: Changesets action
        id: changesets
        uses: changesets/action@REPLACE-WITH-V1-SHA # v1.x
        with:
          version: pnpm changeset version
          publish: echo "publish handled in next job"
          commit: "chore(main): release"
          title: "chore(main): release"
          createGithubReleases: false
        env:
          GITHUB_TOKEN: ${{ secrets.RELEASE_PLEASE_AUTH }}

  publish:
    runs-on: ubuntu-latest
    needs: release
    if: needs.release.outputs.published == 'true'
    permissions:
      contents: write
      id-token: write
    steps:
      - name: Checkout code
        uses: actions/checkout@de0fac2e4500dabe0009e67214ff5f5447ce83dd # v6.0.2
        with:
          fetch-depth: 0
          fetch-tags: true
          token: ${{ secrets.RELEASE_PLEASE_AUTH }}

      - name: Install pnpm
        uses: pnpm/action-setup@41ff72655975bd51cab0327fa583b6e92b6d3061 # v4.2.0

      - name: Set up node
        uses: actions/setup-node@48b55a011bda9f5d6aeb4c2d9c7362e8dae4041e # v6.4.0
        with:
          node-version: ${{ env.NODE_VERSION }}
          registry-url: "https://registry.npmjs.org"
          cache: pnpm

      # Trusted publishing requires npm >= 11.5.1
      - run: npm install -g npm@~11.10.0

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Get publishable libs
        id: get-libs
        run: |
          LIBS_CSV=$(node -e "const nx = require('./nx.json'); console.log(nx.release.projects.map(p => p.replace('libs/', '')).join(','))")
          LIBS_SPACE=$(node -e "const nx = require('./nx.json'); console.log(nx.release.projects.map(p => p.replace('libs/', '')).join(' '))")
          echo "libs_csv=$LIBS_CSV" >> $GITHUB_OUTPUT
          echo "libs_space=$LIBS_SPACE" >> $GITHUB_OUTPUT

      - name: Build publishable libs
        run: pnpm exec nx run-many --target=build --projects=${{ steps.get-libs.outputs.libs_csv }} --parallel

      - name: Prepare packages for publishing
        run: |
          for lib in ${{ steps.get-libs.outputs.libs_space }}; do
            if [ -d "dist/libs/$lib" ]; then
              echo "Preparing $lib for publishing..."
              cp "libs/$lib/README.md" "dist/libs/$lib/" 2>/dev/null || true
              node tools/scripts/prepare-publish.mjs "dist/libs/$lib/package.json"
            fi
          done

      - name: Publish released packages
        run: pnpm exec nx release publish --tag latest --access public --provenance

      - name: Tag release baseline
        run: |
          TAG="release-$(date -u +%Y%m%dT%H%M%SZ)"
          git tag -a "$TAG" -m "Release published at $TAG"
          git push origin "$TAG"
```

- [ ] **Step 1b: Replace the `changesets/action` SHA placeholder**

The workflow contains `uses: changesets/action@REPLACE-WITH-V1-SHA # v1.x`. Look up the latest v1.x release SHA at <https://github.com/changesets/action/releases> (use the "verified" SHA of a `v1.x.y` release, not the `v1` floating tag). Replace `REPLACE-WITH-V1-SHA` with that 40-char SHA and update the comment to `# v1.x.y` (the actual version you picked).

Verify the placeholder is gone:

```bash
grep -n 'REPLACE-WITH' .github/workflows/release.yml || echo "no placeholder remaining"
```

Expected: `no placeholder remaining`.

- [ ] **Step 2: Delete the old release-please files**

```bash
rm .github/workflows/release-please.yml
rm release-please-config.json
rm .release-please-manifest.json
```

- [ ] **Step 3: Verify the workflow is valid YAML**

```bash
node -e "
  const yaml = require('js-yaml');
  const fs = require('fs');
  const doc = yaml.load(fs.readFileSync('.github/workflows/release.yml', 'utf8'));
  console.log('Top-level keys:', Object.keys(doc).join(', '));
  console.log('Jobs:', Object.keys(doc.jobs).join(', '));
"
```

If `js-yaml` is not available, fall back to a syntax sanity check:

```bash
node -e "console.log(require('fs').readFileSync('.github/workflows/release.yml','utf8').length, 'bytes')"
```

Expected: file loads or prints byte count without error.

- [ ] **Step 4: Run `actionlint` if available (optional)**

```bash
which actionlint && actionlint .github/workflows/release.yml || echo "actionlint not installed; skipping"
```

Expected: no errors reported, or message that actionlint isn't installed.

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/release.yml
git rm .github/workflows/release-please.yml release-please-config.json .release-please-manifest.json
git commit -m "ci(release): replace release-please with changesets workflow

The new workflow runs commits-to-changesets.mjs to derive changesets from
conventional commits, then changesets/action@v1 to maintain the Version PR.
The publish job is structurally identical to the old one and continues to
use \`nx release publish\` so prepare-publish.mjs and the nx-based packaging
flow are unchanged. A trailing step tags release-<ISO> so the next run's
converter can auto-discover the baseline via \`git describe\`.

Why: release-please's GitHub GraphQL commit walk is date-ordered and skips
commits introduced by late merges of long-lived branches. Using
\`git log \$BASELINE..HEAD\` makes baseline discovery reachability-based
and eliminates that class of bug. See
docs/superpowers/specs/2026-05-13-changesets-migration-design.md."
```

---

### Task 8: End-to-end local smoke test

This task runs no CI — it manually exercises the full version flow on the local checkout and discards the result. It's a verification gate before the PR opens, not a code change.

**Files:** none modified or created.

- [ ] **Step 1: Pick a baseline SHA that's far enough back to include real commits**

```bash
git log --oneline main -20
```

Pick a SHA ~10 commits behind HEAD that pre-dates this branch's work. Set it:

```bash
export BASELINE_REF=<picked-sha>
```

- [ ] **Step 2: Generate changesets**

```bash
node tools/scripts/commits-to-changesets.mjs
ls .changeset/auto-*.md | wc -l
```

Expected: several `auto-*.md` files. Spot-check one:

```bash
cat $(ls .changeset/auto-*.md | head -1)
```

It should have a valid frontmatter block (`---\n"@cowprotocol/...": <bump>\n---`) and a commit subject as the body.

- [ ] **Step 3: Run `pnpm changeset version`**

```bash
pnpm changeset version
```

Expected:
- `package.json` `version` fields in affected packages bump by the chosen amount.
- `CHANGELOG.md` files in affected packages have new entries appended at the top (under a new version heading).
- `.changeset/auto-*.md` files are deleted (consumed).

Verify versions changed:

```bash
git diff --stat | head -30
```

You should see modifications to `apps/*/package.json`, `libs/*/package.json`, and corresponding `CHANGELOG.md` files, plus deletions of `.changeset/auto-*.md`.

Spot-check a CHANGELOG:

```bash
git diff libs/events/CHANGELOG.md | head -30
```

The new entry should appear above the most recent existing entry (e.g., `## 4.4.0` above `## 4.3.1`). Format will be the changesets default: a list of bullet points with PR/author links (since we configured `@changesets/changelog-github`).

- [ ] **Step 4: Test rollback (matters for the rollback section of the spec)**

```bash
git checkout .
git clean -fd .changeset/
git status
```

Expected: working tree clean, `.changeset/` only contains `config.json` and `README.md`.

- [ ] **Step 5: Test the "no commits" path**

```bash
BASELINE_REF=HEAD node tools/scripts/commits-to-changesets.mjs
ls .changeset/auto-*.md 2>/dev/null || echo "no auto changesets — correct"
```

Expected: `Found 0 commit(s)`, no files written.

- [ ] **Step 6: Test the "no baseline" path one more time**

```bash
unset BASELINE_REF
node tools/scripts/commits-to-changesets.mjs
```

Expected: warning + exit 0, no files written.

- [ ] **Step 7: Final state check — working tree clean**

```bash
git status
```

Expected: clean working tree. If anything remains, clean it up before opening the PR.

- [ ] **Step 8 (optional but recommended): Re-run all unit tests one more time**

```bash
node --test tools/release/tracked-packages.test.mjs tools/scripts/commits-to-changesets.test.mjs
```

Expected: all PASS.

(No commit — this task is verification only.)

---

## Post-merge bootstrap procedure

After the PR merges to `main`, the operator must do these steps **once**:

1. The automatic push-triggered workflow run will warn "No baseline tag found" and exit 0. This is expected — green build, nothing done. No action needed.

2. Wait for the first real PR to merge to `main` after the migration PR.

3. In the GitHub Actions UI, trigger `Release` via `workflow_dispatch` with `baseline_ref` set to the **migration PR's merge commit SHA**. (Not the first real PR's SHA — the migration PR's SHA.)

4. The workflow will:
   - Generate one or more `.changeset/*.md` files for the real PR's commits.
   - Open a "Version Packages" PR on `changeset-release/main`.

5. Review and merge the Version PR.

6. The publish job runs: `nx release publish` ships the 8 publishable libs, and the final step pushes a `release-<ISO>` tag.

7. From this point on, push-triggered runs work automatically — no more `workflow_dispatch`.

If something goes wrong before step 5, **revert the migration PR**. Nothing has been published to npm, so the rollback is clean: release-please files reappear, all new files vanish.

If something goes wrong after step 5, npm packages cannot be unpublished. Reverting the migration PR restores release-please's workflow files but leaves `package.json` versions ahead of what `.release-please-manifest.json` would say. The recovery is a one-time hand-edit of the restored manifest to match the new versions (~28 lines).

---

## Spec coverage check

| Spec requirement | Implemented in |
|---|---|
| Reachability-based commit walk (`git log A..B`) | Task 4, step 1 (`getCommits`) |
| Custom converter generating `.changeset/*.md` from conv. commits | Tasks 2–4 |
| Bump map (feat→minor, fix/perf/.../chore→patch, breaking→major) | Task 3, `TYPE_BUMP` + `parseConventionalCommit` |
| Idempotent re-runs | Task 4, step 1 (`if (existsSync(filePath)) skipped++`) |
| Tracked packages registry (28 paths) | Task 1 |
| Untracked allowlist (`cowswap-frontend-e2e`, `sdk-tools`, `storybook`) | Task 1 test + absence from registry |
| Apps + libs marked private vs publishable | Task 6 (apps); libs already correct |
| `.changeset/config.json` with `@changesets/changelog-github` + `baseBranch: main` + `updateInternalDependencies: patch` | Task 5 |
| Workflow trigger `push: main` + `workflow_dispatch` with `baseline_ref` | Task 7 |
| `fetch-depth: 0` + `fetch-tags: true` | Task 7 (both jobs) |
| Publish job unchanged in structure; still `nx release publish` | Task 7 |
| Tag `release-<ISO>` after publish | Task 7 (final step) |
| Removal of release-please files | Task 7, step 2 |
| `prepare-publish.mjs`, `nx.json`, `commitlint.config.js`, `CHANGELOG.md` files all unchanged | Verified — no task touches them |
| First-run bootstrap procedure documented | "Post-merge bootstrap procedure" section above |
| Rollback plan | "Post-merge bootstrap procedure" section above |

All spec requirements have a task.
