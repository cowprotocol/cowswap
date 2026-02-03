#!/usr/bin/env node

/**
 * Script to find and add transitive dependencies to package.json files.
 *
 * This script:
 * 1. Iterates through all apps and libs in apps/ and libs/ directories
 * 2. Crawls all .ts, .tsx, .js files in each app/lib
 * 3. Finds all npm imports that are NOT in the package's package.json
 * 4. Checks if they exist in node_modules (transitive dependencies)
 * 5. Adds them to the package.json with the installed version
 *
 * Usage:
 *   node tools/scripts/sync-transitive-deps.js [--dry-run]
 *
 * Options:
 *   --dry-run    Show what would be added without making changes
 */

const fs = require('fs')
const path = require('path')

const ROOT_DIR = path.resolve(__dirname, '../..')
const APPS_DIR = path.join(ROOT_DIR, 'apps')
const LIBS_DIR = path.join(ROOT_DIR, 'libs')
const NODE_MODULES_DIR = path.join(ROOT_DIR, 'node_modules')
const PNPM_DIR = path.join(NODE_MODULES_DIR, '.pnpm')

const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')

// Cache for pnpm package lookups
const pnpmPackageCache = new Map()

// Regex patterns to match imports
const IMPORT_PATTERNS = [
  // import x from 'package'
  // import { x } from 'package'
  // import * as x from 'package'
  // import 'package'
  /import\s+(?:(?:[\w*{}\s,]+)\s+from\s+)?['"]([^'"./][^'"]*)['"]/g,
  // export { x } from 'package'
  // export * from 'package'
  /export\s+(?:\*|{[^}]*})\s+from\s+['"]([^'"./][^'"]*)['"]/g,
  // require('package')
  /require\s*\(\s*['"]([^'"./][^'"]*)['"]\s*\)/g,
  // dynamic import('package')
  /import\s*\(\s*['"]([^'"./][^'"]*)['"]\s*\)/g,
]

// Node.js built-in modules to skip
const NODE_BUILTINS = new Set([
  'fs', 'path', 'os', 'crypto', 'http', 'https', 'url', 'util', 'stream',
  'events', 'buffer', 'child_process', 'cluster', 'dgram', 'dns', 'net',
  'readline', 'repl', 'tls', 'tty', 'zlib', 'assert', 'module', 'process',
  'querystring', 'string_decoder', 'timers', 'vm', 'worker_threads',
  'perf_hooks', 'async_hooks', 'inspector', 'trace_events', 'v8', 'constants',
  'fs/promises', 'stream/promises', 'stream/web', 'timers/promises',
])

/**
 * Extract the npm package name from an import path.
 * Handles scoped packages like @scope/package and subpath imports like package/subpath.
 */
function extractPackageName(importPath) {
  if (!importPath) return null

  // Skip relative imports
  if (importPath.startsWith('.') || importPath.startsWith('/')) {
    return null
  }

  // Handle scoped packages (@scope/package)
  if (importPath.startsWith('@')) {
    const parts = importPath.split('/')
    if (parts.length >= 2) {
      return `${parts[0]}/${parts[1]}`
    }
    return null
  }

  // Handle regular packages (package or package/subpath)
  const parts = importPath.split('/')
  return parts[0]
}

/**
 * Check if a package is a Node.js built-in module
 */
function isNodeBuiltin(packageName) {
  if (!packageName) return true
  if (NODE_BUILTINS.has(packageName)) return true
  if (packageName.startsWith('node:')) return true
  return false
}

/**
 * Check if a package is a workspace package
 */
function isWorkspacePackage(packageName) {
  if (!packageName) return false
  // @cowprotocol packages that are workspace packages (not npm)
  if (packageName.startsWith('@cowprotocol/')) {
    // Check if it's in libs or apps
    const shortName = packageName.replace('@cowprotocol/', '')
    const possiblePaths = [
      path.join(LIBS_DIR, shortName),
      path.join(LIBS_DIR, shortName.replace('cowswap-', '')),
      path.join(APPS_DIR, shortName),
      path.join(APPS_DIR, shortName.replace('cowswap-', '')),
    ]

    for (const p of possiblePaths) {
      if (fs.existsSync(path.join(p, 'package.json'))) {
        return true
      }
    }
  }
  return false
}

/**
 * Get all .ts, .tsx, .js, .jsx files in a directory recursively
 */
function getSourceFiles(dir) {
  const files = []

  function walk(currentDir) {
    if (!fs.existsSync(currentDir)) return

    const entries = fs.readdirSync(currentDir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name)

      // Skip node_modules, hidden directories, and dist
      if (entry.name === 'node_modules' || entry.name.startsWith('.') || entry.name === 'dist') {
        continue
      }

      if (entry.isDirectory()) {
        walk(fullPath)
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name)
        if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
          files.push(fullPath)
        }
      }
    }
  }

  walk(dir)
  return files
}

/**
 * Extract all npm package imports from a source file
 */
function extractImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const imports = new Set()

  for (const pattern of IMPORT_PATTERNS) {
    pattern.lastIndex = 0
    let match

    while ((match = pattern.exec(content)) !== null) {
      const importPath = match[1]
      const packageName = extractPackageName(importPath)

      if (packageName && !isNodeBuiltin(packageName) && !isWorkspacePackage(packageName)) {
        imports.add(packageName)
      }
    }
  }

  return imports
}

/**
 * Find a package in pnpm's .pnpm directory
 * Returns the path to the package directory or null if not found
 */
function findPnpmPackage(packageName) {
  if (pnpmPackageCache.has(packageName)) {
    return pnpmPackageCache.get(packageName)
  }

  // First check if it's directly in node_modules (symlinked)
  const directPath = path.join(NODE_MODULES_DIR, packageName, 'package.json')
  if (fs.existsSync(directPath)) {
    pnpmPackageCache.set(packageName, path.join(NODE_MODULES_DIR, packageName))
    return path.join(NODE_MODULES_DIR, packageName)
  }

  // Check in .pnpm directory
  // pnpm uses format: @scope+package@version or package@version
  if (!fs.existsSync(PNPM_DIR)) {
    pnpmPackageCache.set(packageName, null)
    return null
  }

  const pnpmName = packageName.replace('/', '+')

  try {
    const entries = fs.readdirSync(PNPM_DIR)

    // Find directories that match the package name pattern
    const matching = entries.filter(entry => {
      // Match @scope+package@version or package@version
      return entry.startsWith(pnpmName + '@')
    })

    if (matching.length > 0) {
      // Sort to get the latest version (simple string sort works for semver in most cases)
      matching.sort().reverse()
      const pnpmPackageDir = path.join(PNPM_DIR, matching[0], 'node_modules', packageName)

      if (fs.existsSync(path.join(pnpmPackageDir, 'package.json'))) {
        pnpmPackageCache.set(packageName, pnpmPackageDir)
        return pnpmPackageDir
      }
    }
  } catch (e) {
    // Ignore errors
  }

  pnpmPackageCache.set(packageName, null)
  return null
}

/**
 * Get version of an installed package from node_modules or pnpm store
 */
function getInstalledVersion(packageName) {
  const packageDir = findPnpmPackage(packageName)

  if (!packageDir) {
    return null
  }

  const packageJsonPath = path.join(packageDir, 'package.json')

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
    return packageJson.version
  } catch (e) {
    return null
  }
}

/**
 * Check if a package exists in node_modules or pnpm store
 */
function isInstalledInNodeModules(packageName) {
  return findPnpmPackage(packageName) !== null
}

/**
 * Get all dependencies from a package.json (both deps and devDeps)
 */
function getAllDeclaredDeps(packageJson) {
  const deps = new Set()

  if (packageJson.dependencies) {
    Object.keys(packageJson.dependencies).forEach(dep => deps.add(dep))
  }
  if (packageJson.devDependencies) {
    Object.keys(packageJson.devDependencies).forEach(dep => deps.add(dep))
  }

  return deps
}

/**
 * Sort object keys alphabetically
 */
function sortObject(obj) {
  return Object.keys(obj)
    .sort()
    .reduce((result, key) => {
      result[key] = obj[key]
      return result
    }, {})
}

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
 * Process a single app or lib
 */
function processPackage(packageDir) {
  const packageJsonPath = path.join(packageDir, 'package.json')

  if (!fs.existsSync(packageJsonPath)) {
    return { name: path.basename(packageDir), added: [], skipped: true }
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
  const packageName = packageJson.name || path.basename(packageDir)

  // Get all source files
  const srcDir = path.join(packageDir, 'src')
  const sourceFiles = fs.existsSync(srcDir) ? getSourceFiles(srcDir) : getSourceFiles(packageDir)

  // Collect all imports
  const allImports = new Set()
  for (const file of sourceFiles) {
    const imports = extractImports(file)
    imports.forEach(imp => allImports.add(imp))
  }

  // Get declared dependencies
  const declaredDeps = getAllDeclaredDeps(packageJson)

  // Find missing dependencies that are installed (transitive)
  const missingTransitive = []

  for (const imp of allImports) {
    if (!declaredDeps.has(imp) && isInstalledInNodeModules(imp)) {
      const version = getInstalledVersion(imp)
      if (version) {
        missingTransitive.push({ name: imp, version: `^${version}` })
      }
    }
  }

  if (missingTransitive.length === 0) {
    return { name: packageName, added: [], skipped: false }
  }

  // Add missing dependencies
  if (!packageJson.dependencies) {
    packageJson.dependencies = {}
  }

  for (const dep of missingTransitive) {
    packageJson.dependencies[dep.name] = dep.version
  }

  if (!DRY_RUN) {
    packageJson.dependencies = sortObject(packageJson.dependencies)
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')
  }

  return {
    name: packageName,
    added: missingTransitive.sort((a, b) => a.name.localeCompare(b.name)),
    skipped: false
  }
}

// Main execution
console.log('='.repeat(60))
console.log('Syncing transitive dependencies to package.json files')
if (DRY_RUN) {
  console.log('(DRY RUN - no changes will be made)')
}
console.log('='.repeat(60))

// Get all app and lib directories
const apps = getDirectories(APPS_DIR)
const libs = getDirectories(LIBS_DIR)

let totalAdded = 0

console.log('\n--- Processing Apps ---')
for (const app of apps) {
  const result = processPackage(app)
  if (result.skipped) {
    console.log(`\n${result.name}: skipped (no package.json)`)
  } else if (result.added.length > 0) {
    console.log(`\n${result.name}: adding ${result.added.length} transitive dependencies`)
    result.added.forEach(dep => console.log(`  + ${dep.name}: ${dep.version}`))
    totalAdded += result.added.length
  }
}

console.log('\n--- Processing Libs ---')
for (const lib of libs) {
  const result = processPackage(lib)
  if (result.skipped) {
    console.log(`\n${result.name}: skipped (no package.json)`)
  } else if (result.added.length > 0) {
    console.log(`\n${result.name}: adding ${result.added.length} transitive dependencies`)
    result.added.forEach(dep => console.log(`  + ${dep.name}: ${dep.version}`))
    totalAdded += result.added.length
  }
}

console.log('\n' + '='.repeat(60))
console.log(`Done! ${DRY_RUN ? 'Would add' : 'Added'} ${totalAdded} transitive dependencies`)
console.log('='.repeat(60))
