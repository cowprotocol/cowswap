#!/usr/bin/env node

/**
 * Script to find and remove unused npm dependencies from all package.json files.
 *
 * This script analyzes actual code usage to find dependencies that are never imported.
 * It handles:
 * - Regular imports (import/require)
 * - Dynamic imports
 * - Config file references (babel, eslint, jest, vite, etc.)
 * - CLI tools (bin references)
 * - Type-only imports (@types/*)
 * - Peer dependencies and workspace references
 *
 * Usage:
 *   node tools/scripts/remove-unused-deps.js [options]
 *
 * Options:
 *   --dry-run       Show what would be removed without making changes
 *   --root-only     Only check root package.json
 *   --verbose       Show detailed analysis for each package
 *   --include-dev   Include devDependencies in the analysis (default: true)
 *   --json          Output results as JSON
 */

const { _execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const ROOT_DIR = path.resolve(__dirname, '../..')
const APPS_DIR = path.join(ROOT_DIR, 'apps')
const LIBS_DIR = path.join(ROOT_DIR, 'libs')

// Parse CLI arguments
const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const ROOT_ONLY = args.includes('--root-only')
const VERBOSE = args.includes('--verbose')
const JSON_OUTPUT = args.includes('--json')
const SHOW_HELP = args.includes('--help') || args.includes('-h')

// Parse --ignore=pkg1,pkg2 or --ignore pkg1,pkg2
let IGNORED_PACKAGES = new Set()
const ignoreIndex = args.findIndex((arg) => arg.startsWith('--ignore'))
if (ignoreIndex !== -1) {
  const ignoreArg = args[ignoreIndex]
  if (ignoreArg.includes('=')) {
    IGNORED_PACKAGES = new Set(ignoreArg.split('=')[1].split(','))
  } else if (args[ignoreIndex + 1] && !args[ignoreIndex + 1].startsWith('--')) {
    IGNORED_PACKAGES = new Set(args[ignoreIndex + 1].split(','))
  }
}

// Help text
const HELP_TEXT = `
Usage: node tools/scripts/remove-unused-deps.js [options]

Find and remove unused npm dependencies from all package.json files.

Options:
  --dry-run           Show what would be removed without making changes
  --root-only         Only check root package.json
  --verbose           Show detailed analysis for each package
  --json              Output results as JSON
  --ignore=pkg1,pkg2  Comma-separated list of packages to ignore
  --help, -h          Show this help message

Examples:
  # Preview unused dependencies
  node tools/scripts/remove-unused-deps.js --dry-run

  # Remove unused dependencies
  node tools/scripts/remove-unused-deps.js

  # Check only root package.json
  node tools/scripts/remove-unused-deps.js --dry-run --root-only

  # Ignore specific packages
  node tools/scripts/remove-unused-deps.js --dry-run --ignore=react-is,web3modal
`

if (SHOW_HELP) {
  console.log(HELP_TEXT)
  process.exit(0)
}

// File extensions to scan for imports
const CODE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.mts', '.cts']
const CONFIG_EXTENSIONS = ['.js', '.cjs', '.mjs', '.ts', '.json', '.yaml', '.yml']

// Config files that may reference dependencies
const CONFIG_FILE_PATTERNS = [
  'vite.config',
  'vitest.config',
  'jest.config',
  'babel.config',
  '.babelrc',
  'webpack.config',
  'rollup.config',
  'eslint.config',
  '.eslintrc',
  'prettier.config',
  '.prettierrc',
  'postcss.config',
  'tailwind.config',
  'tsconfig',
  'next.config',
  'lingui.config',
  '.swcrc',
  'commitlint.config',
]

// Dependencies that are always considered "used" (tools, plugins, etc.)
const ALWAYS_USED_PATTERNS = [
  /^@types\//, // TypeScript types
  /^@nx\//, // Nx plugins
  /^eslint/, // ESLint and plugins/configs
  /^prettier/, // Prettier
  /^@babel\//, // Babel presets/plugins
  /^babel-/, // Babel presets/plugins
  /^@swc\//, // SWC plugins
  /^@vitejs\//, // Vite plugins
  /^vite-plugin-/, // Vite plugins
  /^vite-tsconfig/, // Vite tsconfig paths
  /^@sentry\//, // Sentry plugins
  /^@testing-library\//, // Testing library
  /^@commitlint\//, // Commitlint
  /^jest/, // Jest related
  /^ts-jest/, // ts-jest
  /^typescript$/, // TypeScript compiler
  /^husky$/, // Git hooks
  /^lint-staged$/, // Lint staged
  /^cross-env$/, // Cross-env CLI
  /^patch-package$/, // Patch package CLI
  /^typechain$/, // Typechain CLI
  /^@lingui\//, // Lingui i18n
  /^@swc-node\//, // SWC Node
  /^rollup-plugin-/, // Rollup plugins
  /^@vitest\//, // Vitest
  /^vitest$/, // Vitest
  /^postcss/, // PostCSS
  /^autoprefixer/, // Autoprefixer
  /^tailwindcss/, // Tailwind CSS
  /^next-sitemap/, // Next sitemap
  /^@typechain\//, // Typechain
  /^styled-jsx$/, // Styled JSX (Next.js)
  /^tslib$/, // TypeScript runtime helpers
  /^@swc\/helpers$/, // SWC helpers
  /^react-cosmos/, // React Cosmos
  /^cypress/, // Cypress
  /^workbox-/, // Workbox (PWA)
  /^@web3-react\//, // Web3 React
  /^jsdom$/, // JSDOM for testing
  /^isomorphic-fetch$/, // Fetch polyfill
  /^node-stdlib-browser$/, // Node polyfills
]

// Packages that are often required as peer deps (not directly imported)
const PEER_DEP_LIKE_PATTERNS = [/^react$/, /^react-dom$/, /^csstype$/]

// Dependencies that should be checked via peer dependencies
const _PEER_DEP_PACKAGES = new Set(['react', 'react-dom', 'next'])

// Package name mappings (import path -> declared dependency)
// This handles cases where the import differs from the package name
const PACKAGE_MAPPINGS = {
  // ethers v5 uses @ethersproject/* subpackages
  '@ethersproject/abi': 'ethers',
  '@ethersproject/abstract-provider': 'ethers',
  '@ethersproject/abstract-signer': 'ethers',
  '@ethersproject/address': 'ethers',
  '@ethersproject/bignumber': 'ethers',
  '@ethersproject/bytes': 'ethers',
  '@ethersproject/constants': 'ethers',
  '@ethersproject/contracts': 'ethers',
  '@ethersproject/hash': 'ethers',
  '@ethersproject/hdnode': 'ethers',
  '@ethersproject/json-wallets': 'ethers',
  '@ethersproject/keccak256': 'ethers',
  '@ethersproject/logger': 'ethers',
  '@ethersproject/networks': 'ethers',
  '@ethersproject/pbkdf2': 'ethers',
  '@ethersproject/properties': 'ethers',
  '@ethersproject/providers': 'ethers',
  '@ethersproject/random': 'ethers',
  '@ethersproject/rlp': 'ethers',
  '@ethersproject/sha2': 'ethers',
  '@ethersproject/signing-key': 'ethers',
  '@ethersproject/solidity': 'ethers',
  '@ethersproject/strings': 'ethers',
  '@ethersproject/transactions': 'ethers',
  '@ethersproject/units': 'ethers',
  '@ethersproject/wallet': 'ethers',
  '@ethersproject/web': 'ethers',
  '@ethersproject/wordlists': 'ethers',
}

/**
 * Get all directories in a given path
 */
function getDirectories(basePath) {
  if (!fs.existsSync(basePath)) return []

  return fs
    .readdirSync(basePath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .filter((dirent) => !dirent.name.startsWith('.'))
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
    if (!JSON_OUTPUT) console.error(`  Error reading ${packageJsonPath}: ${e.message}`)
    return null
  }
}

/**
 * Write package.json to a directory
 */
function writePackageJson(dir, packageJson) {
  const packageJsonPath = path.join(dir, 'package.json')
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')
}

/**
 * Get all source files in a directory recursively
 */
function getSourceFiles(dir, extensions = CODE_EXTENSIONS) {
  const files = []

  function walk(currentDir) {
    if (!fs.existsSync(currentDir)) return

    const entries = fs.readdirSync(currentDir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name)

      // Skip common non-source directories
      if (entry.isDirectory()) {
        if (
          entry.name === 'node_modules' ||
          entry.name === 'dist' ||
          entry.name === 'build' ||
          entry.name === '.next' ||
          entry.name === '.git' ||
          entry.name === 'coverage' ||
          entry.name === '.nx'
        ) {
          continue
        }
        walk(fullPath)
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name)
        if (extensions.includes(ext)) {
          files.push(fullPath)
        }
      }
    }
  }

  walk(dir)
  return files
}

/**
 * Extract package name from import path
 * e.g., "@scope/package/deep/path" -> "@scope/package"
 * e.g., "lodash/get" -> "lodash"
 */
function extractPackageName(importPath) {
  if (!importPath || importPath.startsWith('.') || importPath.startsWith('/')) {
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

  // Handle regular packages
  const parts = importPath.split('/')
  return parts[0]
}

/**
 * Resolve package name using mappings
 */
function resolvePackageName(importedPkg) {
  // Check direct mapping
  if (PACKAGE_MAPPINGS[importedPkg]) {
    return [importedPkg, PACKAGE_MAPPINGS[importedPkg]]
  }
  return [importedPkg]
}

/**
 * Find all imports in a file
 */
function findImportsInFile(filePath) {
  const imports = new Set()

  try {
    const content = fs.readFileSync(filePath, 'utf-8')

    // ES6 imports: import x from 'package'
    const esImportRegex = /import\s+(?:[\w{}\s*,]+\s+from\s+)?['"]([^'"]+)['"]/g
    let match
    while ((match = esImportRegex.exec(content)) !== null) {
      const pkg = extractPackageName(match[1])
      if (pkg) {
        resolvePackageName(pkg).forEach((p) => imports.add(p))
      }
    }

    // Dynamic imports: import('package')
    const dynamicImportRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g
    while ((match = dynamicImportRegex.exec(content)) !== null) {
      const pkg = extractPackageName(match[1])
      if (pkg) {
        resolvePackageName(pkg).forEach((p) => imports.add(p))
      }
    }

    // CommonJS require: require('package')
    const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g
    while ((match = requireRegex.exec(content)) !== null) {
      const pkg = extractPackageName(match[1])
      if (pkg) {
        resolvePackageName(pkg).forEach((p) => imports.add(p))
      }
    }

    // Export from: export { x } from 'package'
    const exportFromRegex = /export\s+(?:[\w{}\s*,]+\s+)?from\s+['"]([^'"]+)['"]/g
    while ((match = exportFromRegex.exec(content)) !== null) {
      const pkg = extractPackageName(match[1])
      if (pkg) {
        resolvePackageName(pkg).forEach((p) => imports.add(p))
      }
    }

    // eslint-disable-next-line unused-imports/no-unused-vars
  } catch (e) {
    // Ignore read errors
  }

  return imports
}

/**
 * Find dependencies referenced in config files
 */
function findConfigDependencies(dir) {
  const deps = new Set()

  // Check for config files
  for (const pattern of CONFIG_FILE_PATTERNS) {
    for (const ext of CONFIG_EXTENSIONS) {
      const configPath = path.join(dir, pattern + ext)
      if (fs.existsSync(configPath)) {
        const imports = findImportsInFile(configPath)
        imports.forEach((imp) => deps.add(imp))

        // Also check for string references in JSON configs
        if (ext === '.json') {
          try {
            const content = fs.readFileSync(configPath, 'utf-8')
            // Look for plugin/preset references
            const stringRefs = content.match(/"([^"]+)"/g) || []
            for (const ref of stringRefs) {
              const cleaned = ref.replace(/"/g, '')
              if (cleaned.includes('/') || cleaned.match(/^[a-z@]/)) {
                const pkg = extractPackageName(cleaned)
                if (pkg) deps.add(pkg)
              }
            }
            // eslint-disable-next-line unused-imports/no-unused-vars
          } catch (e) {
            // Ignore
          }
        }
      }
    }
  }

  // Check package.json for script references
  const packageJson = readPackageJson(dir)
  if (packageJson?.scripts) {
    const scriptsStr = JSON.stringify(packageJson.scripts)
    // Look for CLI tool references in scripts
    const cliRefs = scriptsStr.match(/["'\s]([\w@/-]+)(?:\s|")/g) || []
    for (const ref of cliRefs) {
      const cleaned = ref.trim().replace(/["']/g, '')
      const pkg = extractPackageName(cleaned)
      if (pkg) deps.add(pkg)
    }
  }

  return deps
}

/**
 * Check if a dependency should always be considered used
 */
function isAlwaysUsed(depName) {
  return ALWAYS_USED_PATTERNS.some((pattern) => pattern.test(depName))
}

/**
 * Check if a dependency is a peer-dep-like package (react, react-dom, etc.)
 */
function isPeerDepLike(depName) {
  return PEER_DEP_LIKE_PATTERNS.some((pattern) => pattern.test(depName))
}

/**
 * Analyze a package directory for unused dependencies
 */
function analyzePackage(packageDir) {
  const packageJson = readPackageJson(packageDir)
  if (!packageJson) return null

  const packageName = packageJson.name || path.basename(packageDir)
  const dependencies = packageJson.dependencies || {}
  const devDependencies = packageJson.devDependencies || {}

  // Get all source files
  const sourceFiles = getSourceFiles(packageDir)

  // Find all imports across all source files
  const usedImports = new Set()
  for (const file of sourceFiles) {
    const imports = findImportsInFile(file)
    imports.forEach((imp) => usedImports.add(imp))
  }

  // Find config dependencies
  const configDeps = findConfigDependencies(packageDir)
  configDeps.forEach((dep) => usedImports.add(dep))

  // Analyze dependencies
  const unusedDeps = []
  const unusedDevDeps = []

  for (const [dep, version] of Object.entries(dependencies)) {
    // Skip workspace references
    if (typeof version === 'string' && version.startsWith('workspace:')) continue

    // Check if dependency is used
    if (!usedImports.has(dep) && !isAlwaysUsed(dep) && !isPeerDepLike(dep) && !IGNORED_PACKAGES.has(dep)) {
      // Check for partial matches (e.g., @emotion/react might be imported as @emotion/styled)
      const baseScope = dep.startsWith('@') ? dep.split('/')[0] : null
      const hasPartialMatch = baseScope && Array.from(usedImports).some((imp) => imp.startsWith(baseScope + '/'))

      if (!hasPartialMatch) {
        unusedDeps.push({ name: dep, version })
      }
    }
  }

  for (const [dep, version] of Object.entries(devDependencies)) {
    // Skip workspace references
    if (typeof version === 'string' && version.startsWith('workspace:')) continue

    // Check if dependency is used
    if (!usedImports.has(dep) && !isAlwaysUsed(dep) && !isPeerDepLike(dep) && !IGNORED_PACKAGES.has(dep)) {
      // Check for partial matches
      const baseScope = dep.startsWith('@') ? dep.split('/')[0] : null
      const hasPartialMatch = baseScope && Array.from(usedImports).some((imp) => imp.startsWith(baseScope + '/'))

      if (!hasPartialMatch) {
        unusedDevDeps.push({ name: dep, version })
      }
    }
  }

  return {
    packageName,
    packageDir,
    packageJson,
    sourceFilesCount: sourceFiles.length,
    usedImportsCount: usedImports.size,
    unusedDeps,
    unusedDevDeps,
    totalUnused: unusedDeps.length + unusedDevDeps.length,
  }
}

/**
 * Remove dependencies from package.json
 */
function removeDependencies(analysis) {
  const { packageJson, packageDir, unusedDeps, unusedDevDeps } = analysis

  let modified = false

  for (const { name } of unusedDeps) {
    if (packageJson.dependencies?.[name]) {
      delete packageJson.dependencies[name]
      modified = true
    }
  }

  for (const { name } of unusedDevDeps) {
    if (packageJson.devDependencies?.[name]) {
      delete packageJson.devDependencies[name]
      modified = true
    }
  }

  if (modified && !DRY_RUN) {
    writePackageJson(packageDir, packageJson)
  }

  return modified
}

/**
 * Format output for a package analysis
 */
function formatAnalysis(analysis) {
  if (JSON_OUTPUT) return

  const { packageName, sourceFilesCount, unusedDeps, unusedDevDeps, totalUnused } = analysis

  if (totalUnused === 0 && !VERBOSE) return

  console.log(`\n📦 ${packageName}`)
  if (VERBOSE) {
    console.log(`   Source files scanned: ${sourceFilesCount}`)
  }

  if (unusedDeps.length > 0) {
    console.log(`   Unused dependencies (${unusedDeps.length}):`)
    for (const { name, version } of unusedDeps.sort((a, b) => a.name.localeCompare(b.name))) {
      console.log(`     - ${name}: ${version}`)
    }
  }

  if (unusedDevDeps.length > 0) {
    console.log(`   Unused devDependencies (${unusedDevDeps.length}):`)
    for (const { name, version } of unusedDevDeps.sort((a, b) => a.name.localeCompare(b.name))) {
      console.log(`     - ${name}: ${version}`)
    }
  }

  if (totalUnused === 0 && VERBOSE) {
    console.log(`   ✅ No unused dependencies found`)
  }
}

// Main execution
async function main() {
  if (!JSON_OUTPUT) {
    console.log('='.repeat(60))
    console.log('Finding unused dependencies')
    if (DRY_RUN) {
      console.log('(DRY RUN - no changes will be made)')
    }
    console.log('='.repeat(60))
  }

  const results = []
  let totalRemoved = 0

  // Analyze root package.json
  if (!JSON_OUTPUT) console.log('\n🔍 Analyzing root package.json...')
  const rootAnalysis = analyzePackage(ROOT_DIR)
  if (rootAnalysis) {
    results.push(rootAnalysis)
    formatAnalysis(rootAnalysis)
    if (rootAnalysis.totalUnused > 0) {
      removeDependencies(rootAnalysis)
      totalRemoved += rootAnalysis.totalUnused
    }
  }

  if (!ROOT_ONLY) {
    // Analyze apps
    const apps = getDirectories(APPS_DIR)
    if (!JSON_OUTPUT) console.log(`\n🔍 Analyzing ${apps.length} apps...`)

    for (const appDir of apps) {
      const analysis = analyzePackage(appDir)
      if (analysis) {
        results.push(analysis)
        formatAnalysis(analysis)
        if (analysis.totalUnused > 0) {
          removeDependencies(analysis)
          totalRemoved += analysis.totalUnused
        }
      }
    }

    // Analyze libs
    const libs = getDirectories(LIBS_DIR)
    if (!JSON_OUTPUT) console.log(`\n🔍 Analyzing ${libs.length} libs...`)

    for (const libDir of libs) {
      const analysis = analyzePackage(libDir)
      if (analysis) {
        results.push(analysis)
        formatAnalysis(analysis)
        if (analysis.totalUnused > 0) {
          removeDependencies(analysis)
          totalRemoved += analysis.totalUnused
        }
      }
    }
  }

  // Output results
  if (JSON_OUTPUT) {
    const jsonResult = {
      dryRun: DRY_RUN,
      totalPackages: results.length,
      totalUnused: totalRemoved,
      packages: results.map((r) => ({
        name: r.packageName,
        path: r.packageDir,
        unusedDeps: r.unusedDeps,
        unusedDevDeps: r.unusedDevDeps,
      })),
    }
    console.log(JSON.stringify(jsonResult, null, 2))
  } else {
    console.log('\n' + '='.repeat(60))

    // Summary
    const packagesWithUnused = results.filter((r) => r.totalUnused > 0)

    if (packagesWithUnused.length === 0) {
      console.log('✅ No unused dependencies found!')
    } else {
      console.log(`\n📊 Summary:`)
      console.log(`   Packages with unused deps: ${packagesWithUnused.length}/${results.length}`)
      console.log(`   Total unused dependencies: ${totalRemoved}`)

      if (DRY_RUN) {
        console.log(`\n💡 Run without --dry-run to remove these dependencies`)
      } else {
        console.log(`\n✅ Removed ${totalRemoved} unused dependencies`)
        console.log(`💡 Run 'pnpm install' to update the lockfile`)
      }
    }

    console.log('='.repeat(60))
  }
}

main().catch((e) => {
  console.error('Error:', e)
  process.exit(1)
})
