#!/usr/bin/env node

/**
 * Script to sync npm dependencies from imports to package.json files.
 *
 * This script:
 * 1. Iterates through all apps and libs in apps/ and libs/ directories
 * 2. Crawls all .ts, .tsx, and .js files in each app/lib
 * 3. Finds all imported npm dependencies from those files
 * 4. Gets the version from the root package.json
 * 5. Adds those dependencies to the corresponding app/lib's package.json
 */

const fs = require('fs')
const path = require('path')

const ROOT_DIR = path.resolve(__dirname, '../..')
const APPS_DIR = path.join(ROOT_DIR, 'apps')
const LIBS_DIR = path.join(ROOT_DIR, 'libs')

// Read root package.json
const rootPackageJson = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf-8'))
const rootDeps = rootPackageJson.dependencies || {}
const rootDevDeps = rootPackageJson.devDependencies || {}

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

// @cowprotocol packages that are actual npm packages (not workspace packages)
const COWPROTOCOL_NPM_PACKAGES = new Set([
  '@cowprotocol/cms',
  '@cowprotocol/cow-runner-game',
  '@cowprotocol/cow-sdk',
  '@cowprotocol/sdk-bridging',
  '@cowprotocol/sdk-composable',
  '@cowprotocol/sdk-cow-shed',
  '@cowprotocol/sdk-ethers-v5-adapter',
  '@cowprotocol/sdk-subgraph',
])

// Node.js built-in modules
const NODE_BUILTINS = new Set([
  'fs',
  'path',
  'os',
  'crypto',
  'http',
  'https',
  'url',
  'util',
  'stream',
  'events',
  'buffer',
  'child_process',
  'cluster',
  'dgram',
  'dns',
  'net',
  'readline',
  'repl',
  'tls',
  'tty',
  'zlib',
  'assert',
  'module',
  'process',
  'querystring',
  'string_decoder',
  'timers',
  'vm',
  'worker_threads',
  'perf_hooks',
  'async_hooks',
  'inspector',
  'trace_events',
  'v8',
  'constants',
  'fs/promises',
  'stream/promises',
  'stream/web',
  'timers/promises',
])

/**
 * Extract the npm package name from an import path.
 * Handles scoped packages like @scope/package and subpath imports like package/subpath.
 * Maps @ethersproject/* to ethers.
 */
function extractPackageName(importPath) {
  if (!importPath) return null

  // Skip relative imports
  if (importPath.startsWith('.') || importPath.startsWith('/')) {
    return null
  }

  // Map @ethersproject/* imports to ethers
  if (importPath.startsWith('@ethersproject/')) {
    return 'ethers'
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
 * Check if a @cowprotocol package is a workspace package (not an npm package)
 */
function isCowprotocolWorkspacePackage(packageName) {
  if (!packageName) return false
  if (!packageName.startsWith('@cowprotocol/')) return false
  // If it's in the npm packages list, it's NOT a workspace package
  return !COWPROTOCOL_NPM_PACKAGES.has(packageName)
}

/**
 * Check if a package is a Node.js built-in module
 */
function isNodeBuiltin(packageName) {
  if (!packageName) return true
  // Skip node built-in modules
  if (NODE_BUILTINS.has(packageName)) return true
  // Skip node: prefixed imports
  if (packageName.startsWith('node:')) return true
  return false
}

/**
 * Check if an import path resolves to a local file in the package
 */
function isLocalImport(importPath, packageDir, baseUrl) {
  if (!importPath) return true

  // Get the package name part (first segment for scoped, first for regular)
  const packageName = extractPackageName(importPath)
  if (!packageName) return true

  // If it's a scoped package, it's not a local import
  if (packageName.startsWith('@')) {
    return false
  }

  // Check if this could be a local path alias
  // Common patterns: single-word imports that match directories in src
  const srcDir = path.join(packageDir, baseUrl || 'src')

  if (fs.existsSync(srcDir)) {
    // Check if there's a matching directory or file in src
    const possiblePaths = [
      path.join(srcDir, packageName),
      path.join(srcDir, packageName + '.ts'),
      path.join(srcDir, packageName + '.tsx'),
      path.join(srcDir, packageName + '.js'),
      path.join(srcDir, packageName, 'index.ts'),
      path.join(srcDir, packageName, 'index.tsx'),
      path.join(srcDir, packageName, 'index.js'),
    ]

    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        return true
      }
    }
  }

  return false
}

/**
 * Parse tsconfig.json to get baseUrl
 */
function getTsConfigBaseUrl(packageDir) {
  const tsConfigPaths = [
    path.join(packageDir, 'tsconfig.json'),
    path.join(packageDir, 'tsconfig.app.json'),
    path.join(packageDir, 'tsconfig.lib.json'),
  ]

  for (const tsConfigPath of tsConfigPaths) {
    if (fs.existsSync(tsConfigPath)) {
      try {
        const content = fs.readFileSync(tsConfigPath, 'utf-8')
        // Remove comments from JSON (simple approach)
        const jsonContent = content.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '')
        const tsConfig = JSON.parse(jsonContent)
        if (tsConfig.compilerOptions?.baseUrl) {
          return tsConfig.compilerOptions.baseUrl
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }
  }

  return null
}

/**
 * Get all .ts, .tsx, .js files in a directory recursively
 */
function getSourceFiles(dir) {
  const files = []

  function walk(currentDir) {
    if (!fs.existsSync(currentDir)) return

    const entries = fs.readdirSync(currentDir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name)

      // Skip node_modules and hidden directories
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) {
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
 * Extract all dependencies from a source file
 * Returns { npmDeps: Set, workspaceDeps: Set }
 */
function extractDependencies(filePath, packageDir, baseUrl) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const npmDeps = new Set()
  const workspaceDeps = new Set()

  for (const pattern of IMPORT_PATTERNS) {
    // Reset regex lastIndex
    pattern.lastIndex = 0
    let match

    while ((match = pattern.exec(content)) !== null) {
      const importPath = match[1]
      const packageName = extractPackageName(importPath)

      if (!packageName || isNodeBuiltin(packageName) || isLocalImport(importPath, packageDir, baseUrl)) {
        continue
      }

      // Check if it's a @cowprotocol workspace package
      if (isCowprotocolWorkspacePackage(packageName)) {
        workspaceDeps.add(packageName)
      } else {
        npmDeps.add(packageName)
      }
    }
  }

  return { npmDeps, workspaceDeps }
}

/**
 * Get the version and type (dep or devDep) for a package from root package.json
 */
function getPackageInfo(packageName) {
  if (rootDeps[packageName]) {
    return { version: rootDeps[packageName], type: 'dependencies' }
  }
  if (rootDevDeps[packageName]) {
    return { version: rootDevDeps[packageName], type: 'devDependencies' }
  }
  return null
}

/**
 * Get the @types/* package name for a given package
 * For scoped packages like @scope/package, the types package is @types/scope__package
 */
function getTypesPackageName(packageName) {
  if (!packageName) return null

  // Handle scoped packages: @scope/package -> @types/scope__package
  if (packageName.startsWith('@')) {
    const withoutAt = packageName.slice(1) // Remove @
    const typesName = withoutAt.replace('/', '__') // Replace / with __
    return `@types/${typesName}`
  }

  // Regular packages: package -> @types/package
  return `@types/${packageName}`
}

/**
 * Get the @types/* package info if it exists in root devDependencies
 */
function getTypesPackageInfo(packageName) {
  const typesPackageName = getTypesPackageName(packageName)
  if (!typesPackageName) return null

  if (rootDevDeps[typesPackageName]) {
    return { name: typesPackageName, version: rootDevDeps[typesPackageName] }
  }
  return null
}

/**
 * Process a single app or lib
 */
function processPackage(packageDir) {
  const packageJsonPath = path.join(packageDir, 'package.json')

  if (!fs.existsSync(packageJsonPath)) {
    console.log(`  Skipping ${packageDir} - no package.json`)
    return
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
  const packageName = packageJson.name || path.basename(packageDir)

  console.log(`\nProcessing: ${packageName}`)

  // Get tsconfig baseUrl
  const baseUrl = getTsConfigBaseUrl(packageDir)

  // Get all source files
  const srcDir = path.join(packageDir, 'src')
  const sourceFiles = fs.existsSync(srcDir) ? getSourceFiles(srcDir) : getSourceFiles(packageDir)

  console.log(`  Found ${sourceFiles.length} source files`)

  // Collect all dependencies
  const allNpmDeps = new Set()
  const allWorkspaceDeps = new Set()

  for (const file of sourceFiles) {
    const { npmDeps, workspaceDeps } = extractDependencies(file, packageDir, baseUrl)
    npmDeps.forEach((dep) => allNpmDeps.add(dep))
    workspaceDeps.forEach((dep) => allWorkspaceDeps.add(dep))
  }

  console.log(`  Found ${allNpmDeps.size} unique npm imports, ${allWorkspaceDeps.size} workspace imports`)

  // Separate npm deps into deps and devDeps based on root package.json
  const newDeps = {}
  const newDevDeps = {}
  const missingFromRoot = []
  let typesPackagesAdded = 0

  for (const dep of allNpmDeps) {
    const info = getPackageInfo(dep)
    if (info) {
      if (info.type === 'dependencies') {
        newDeps[dep] = info.version
      } else {
        newDevDeps[dep] = info.version
      }

      // Check for corresponding @types/* package
      const typesInfo = getTypesPackageInfo(dep)
      if (typesInfo) {
        newDevDeps[typesInfo.name] = typesInfo.version
        typesPackagesAdded++
      }
    } else {
      missingFromRoot.push(dep)
    }
  }

  // Add workspace dependencies with workspace:* version
  for (const dep of allWorkspaceDeps) {
    newDeps[dep] = 'workspace:*'
  }

  if (missingFromRoot.length > 0) {
    console.log(`  Warning: ${missingFromRoot.length} packages not found in root package.json:`)
    missingFromRoot.forEach((dep) => console.log(`    - ${dep}`))
  }

  // Merge and sort dependencies
  const finalDeps = { ...newDeps }
  const finalDevDeps = { ...newDevDeps }

  // Sort dependencies alphabetically
  const sortObject = (obj) => {
    return Object.keys(obj)
      .sort()
      .reduce((result, key) => {
        result[key] = obj[key]
        return result
      }, {})
  }

  // Update package.json
  if (Object.keys(finalDeps).length > 0) {
    packageJson.dependencies = sortObject(finalDeps)
  }

  if (Object.keys(finalDevDeps).length > 0) {
    packageJson.devDependencies = sortObject(finalDevDeps)
  }

  // Write updated package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')

  const addedDeps = Object.keys(finalDeps).length
  const addedDevDeps = Object.keys(finalDevDeps).length
  const workspaceCount = allWorkspaceDeps.size
  console.log(
    `  Added ${addedDeps} dependencies (${workspaceCount} workspace), ${addedDevDeps} devDependencies (${typesPackagesAdded} @types)`
  )
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

// Main execution
console.log('='.repeat(60))
console.log('Syncing npm dependencies from imports to package.json files')
console.log('='.repeat(60))

console.log('\n--- Processing Apps ---')
const apps = getDirectories(APPS_DIR)
for (const app of apps) {
  processPackage(app)
}

console.log('\n--- Processing Libs ---')
const libs = getDirectories(LIBS_DIR)
for (const lib of libs) {
  processPackage(lib)
}

console.log('\n' + '='.repeat(60))
console.log('Done!')
console.log('='.repeat(60))
