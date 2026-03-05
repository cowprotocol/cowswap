#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const repoRoot = process.cwd()
const BASELINE_PATH = path.join(repoRoot, 'tools/baselines/swr-usage-baseline.txt')
const SOURCE_ROOTS = ['apps', 'libs']
const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx'])
const EXCLUDED_DIR_NAMES = new Set([
  'node_modules',
  '.git',
  '.nx',
  '.next',
  'dist',
  'build',
  'coverage',
  'tmp',
])
const EXCLUDED_FILE_PATTERNS = [
  '.test.ts',
  '.test.tsx',
  '.test.js',
  '.test.jsx',
  '.spec.ts',
  '.spec.tsx',
  '.spec.js',
  '.spec.jsx',
  '.stories.tsx',
  '.stories.ts',
  '.cosmos.tsx',
]
const SWR_USAGE_REGEX =
  /(?:\bfrom\s+['"]swr(?:\/[^'"]+)?['"]|\bimport\s+['"]swr(?:\/[^'"]+)?['"]|\brequire\(\s*['"]swr(?:\/[^'"]+)?['"]\s*\)|\bimport\(\s*['"]swr(?:\/[^'"]+)?['"]\s*\))/
const SHOULD_UPDATE = process.argv.includes('--update')

function toPosixPath(filePath) {
  return filePath.split(path.sep).join('/')
}

function shouldIncludeFile(filePath) {
  const extension = path.extname(filePath)
  if (!SOURCE_EXTENSIONS.has(extension)) return false

  const filename = path.basename(filePath)
  return !EXCLUDED_FILE_PATTERNS.some((suffix) => filename.endsWith(suffix))
}

function walkFiles(startDir, results) {
  if (!fs.existsSync(startDir)) return

  const stack = [startDir]
  while (stack.length > 0) {
    const currentDir = stack.pop()
    const entries = fs.readdirSync(currentDir, { withFileTypes: true })

    for (const entry of entries) {
      const absPath = path.join(currentDir, entry.name)
      if (entry.isDirectory()) {
        if (!EXCLUDED_DIR_NAMES.has(entry.name)) {
          stack.push(absPath)
        }
        continue
      }

      if (!shouldIncludeFile(absPath)) continue

      const source = fs.readFileSync(absPath, 'utf8')
      if (SWR_USAGE_REGEX.test(source)) {
        results.push(toPosixPath(path.relative(repoRoot, absPath)))
      }
    }
  }
}

function collectCurrentSWRUsage() {
  const results = []
  for (const sourceRoot of SOURCE_ROOTS) {
    walkFiles(path.join(repoRoot, sourceRoot), results)
  }
  return results.sort()
}

function readBaseline() {
  if (!fs.existsSync(BASELINE_PATH)) return null

  const lines = fs.readFileSync(BASELINE_PATH, 'utf8').split(/\r?\n/)
  const entries = lines
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'))
    .sort()

  return entries
}

function writeBaseline(currentEntries) {
  fs.mkdirSync(path.dirname(BASELINE_PATH), { recursive: true })
  const today = new Date().toISOString().slice(0, 10)
  const content = [
    '# SWR usage baseline',
    '# Existing entries are legacy and allowed temporarily.',
    '# New entries fail `pnpm swr:check`.',
    `# Last updated: ${today}`,
    '# Update command: pnpm swr:baseline:update',
    '',
    ...currentEntries,
    '',
  ].join('\n')

  fs.writeFileSync(BASELINE_PATH, content, 'utf8')
  console.log(`Updated baseline: ${toPosixPath(path.relative(repoRoot, BASELINE_PATH))}`)
  console.log(`Tracked legacy entries: ${currentEntries.length}`)
}

function printSection(title, entries) {
  console.log(`${title} (${entries.length})`)
  for (const entry of entries) {
    console.log(`- ${entry}`)
  }
}

function runCheck() {
  const currentEntries = collectCurrentSWRUsage()
  const baselineEntries = readBaseline()

  if (baselineEntries === null) {
    console.error('swr:check failed:')
    console.error(`- Baseline file is missing: ${toPosixPath(path.relative(repoRoot, BASELINE_PATH))}`)
    console.error('- Create it with: pnpm swr:baseline:update')
    process.exit(1)
  }

  const currentSet = new Set(currentEntries)
  const baselineSet = new Set(baselineEntries)

  const newEntries = currentEntries.filter((entry) => !baselineSet.has(entry))
  const resolvedEntries = baselineEntries.filter((entry) => !currentSet.has(entry))
  const legacyEntries = currentEntries.filter((entry) => baselineSet.has(entry))

  console.log(`swr:check summary`)
  console.log(`- baseline entries: ${baselineEntries.length}`)
  console.log(`- current entries: ${currentEntries.length}`)
  console.log(`- legacy entries: ${legacyEntries.length}`)
  console.log(`- new entries: ${newEntries.length}`)
  console.log(`- resolved entries: ${resolvedEntries.length}`)

  if (resolvedEntries.length > 0) {
    printSection('Resolved legacy entries detected (baseline cleanup available)', resolvedEntries)
    console.log('- Refresh baseline with: pnpm swr:baseline:update')
  }

  if (newEntries.length > 0) {
    printSection('New SWR entries detected', newEntries)
    console.error('Remediation:')
    console.error('- Prefer Jotai atomWithQuery instead of SWR.')
    console.error('- If SWR is unavoidable, document the blocker and explicitly refresh baseline.')
    console.error('- Update quality/debt tracking docs when adding exceptions.')
    process.exit(1)
  }

  console.log('swr:check passed (no new SWR usage)')
}

if (SHOULD_UPDATE) {
  writeBaseline(collectCurrentSWRUsage())
} else {
  runCheck()
}
