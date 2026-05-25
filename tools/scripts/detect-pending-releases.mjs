#!/usr/bin/env node

// Walks every tracked package and emits a JSON array of those whose
// `<short>-v<version>` git tag does not yet exist. Used by the Release
// workflow as both the publish-job gate and the iteration source for tag +
// GitHub release creation.
//
// Short name = the part of pkg.name after the scope (e.g. `@cowprotocol/cowswap`
// → `cowswap`). Matches the historical release-please tag convention and the
// `cowswap-v*` / `explorer-v*` patterns deployment.yml listens for.

import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '../..')

const registry = JSON.parse(
  readFileSync(join(rootDir, 'tools/release/tracked-packages.json'), 'utf-8'),
)

const pending = []
for (const path of registry.packages) {
  const pkg = JSON.parse(readFileSync(join(rootDir, path, 'package.json'), 'utf-8'))
  if (!pkg.name) continue
  const shortName = pkg.name.includes('/') ? pkg.name.split('/').pop() : pkg.name
  const tag = `${shortName}-v${pkg.version}`

  const existing = execFileSync('git', ['tag', '--list', tag], {
    cwd: rootDir,
    encoding: 'utf-8',
  }).trim()
  if (existing === tag) continue

  pending.push({
    name: pkg.name,
    shortName,
    version: pkg.version,
    path,
    tag,
    private: !!pkg.private,
  })
}

process.stdout.write(JSON.stringify(pending))
