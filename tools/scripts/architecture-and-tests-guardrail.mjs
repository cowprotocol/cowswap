#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

import { analyzeFile, diffBaseline, emptySnapshot, sortSnapshot } from './architecture-and-tests-guardrail-lib.mjs'

const repoRoot = process.cwd()
const baselinePath = path.join(repoRoot, 'tools/baselines/architecture-and-tests-baseline.json')
const sourceRoot = path.join(repoRoot, 'apps/cowswap-frontend/src')
const update = process.argv.includes('--update')

const current = sortSnapshot(collectFrontendSnapshot(sourceRoot, repoRoot))

if (update) {
  fs.mkdirSync(path.dirname(baselinePath), { recursive: true })
  fs.writeFileSync(baselinePath, `${JSON.stringify(current, null, 2)}\n`)
  console.log(`arch:baseline:update wrote ${path.relative(repoRoot, baselinePath)}`)
  process.exit(0)
}

if (!fs.existsSync(baselinePath)) {
  console.error(
    `arch:check failed: missing ${path.relative(repoRoot, baselinePath)}. Run pnpm arch:baseline:update after reviewing the snapshot.`,
  )
  process.exit(1)
}

const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'))
const errors = diffBaseline(current, baseline)

if (errors.length > 0) {
  console.error('arch:check failed:')
  for (const error of errors) {
    console.error(`- ${error}`)
  }
  process.exit(1)
}

const legacyCount = Object.keys(current.legacyStateImportBindings).length
const hookCount = Object.keys(current.hookOrchestration).length
const testCount = Object.keys(current.highMockRenderTests).length
const aliasCount = Object.keys(current.atomAliasHooks).length
console.log(
  `arch:check passed (legacy/state files ${legacyCount}, hook orchestration ${hookCount}, high-mock render tests ${testCount}, atom-alias hooks ${aliasCount})`,
)

function collectFrontendSnapshot(root, repo) {
  const snapshot = emptySnapshot()
  if (!fs.existsSync(root)) return snapshot

  for (const absolutePath of walkTypeScriptFiles(root)) {
    const relPath = path.relative(repo, absolutePath).split(path.sep).join('/')
    const source = fs.readFileSync(absolutePath, 'utf8')
    const result = analyzeFile(relPath, source)

    if (result.legacyStateImportBindings > 0) {
      snapshot.legacyStateImportBindings[relPath] = result.legacyStateImportBindings
    }
    if (result.hookOrchestration !== null) {
      snapshot.hookOrchestration[relPath] = result.hookOrchestration
    }
    if (result.highMockRenderTests !== null) {
      snapshot.highMockRenderTests[relPath] = result.highMockRenderTests
    }
    if (result.atomAliasHooks > 0) {
      snapshot.atomAliasHooks[relPath] = result.atomAliasHooks
    }
  }

  return snapshot
}

function walkTypeScriptFiles(directory) {
  const files = []

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'locales') continue
    const absolutePath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...walkTypeScriptFiles(absolutePath))
      continue
    }
    if (!entry.isFile()) continue
    if (!/\.tsx?$/.test(entry.name) || entry.name.endsWith('.d.ts')) continue
    files.push(absolutePath)
  }

  return files
}
