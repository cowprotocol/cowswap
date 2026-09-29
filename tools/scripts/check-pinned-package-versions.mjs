#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const repoRoot = process.cwd()
const packageJsonFiles = []
const errors = []

const dependencySections = [
  'dependencies',
  'devDependencies',
  'optionalDependencies',
  'resolutions',
]

const scanRoots = ['apps', 'libs']
const ignoredDirs = new Set(['node_modules'])

const GITHUB_PACKAGES_DOWNLOAD_PREFIX = 'https://npm.pkg.github.com/download/'

const exactSemverRegex = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/
const npmAliasExactRegex = /^npm:.+@\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/

function walkDirectory(currentDir) {
  const entries = fs.readdirSync(currentDir, { withFileTypes: true })

  for (const entry of entries) {
    if (ignoredDirs.has(entry.name)) continue

    const absolutePath = path.join(currentDir, entry.name)

    if (entry.isDirectory()) {
      walkDirectory(absolutePath)
      continue
    }

    if (entry.isFile() && entry.name === 'package.json') {
      packageJsonFiles.push(absolutePath)
    }
  }
}

function isPinnedVersion(spec) {
  if (spec === 'workspace:*') return true
  if (exactSemverRegex.test(spec)) return true
  if (npmAliasExactRegex.test(spec)) return true

  if (
    // GitHub Packages download URLs end in a content hash rather than .tgz, and embed the
    // exact version — at least as pinned as an exact semver.
    (spec.startsWith('https://') && (spec.endsWith('.tgz') || spec.startsWith(GITHUB_PACKAGES_DOWNLOAD_PREFIX))) ||
    spec.startsWith('file:') ||
    spec.startsWith('link:') ||
    spec.startsWith('portal:') ||
    spec.startsWith('patch:')
  ) {
    return true
  }

  return false
}

function checkDependencyMap(filePath, sectionName, dependencyMap) {
  for (const [dependencyName, spec] of Object.entries(dependencyMap)) {
    if (typeof spec !== 'string') {
      errors.push(
        `${path.relative(repoRoot, filePath)} -> ${sectionName}.${dependencyName} has non-string version spec`,
      )
      continue
    }

    if (!isPinnedVersion(spec)) {
      errors.push(
        `${path.relative(repoRoot, filePath)} -> ${sectionName}.${dependencyName} uses non-pinned spec "${spec}"`,
      )
    }
  }
}

function checkPnpmOverrides(filePath, packageJson) {
  const overrides = packageJson?.pnpm?.overrides
  if (!overrides || typeof overrides !== 'object' || Array.isArray(overrides)) return

  checkDependencyMap(filePath, 'pnpm.overrides', overrides)
}

/**
 * SDK previews are pinned as GitHub Packages tarball URLs, which need auth to download. Without a
 * valid PACKAGE_READ_AUTH_TOKEN, CI and Vercel fail with a bare 401 that names no credential — so
 * flag it here, at commit time, while it is still cheap to act on.
 */
function warnAboutPreviewOverrides(packageJson) {
  const overrides = packageJson?.pnpm?.overrides
  if (!overrides || typeof overrides !== 'object') return

  const previews = Object.keys(overrides).filter((name) =>
    String(overrides[name]).startsWith(GITHUB_PACKAGES_DOWNLOAD_PREFIX),
  )
  if (previews.length === 0) return

  console.warn(`\n⚠️  ${previews.length} pnpm.overrides entr(ies) resolve from GitHub Packages:`)
  console.warn(previews.map((name) => `  ${name}`).join('\n'))
  console.warn('   CI and Vercel need a valid PACKAGE_READ_AUTH_TOKEN secret to install these.')
  console.warn('   Remove them from pnpm.overrides before merging.\n')
}

function main() {
  const rootPackageJsonPath = path.join(repoRoot, 'package.json')

  if (fs.existsSync(rootPackageJsonPath)) {
    packageJsonFiles.push(rootPackageJsonPath)
  }

  for (const root of scanRoots) {
    const rootPath = path.join(repoRoot, root)
    if (!fs.existsSync(rootPath)) continue
    walkDirectory(rootPath)
  }

  for (const packageJsonPath of packageJsonFiles) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

    for (const sectionName of dependencySections) {
      const dependencyMap = packageJson[sectionName]
      if (!dependencyMap || typeof dependencyMap !== 'object' || Array.isArray(dependencyMap)) continue

      checkDependencyMap(packageJsonPath, sectionName, dependencyMap)
    }

    checkPnpmOverrides(packageJsonPath, packageJson)

    if (packageJsonPath === rootPackageJsonPath) warnAboutPreviewOverrides(packageJson)
  }

  if (errors.length > 0) {
    console.error('Pinned dependency version check failed:')
    for (const error of errors) {
      console.error(`- ${error}`)
    }
    process.exit(1)
  }

  console.log(`Pinned dependency version check passed (${packageJsonFiles.length} package.json files scanned)`)
}

main()
