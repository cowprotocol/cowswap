import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  parseConventionalCommit,
  resolvePackageForFile,
  resolveAffectedPackages,
  changesetFilename,
  changesetContent,
  isReleaseCommitSubject,
  resolveBaselineRef,
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

  it('perf, refactor, docs, test, chore, build, ci, style, revert → skipped (bump null)', () => {
    for (const t of ['perf', 'refactor', 'docs', 'test', 'chore', 'build', 'ci', 'style', 'revert']) {
      const r = parseConventionalCommit(`${t}: x`)
      assert.equal(r.bump, null, `${t} should be skipped (bump null)`)
      assert.equal(r.parsedOk, true, `${t} should still parse OK`)
    }
  })

  it('unknown conventional type → skipped (bump null)', () => {
    // e.g. "wip: x" — parses as conventional but type isn't in the bump map.
    const r = parseConventionalCommit('wip: x')
    assert.equal(r.parsedOk, true)
    assert.equal(r.bump, null)
  })

  it('chore! → major (breaking overrides skip)', () => {
    const r = parseConventionalCommit('chore!: drop Node 18')
    assert.equal(r.bump, 'major')
    assert.equal(r.breaking, true)
  })

  it('refactor with BREAKING CHANGE footer → major', () => {
    const r = parseConventionalCommit('refactor: rename', 'BREAKING CHANGE: removed legacy API')
    assert.equal(r.bump, 'major')
    assert.equal(r.breaking, true)
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
    assert.equal(r.breaking, true)
  })

  it('non-conventional → skipped (bump null, parsedOk false)', () => {
    const r = parseConventionalCommit('random message without prefix')
    assert.equal(r.bump, null)
    assert.equal(r.parsedOk, false)
  })

  it('empty subject → skipped (bump null, parsedOk false)', () => {
    const r = parseConventionalCommit('')
    assert.equal(r.bump, null)
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
    assert.deepEqual([...r].sort(), ['libs/events'])
  })

  it('deduplicates multiple files in same package', () => {
    const r = resolveAffectedPackages(
      ['libs/events/src/a.ts', 'libs/events/src/b.ts', 'libs/events/README.md'],
      pkgs,
    )
    assert.deepEqual([...r].sort(), ['libs/events'])
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

describe('isReleaseCommitSubject', () => {
  it('matches squash-merged release PR subject (chore(main): release (#N))', () => {
    assert.equal(isReleaseCommitSubject('chore(main): release (#7554)'), true)
  })

  it('matches bare release subject (no PR number)', () => {
    assert.equal(isReleaseCommitSubject('chore(main): release'), true)
  })

  it('rejects similar-looking commits that are not release-PR merges', () => {
    assert.equal(isReleaseCommitSubject('chore(main): release notes update'), false)
    assert.equal(isReleaseCommitSubject('chore: release foo'), false)
    assert.equal(isReleaseCommitSubject('chore(main): bump deps'), false)
    assert.equal(isReleaseCommitSubject('feat: add release flow'), false)
  })

  it('handles empty / null / undefined subjects', () => {
    assert.equal(isReleaseCommitSubject(''), false)
    assert.equal(isReleaseCommitSubject(null), false)
    assert.equal(isReleaseCommitSubject(undefined), false)
  })

  it('tolerates surrounding whitespace', () => {
    assert.equal(isReleaseCommitSubject('  chore(main): release (#7554)  '), true)
  })
})

describe('resolveBaselineRef', () => {
  it('env override wins over everything else', () => {
    const r = resolveBaselineRef({
      envBaseline: 'abc123',
      latestReleaseTag: 'release-20260519T121234Z',
      releasePrCommit: 'def456',
    })
    assert.deepEqual(r, { ref: 'abc123', source: 'env' })
  })

  it('release-PR merge commit wins over the release tag (the race-condition fix)', () => {
    // On the workflow run triggered by the release-PR merge, the publish
    // job hasn't yet pushed the new release-* tag. Without this, the
    // converter would re-emit changesets the PR just consumed.
    const r = resolveBaselineRef({
      envBaseline: '',
      latestReleaseTag: 'release-20260519T121234Z',
      releasePrCommit: 'ca8468a8',
    })
    assert.deepEqual(r, { ref: 'ca8468a8', source: 'release-pr-merge' })
  })

  it('falls back to release tag when no newer release-PR commit exists', () => {
    const r = resolveBaselineRef({
      envBaseline: '',
      latestReleaseTag: 'release-20260519T121234Z',
      releasePrCommit: null,
    })
    assert.deepEqual(r, { ref: 'release-20260519T121234Z', source: 'release-tag' })
  })

  it('returns source=none for bootstrap (no env, no tag)', () => {
    const r = resolveBaselineRef({
      envBaseline: '',
      latestReleaseTag: null,
      releasePrCommit: null,
    })
    assert.deepEqual(r, { ref: null, source: 'none' })
  })

  it('trims whitespace around env baseline', () => {
    const r = resolveBaselineRef({
      envBaseline: '  abc123  ',
      latestReleaseTag: null,
      releasePrCommit: null,
    })
    assert.deepEqual(r, { ref: 'abc123', source: 'env' })
  })

  it('treats whitespace-only env baseline as unset', () => {
    const r = resolveBaselineRef({
      envBaseline: '   ',
      latestReleaseTag: 'release-tag',
      releasePrCommit: null,
    })
    assert.deepEqual(r, { ref: 'release-tag', source: 'release-tag' })
  })
})
