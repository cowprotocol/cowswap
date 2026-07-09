import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  formatChangelogHeader,
  rewriteChangelog,
  shortNameFromPkgName,
} from './format-changelog-headers-lib.mjs'

const REPO = 'cowprotocol/cowswap'
const DATE = '2026-05-21'

describe('shortNameFromPkgName', () => {
  it('strips scope from scoped names', () => {
    assert.equal(shortNameFromPkgName('@cowprotocol/wallet'), 'wallet')
  })

  it('returns unscoped names unchanged', () => {
    assert.equal(shortNameFromPkgName('cowswap-monorepo'), 'cowswap-monorepo')
  })

  it('uses the last segment for multi-segment names', () => {
    assert.equal(shortNameFromPkgName('@cowprotocol/balances-and-allowances'), 'balances-and-allowances')
  })
})

describe('formatChangelogHeader', () => {
  it('renders compare link when prev version is known', () => {
    const out = formatChangelogHeader({
      shortName: 'cowswap',
      version: '3.12.0',
      prevVersion: '3.11.0',
      date: DATE,
      repo: REPO,
    })
    assert.equal(
      out,
      `## [3.12.0](https://github.com/cowprotocol/cowswap/compare/cowswap-v3.11.0...cowswap-v3.12.0) (2026-05-21)`,
    )
  })

  it('renders release-tag link when prev version is null (first release)', () => {
    const out = formatChangelogHeader({
      shortName: 'wallet',
      version: '1.0.0',
      prevVersion: null,
      date: DATE,
      repo: REPO,
    })
    assert.equal(
      out,
      `## [1.0.0](https://github.com/cowprotocol/cowswap/releases/tag/wallet-v1.0.0) (2026-05-21)`,
    )
  })

  it('handles pre-release versions in the link', () => {
    const out = formatChangelogHeader({
      shortName: 'cowswap',
      version: '4.0.0-beta.1',
      prevVersion: '3.9.0',
      date: DATE,
      repo: REPO,
    })
    assert.ok(out.includes('cowswap-v3.9.0...cowswap-v4.0.0-beta.1'))
    assert.ok(out.startsWith('## [4.0.0-beta.1]'))
  })
})

describe('rewriteChangelog', () => {
  it('rewrites top plain header when prior version exists', () => {
    const input = [
      '# Changelog',
      '',
      '## 3.12.0',
      '',
      '### Minor Changes',
      '',
      '- feat: something (#1)',
      '',
      '## 3.11.0',
      '',
      '### Patch Changes',
      '',
      '- fix: other (#2)',
      '',
    ].join('\n')
    const out = rewriteChangelog({
      changelog: input,
      pkgVersion: '3.12.0',
      shortName: 'cowswap',
      date: DATE,
      repo: REPO,
    })
    assert.ok(
      out.includes(
        '## [3.12.0](https://github.com/cowprotocol/cowswap/compare/cowswap-v3.11.0...cowswap-v3.12.0) (2026-05-21)',
      ),
    )
    // Old header is gone, body below is preserved
    assert.ok(!/^## 3\.12\.0\s*$/m.test(out))
    assert.ok(out.includes('## 3.11.0'))
    assert.ok(out.includes('- feat: something (#1)'))
  })

  it('uses already-bracketed previous header as prev version', () => {
    const input = [
      '# Changelog',
      '',
      '## 3.10.3',
      '',
      '### Patch Changes',
      '',
      '- fix: x (#1)',
      '',
      '## [3.10.2](https://github.com/cowprotocol/cowswap/compare/cowswap-v3.10.1...cowswap-v3.10.2) (2026-05-14)',
      '',
      '### Bug Fixes',
      '',
      '- add safe api key',
      '',
    ].join('\n')
    const out = rewriteChangelog({
      changelog: input,
      pkgVersion: '3.10.3',
      shortName: 'cowswap',
      date: DATE,
      repo: REPO,
    })
    assert.ok(out.includes('compare/cowswap-v3.10.2...cowswap-v3.10.3'))
    // The historical release-please header below is untouched
    assert.ok(out.includes('## [3.10.2](https://github.com/cowprotocol/cowswap/compare/cowswap-v3.10.1...cowswap-v3.10.2) (2026-05-14)'))
  })

  it('uses releases/tag link when no prior header exists (first release)', () => {
    const input = ['# Changelog', '', '## 1.0.0', '', '### Minor Changes', '', '- feat: initial (#1)', ''].join('\n')
    const out = rewriteChangelog({
      changelog: input,
      pkgVersion: '1.0.0',
      shortName: 'wallet',
      date: DATE,
      repo: REPO,
    })
    assert.ok(
      out.includes(
        '## [1.0.0](https://github.com/cowprotocol/cowswap/releases/tag/wallet-v1.0.0) (2026-05-21)',
      ),
    )
  })

  it('is a no-op when the top header is already bracketed', () => {
    const input = [
      '# Changelog',
      '',
      '## [3.12.0](https://github.com/cowprotocol/cowswap/compare/cowswap-v3.11.0...cowswap-v3.12.0) (2026-05-20)',
      '',
      '- feat: thing (#1)',
      '',
      '## 3.11.0',
      '',
    ].join('\n')
    const out = rewriteChangelog({
      changelog: input,
      pkgVersion: '3.12.0',
      shortName: 'cowswap',
      date: DATE,
      repo: REPO,
    })
    assert.equal(out, input)
  })

  it('is a no-op when the top plain header does not match pkg.version', () => {
    // Top is 3.11.0 but the package's current version is 3.12.0 — means this
    // CHANGELOG.md wasn't bumped on this run (e.g., another tracked package
    // moved). Don't touch it.
    const input = ['# Changelog', '', '## 3.11.0', '', '- old (#1)', ''].join('\n')
    const out = rewriteChangelog({
      changelog: input,
      pkgVersion: '3.12.0',
      shortName: 'cowswap',
      date: DATE,
      repo: REPO,
    })
    assert.equal(out, input)
  })

  it('handles pre-release version at the top', () => {
    const input = ['# Changelog', '', '## 4.0.0-beta.1', '', '- feat: x (#1)', '', '## 3.9.0', '', '- fix: y (#2)', ''].join(
      '\n',
    )
    const out = rewriteChangelog({
      changelog: input,
      pkgVersion: '4.0.0-beta.1',
      shortName: 'cowswap',
      date: DATE,
      repo: REPO,
    })
    assert.ok(out.includes('compare/cowswap-v3.9.0...cowswap-v4.0.0-beta.1'))
    assert.ok(out.includes('(2026-05-21)'))
  })

  it('returns input unchanged when no version header exists', () => {
    const input = '# Changelog\n\nNo releases yet.\n'
    const out = rewriteChangelog({
      changelog: input,
      pkgVersion: '1.0.0',
      shortName: 'wallet',
      date: DATE,
      repo: REPO,
    })
    assert.equal(out, input)
  })

  it('does not match top-level # Changelog as a version header', () => {
    // Guards against accidentally matching the single-# title line.
    const input = ['# Changelog', '', '## 1.0.0', '', '- feat: first (#1)', ''].join('\n')
    const out = rewriteChangelog({
      changelog: input,
      pkgVersion: '1.0.0',
      shortName: 'foo',
      date: DATE,
      repo: REPO,
    })
    assert.ok(out.startsWith('# Changelog\n'))
    assert.ok(out.includes('## [1.0.0]'))
  })
})
