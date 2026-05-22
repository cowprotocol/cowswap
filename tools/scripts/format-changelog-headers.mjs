#!/usr/bin/env node

// Post-processor for `changeset version`: rewrites the top plain `## X.Y.Z`
// header in each tracked package's CHANGELOG.md into the release-please-style
// `## [X.Y.Z](compare-link) (DATE)` form. Wired via `pnpm changeset:version`
// so it runs both locally and inside the changesets/action lifecycle.
//
// See docs/superpowers/specs/2026-05-21-changeset-changelog-header-format-design.md
// for the full design and rationale.

import { readFileSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { rewriteChangelog, shortNameFromPkgName } from './format-changelog-headers-lib.mjs'

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '../..')

// Files modified by `changeset version` in the current run, relative to HEAD.
// Used to skip packages that weren't bumped this run — their committed plain
// `## X.Y.Z` header dates back to an earlier release and must not be
// re-stamped with today's date.
const changedFromHead = new Set(
  execFileSync('git', ['diff', '--name-only', 'HEAD'], { cwd: rootDir, encoding: 'utf-8' })
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean),
)

const registry = JSON.parse(
  readFileSync(join(rootDir, 'tools/release/tracked-packages.json'), 'utf-8'),
)

const changesetConfig = JSON.parse(
  readFileSync(join(rootDir, '.changeset/config.json'), 'utf-8'),
)

// changelog config shape: ["@changesets/changelog-github", { "repo": "..." }]
const repo = Array.isArray(changesetConfig.changelog) ? changesetConfig.changelog[1]?.repo : null
if (!repo) {
  console.error('Could not read `repo` from .changeset/config.json changelog config')
  process.exit(1)
}

const date = new Date().toISOString().slice(0, 10)

let updated = 0
for (const path of registry.packages) {
  const pkgPath = join(rootDir, path, 'package.json')
  const changelogPath = join(rootDir, path, 'CHANGELOG.md')

  let pkg, changelog
  try {
    pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
  } catch {
    continue
  }
  if (!pkg.name || !pkg.version) continue

  // Skip packages that weren't bumped on this run. `changeset version`
  // updates package.json for every package it bumps, so an unchanged
  // package.json (relative to HEAD) means the CHANGELOG.md's existing top
  // header is historical — don't restamp it.
  if (!changedFromHead.has(`${path}/package.json`)) continue

  try {
    changelog = readFileSync(changelogPath, 'utf-8')
  } catch {
    continue
  }

  const shortName = shortNameFromPkgName(pkg.name)
  const next = rewriteChangelog({
    changelog,
    pkgVersion: pkg.version,
    shortName,
    date,
    repo,
  })

  if (next !== changelog) {
    writeFileSync(changelogPath, next)
    console.log(`Formatted ${path}/CHANGELOG.md (${pkg.version})`)
    updated++
  }
}

if (updated === 0) {
  console.log('No CHANGELOG.md headers needed formatting.')
}
