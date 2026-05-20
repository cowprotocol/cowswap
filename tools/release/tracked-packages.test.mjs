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
