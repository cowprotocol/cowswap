#!/usr/bin/env node

/**
 * Updates @cowprotocol SDK package versions across the monorepo from a release list.
 *
 * Usage:
 *   node tools/scripts/update-sdk-releases.js [--dry-run]
 *
 * Reads from tools/scripts/update-sdk-releases-manifest.txt (one line per release, e.g.
 * sdk-bridging-v1.6.0, cow-sdk-v7.3.0). Lines that don't match "name-vX.Y.Z" are skipped.
 * For each package, runs `pnpm add <pkg>@<version> --filter <workspace>` only
 * in workspaces that already depend on that package.
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const ROOT_DIR = path.resolve(__dirname, '../..')
const MANIFEST_PATH = path.join(__dirname, 'update-sdk-releases-manifest.txt')
const SCOPE = '@cowprotocol'

// Match "something-vX.Y.Z" at end of line (version is last segment)
const RELEASE_LINE_REGEX = /^(.+)-v(\d+\.\d+\.\d+)$/

/**
 * Parse a release line into { npmName, version } or null.
 * e.g. "sdk-bridging-v1.6.0" -> { npmName: "@cowprotocol/sdk-bridging", version: "1.6.0" }
 */
function parseReleaseLine(line) {
  const trimmed = line.trim()
  if (!trimmed) return null
  const m = trimmed.match(RELEASE_LINE_REGEX)
  if (!m) return null
  const [, name, version] = m
  const npmName = `${SCOPE}/${name}`
  return { npmName, version }
}

/**
 * Collect all workspace package.json paths and their package names.
 * Returns Array<{ dir, name, packageJson }>
 */
function getWorkspaces() {
  const workspaces = []
  for (const base of ['apps', 'libs']) {
    const basePath = path.join(ROOT_DIR, base)
    if (!fs.existsSync(basePath)) continue
    const entries = fs.readdirSync(basePath, { withFileTypes: true })
    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      const dir = path.join(basePath, entry.name)
      const packageJsonPath = path.join(dir, 'package.json')
      if (!fs.existsSync(packageJsonPath)) continue
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
      const name = packageJson.name
      if (name) {
        workspaces.push({ dir, name, packageJson })
      }
    }
  }
  return workspaces
}

/**
 * Which workspaces have the given package in dependencies or devDependencies?
 */
function workspacesWithPackage(workspaces, npmName) {
  return workspaces.filter((w) => {
    const deps = { ...w.packageJson.dependencies, ...w.packageJson.devDependencies }
    return Object.prototype.hasOwnProperty.call(deps, npmName)
  })
}

/**
 * Run pnpm add pkg@version --filter <workspaceName> from repo root.
 * When dryRun is true, only logs the command and does not execute.
 */
function pnpmAddInWorkspace(npmName, version, workspaceName, dryRun) {
  const spec = `${npmName}@${version}`
  if (dryRun) {
    console.log(`  [dry-run] pnpm add ${spec} --filter ${workspaceName}`)
    return
  }
  execSync(`pnpm add ${spec} --filter ${JSON.stringify(workspaceName)}`, {
    cwd: ROOT_DIR,
    stdio: 'inherit',
  })
}

function main() {
  const dryRun = process.argv.includes('--dry-run')
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error('Manifest not found:', MANIFEST_PATH)
    process.exit(1)
  }
  const lines = fs.readFileSync(MANIFEST_PATH, 'utf-8').split(/\r?\n/)

  const updates = []
  for (const line of lines) {
    const parsed = parseReleaseLine(line)
    if (parsed) updates.push(parsed)
  }

  if (updates.length === 0) {
    console.log('No release lines parsed. Expected lines like: sdk-bridging-v1.6.0')
    process.exit(0)
  }

  const workspaces = getWorkspaces()
  console.log(`Found ${workspaces.length} workspaces, ${updates.length} package versions to apply.\n`)

  for (const { npmName, version } of updates) {
    const targets = workspacesWithPackage(workspaces, npmName)
    if (targets.length === 0) {
      console.log(`Skip ${npmName}@${version} (no workspace depends on it)`)
      continue
    }
    console.log(`Updating ${npmName}@${version} in ${targets.length} workspace(s)`)
    for (const w of targets) {
      pnpmAddInWorkspace(npmName, version, w.name, dryRun)
    }
  }

  console.log('\nDone.')
}

main()
