#!/usr/bin/env node

/**
 * Prepares a built package for publishing by:
 * 1. Applying publishConfig overrides to the package.json
 * 2. Resolving workspace:* dependencies to actual versions
 * 3. Changing the main entry point to .js file. It should be .ts in the original code to keep local libs imports
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '../..')

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf-8'))
}

function writeJson(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n')
}

function getWorkspaceVersions() {
  // Read all libs package.json to get current versions
  const versions = {}
  const libsDir = join(rootDir, 'libs')

  for (const lib of readdirSync(libsDir)) {
    const pkgPath = join(libsDir, lib, 'package.json')
    if (existsSync(pkgPath)) {
      const pkg = readJson(pkgPath)
      if (pkg.name) {
        versions[pkg.name] = pkg.version
      }
    }
  }

  return versions
}

function preparePackage(distPkgPath) {
  const pkg = readJson(distPkgPath)
  const workspaceVersions = getWorkspaceVersions()

  // Apply publishConfig overrides
  if (pkg.publishConfig) {
    const { access, registry, tag, ...overrides } = pkg.publishConfig

    // Apply field overrides (main, types, exports, etc.)
    for (const [key, value] of Object.entries(overrides)) {
      pkg[key] = value
    }

    // Keep only publishing-related fields in publishConfig
    pkg.publishConfig = {}
    if (access) pkg.publishConfig.access = access
    if (registry) pkg.publishConfig.registry = registry
    if (tag) pkg.publishConfig.tag = tag

    // Remove empty publishConfig
    if (Object.keys(pkg.publishConfig).length === 0) {
      delete pkg.publishConfig
    }
  }

  // Resolve workspace:* dependencies
  for (const depType of ['dependencies', 'devDependencies', 'peerDependencies']) {
    const deps = pkg[depType]
    if (!deps) continue

    for (const [name, version] of Object.entries(deps)) {
      if (version.startsWith('workspace:')) {
        const actualVersion = workspaceVersions[name]
        if (actualVersion) {
          deps[name] = `^${actualVersion}`
        } else {
          console.warn(`Warning: Could not resolve workspace version for ${name}`)
        }
      }
    }
  }

  // Remove private: true if it exists (shouldn't be there for publishable libs)
  if (pkg.private === true) {
    console.warn(`Warning: Package ${pkg.name} has private: true, removing it`)
    delete pkg.private
  }

  // Change entry point to compiled JS
  if (pkg.main === './src/index.ts') {
    pkg.main = './src/index.js'
  }

  writeJson(distPkgPath, pkg)
  console.log(`Prepared ${pkg.name}@${pkg.version} for publishing`)
}

// Main
const distPkgPath = process.argv[2]

if (!distPkgPath) {
  console.error('Usage: node prepare-publish.mjs <path-to-dist-package.json>')
  process.exit(1)
}

if (!existsSync(distPkgPath)) {
  console.error(`File not found: ${distPkgPath}`)
  process.exit(1)
}

preparePackage(distPkgPath)
