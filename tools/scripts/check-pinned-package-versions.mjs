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
  'peerDependencies',
  'resolutions',
]

const ignoredDirs = new Set([
  '.git',
  '.next',
  '.nx',
  '.turbo',
  '.yarn',
  'build',
  'coverage',
  'dist',
  'node_modules',
  'out',
])

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
    (spec.startsWith('https://') && spec.endsWith('.tgz')) ||
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

function main() {
  walkDirectory(repoRoot)

  for (const packageJsonPath of packageJsonFiles) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

    for (const sectionName of dependencySections) {
      const dependencyMap = packageJson[sectionName]
      if (!dependencyMap || typeof dependencyMap !== 'object' || Array.isArray(dependencyMap)) continue

      checkDependencyMap(packageJsonPath, sectionName, dependencyMap)
    }

    checkPnpmOverrides(packageJsonPath, packageJson)
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
