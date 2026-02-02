#!/usr/bin/env node

/**
 * Script to clean up root package.json by removing dependencies that are
 * defined in app/lib package.json files.
 *
 * This script:
 * 1. Iterates through all apps and libs in apps/ and libs/ directories
 * 2. Collects all dependencies and devDependencies from each package.json
 * 3. Removes those dependencies from the root package.json
 *
 * Usage:
 *   node tools/scripts/clean-root-deps.js [--dry-run]
 *
 * Options:
 *   --dry-run    Show what would be removed without making changes
 */

const fs = require('fs')
const path = require('path')

const ROOT_DIR = path.resolve(__dirname, '../..')
const APPS_DIR = path.join(ROOT_DIR, 'apps')
const LIBS_DIR = path.join(ROOT_DIR, 'libs')
const ROOT_PACKAGE_JSON_PATH = path.join(ROOT_DIR, 'package.json')

const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')

/**
 * Get all directories in a given path
 */
function getDirectories(basePath) {
  if (!fs.existsSync(basePath)) return []

  return fs
    .readdirSync(basePath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => path.join(basePath, dirent.name))
}

/**
 * Read package.json from a directory
 */
function readPackageJson(dir) {
  const packageJsonPath = path.join(dir, 'package.json')
  if (!fs.existsSync(packageJsonPath)) {
    return null
  }
  try {
    return JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
  } catch (e) {
    console.error(`  Error reading ${packageJsonPath}: ${e.message}`)
    return null
  }
}

/**
 * Collect all non-workspace dependencies from app/lib package.json files
 */
function collectPackageDeps(packageDirs) {
  const deps = new Set()
  const devDeps = new Set()

  for (const dir of packageDirs) {
    const packageJson = readPackageJson(dir)
    if (!packageJson) continue

    const packageName = packageJson.name || path.basename(dir)

    // Collect dependencies (skip workspace:* references)
    if (packageJson.dependencies) {
      for (const [dep, version] of Object.entries(packageJson.dependencies)) {
        if (typeof version === 'string' && !version.startsWith('workspace:')) {
          deps.add(dep)
        }
      }
    }

    // Collect devDependencies (skip workspace:* references)
    if (packageJson.devDependencies) {
      for (const [dep, version] of Object.entries(packageJson.devDependencies)) {
        if (typeof version === 'string' && !version.startsWith('workspace:')) {
          devDeps.add(dep)
        }
      }
    }
  }

  return { deps, devDeps }
}

/**
 * Remove dependencies from an object and return the removed ones
 */
function removeDeps(depsObj, toRemove) {
  const removed = []
  for (const dep of toRemove) {
    if (depsObj[dep]) {
      removed.push({ name: dep, version: depsObj[dep] })
      delete depsObj[dep]
    }
  }
  return removed
}

// Main execution
console.log('='.repeat(60))
console.log('Cleaning root package.json dependencies')
if (DRY_RUN) {
  console.log('(DRY RUN - no changes will be made)')
}
console.log('='.repeat(60))

// Get all app and lib directories
const apps = getDirectories(APPS_DIR)
const libs = getDirectories(LIBS_DIR)
const allPackages = [...apps, ...libs]

console.log(`\nFound ${apps.length} apps and ${libs.length} libs`)

// Collect all dependencies from app/lib package.json files
const { deps: packageDeps, devDeps: packageDevDeps } = collectPackageDeps(allPackages)

console.log(`\nCollected ${packageDeps.size} dependencies and ${packageDevDeps.size} devDependencies from packages`)

// Read root package.json
const rootPackageJson = JSON.parse(fs.readFileSync(ROOT_PACKAGE_JSON_PATH, 'utf-8'))

// Remove dependencies that are defined in packages
const removedDeps = removeDeps(rootPackageJson.dependencies || {}, packageDeps)
const removedDevDeps = removeDeps(rootPackageJson.devDependencies || {}, packageDevDeps)

// Also check if any devDep in root is a regular dep in packages (or vice versa)
const removedDepsFromDevDeps = removeDeps(rootPackageJson.devDependencies || {}, packageDeps)
const removedDevDepsFromDeps = removeDeps(rootPackageJson.dependencies || {}, packageDevDeps)

const allRemovedDeps = [...removedDeps, ...removedDevDepsFromDeps]
const allRemovedDevDeps = [...removedDevDeps, ...removedDepsFromDevDeps]

// Report what was removed
if (allRemovedDeps.length > 0) {
  console.log(`\nRemoved ${allRemovedDeps.length} from dependencies:`)
  for (const { name, version } of allRemovedDeps.sort((a, b) => a.name.localeCompare(b.name))) {
    console.log(`  - ${name}: ${version}`)
  }
}

if (allRemovedDevDeps.length > 0) {
  console.log(`\nRemoved ${allRemovedDevDeps.length} from devDependencies:`)
  for (const { name, version } of allRemovedDevDeps.sort((a, b) => a.name.localeCompare(b.name))) {
    console.log(`  - ${name}: ${version}`)
  }
}

const totalRemoved = allRemovedDeps.length + allRemovedDevDeps.length

if (totalRemoved === 0) {
  console.log('\nNo dependencies to remove from root package.json')
} else if (!DRY_RUN) {
  // Write updated root package.json
  fs.writeFileSync(ROOT_PACKAGE_JSON_PATH, JSON.stringify(rootPackageJson, null, 2) + '\n')
  console.log(`\nUpdated ${ROOT_PACKAGE_JSON_PATH}`)
}

console.log('\n' + '='.repeat(60))
console.log(`Done! ${DRY_RUN ? 'Would remove' : 'Removed'} ${totalRemoved} dependencies from root package.json`)
console.log('='.repeat(60))
