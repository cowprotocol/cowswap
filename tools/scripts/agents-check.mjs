#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const repoRoot = process.cwd()
const errors = []
const warnings = []

const ROOT_AGENTS_PATH = path.join(repoRoot, 'AGENTS.md')
const ROOT_MAX_LINES = 160
const REQUIRED_ROOT_HEADINGS = [
  '## Scope',
  '## Rule Precedence',
  '## Non-Negotiables',
  '## Where To Look',
  '## Enforcement',
  '## Drift Detection',
]
const REQUIRED_DOC_PATHS = [
  'docs/ARCHITECTURE.md',
  'docs/MODULE_CONVENTIONS.md',
  'docs/STATE_MANAGEMENT.md',
  'docs/QUALITY.md',
  'docs/HARNESS_HARDENING.md',
]
const REQUIRED_PLAN_PATHS = ['.plans/active', '.plans/completed', '.plans/debt']

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8')
}

function assertExists(relPath, description = relPath) {
  const fullPath = path.join(repoRoot, relPath)
  if (!fs.existsSync(fullPath)) {
    errors.push(`Missing ${description}: ${relPath}`)
  }
}

function extractRelativeMarkdownLinks(markdown) {
  const links = []
  const regex = /\[[^\]]+]\(([^)]+)\)/g
  let match

  while ((match = regex.exec(markdown)) !== null) {
    const raw = match[1].trim()
    if (!raw || raw.startsWith('#') || raw.startsWith('http://') || raw.startsWith('https://')) {
      continue
    }
    links.push(raw.replace(/#.*$/, ''))
  }

  return links
}

function checkRootAgents() {
  if (!fs.existsSync(ROOT_AGENTS_PATH)) {
    errors.push('Missing root AGENTS.md')
    return
  }

  const content = readFile(ROOT_AGENTS_PATH)
  const lineCount = content.split(/\r?\n/).length

  if (lineCount > ROOT_MAX_LINES) {
    errors.push(
      `Root AGENTS.md too large (${lineCount} lines). Keep <= ${ROOT_MAX_LINES} lines to preserve TOC behavior.`,
    )
  }

  for (const heading of REQUIRED_ROOT_HEADINGS) {
    if (!content.includes(heading)) {
      errors.push(`Root AGENTS.md missing required heading: "${heading}"`)
    }
  }

  const links = extractRelativeMarkdownLinks(content)
  for (const linkPath of links) {
    const abs = path.resolve(repoRoot, linkPath)
    if (!fs.existsSync(abs)) {
      errors.push(`Broken root AGENTS.md link target: ${linkPath}`)
    }
  }
}

function listAppAgentsFiles() {
  const appsPath = path.join(repoRoot, 'apps')
  if (!fs.existsSync(appsPath)) return []

  const appDirs = fs
    .readdirSync(appsPath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)

  return appDirs
    .map((dirName) => path.join('apps', dirName, 'AGENTS.md'))
    .filter((relativePath) => fs.existsSync(path.join(repoRoot, relativePath)))
}

function checkAppAgents() {
  const appAgentsFiles = listAppAgentsFiles()

  for (const relativePath of appAgentsFiles) {
    const absPath = path.join(repoRoot, relativePath)
    const content = readFile(absPath)

    if (!content.includes('Root rules: [`../../AGENTS.md`](../../AGENTS.md)')) {
      errors.push(
        `${relativePath} must include explicit root reference: Root rules: [\`../../AGENTS.md\`](../../AGENTS.md)`,
      )
    }

    const links = extractRelativeMarkdownLinks(content)
    const fileDir = path.dirname(absPath)
    for (const linkPath of links) {
      const absTarget = path.resolve(fileDir, linkPath)
      if (!fs.existsSync(absTarget)) {
        errors.push(`Broken link in ${relativePath}: ${linkPath}`)
      }
    }
  }
}

function checkDocsAndPlans() {
  for (const relPath of REQUIRED_DOC_PATHS) {
    assertExists(relPath, 'required harness doc')
  }
  for (const relPath of REQUIRED_PLAN_PATHS) {
    assertExists(relPath, 'required plans directory')
  }

  const qualityPath = path.join(repoRoot, 'docs/QUALITY.md')
  if (fs.existsSync(qualityPath)) {
    const quality = readFile(qualityPath)
    if (!/Last reviewed:\s*\d{4}-\d{2}-\d{2}/.test(quality)) {
      errors.push('docs/QUALITY.md must include "Last reviewed: YYYY-MM-DD"')
    }
    if (!quality.includes('| Domain/Layer | Grade | Notes |')) {
      errors.push('docs/QUALITY.md must include the quality table header')
    }
  }
}

function checkEnforcementWiring() {
  const packageJsonPath = path.join(repoRoot, 'package.json')
  if (!fs.existsSync(packageJsonPath)) {
    errors.push('Missing package.json')
    return
  }

  const packageJson = JSON.parse(readFile(packageJsonPath))
  const agentsCheckScript = packageJson.scripts?.['agents:check']
  if (
    typeof agentsCheckScript !== 'string' ||
    !agentsCheckScript.includes('tools/scripts/agents-check.mjs')
  ) {
    errors.push(
      'package.json script "agents:check" must include "tools/scripts/agents-check.mjs"',
    )
  }

  const eslintConfigPath = path.join(repoRoot, 'eslint.config.js')
  if (!fs.existsSync(eslintConfigPath)) {
    warnings.push('eslint.config.js not found; cannot verify boundary enforcement wiring')
    return
  }

  const eslintConfig = readFile(eslintConfigPath)
  if (!eslintConfig.includes('@nx/enforce-module-boundaries')) {
    errors.push('eslint.config.js missing @nx/enforce-module-boundaries rule wiring')
  }
  if (!eslintConfig.includes('@typescript-eslint/no-restricted-imports')) {
    errors.push('eslint.config.js missing @typescript-eslint/no-restricted-imports rule wiring')
  }
}

checkRootAgents()
checkAppAgents()
checkDocsAndPlans()
checkEnforcementWiring()

if (warnings.length > 0) {
  console.log('agents:check warnings:')
  for (const warning of warnings) {
    console.log(`- ${warning}`)
  }
}

if (errors.length > 0) {
  console.error('agents:check failed:')
  for (const error of errors) {
    console.error(`- ${error}`)
  }
  process.exit(1)
}

console.log('agents:check passed')
