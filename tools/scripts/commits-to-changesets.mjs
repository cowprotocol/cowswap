#!/usr/bin/env node

import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  parseConventionalCommit,
  resolveAffectedPackages,
  changesetFilename,
  changesetContent,
} from './commits-to-changesets-lib.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '../..')
const changesetDir = join(rootDir, '.changeset')

// Sentinels chosen so they cannot appear in a real commit message.
// The 5b3c suffix is an arbitrary random tag — it makes accidental collisions
// (e.g. someone literally typing "<<<FIELD_SEP>>>" in a commit body) effectively impossible.
const COMMIT_SEP = '<<<COMMIT_SEP_5b3c>>>'
const FIELD_SEP = '<<<FIELD_SEP_5b3c>>>'

function git(args) {
  return execFileSync('git', args, { cwd: rootDir, encoding: 'utf-8' }).trimEnd()
}

function tryGit(args) {
  try {
    return git(args)
  } catch {
    return null
  }
}

function resolveBaseline() {
  const fromEnv = (process.env.BASELINE_REF || '').trim()
  if (fromEnv) {
    console.log(`[converter] Using BASELINE_REF=${fromEnv}`)
    return fromEnv
  }
  const tag = tryGit(['describe', '--match', 'release-*', '--abbrev=0'])
  if (tag) {
    console.log(`[converter] Using latest release tag: ${tag}`)
    return tag
  }
  console.warn(
    '[converter] No baseline tag found and BASELINE_REF not set. ' +
      'No changesets will be generated. ' +
      'To bootstrap, re-run via workflow_dispatch with `baseline_ref` set.',
  )
  return null
}

function loadTrackedPackages() {
  const registry = JSON.parse(
    readFileSync(join(rootDir, 'tools/release/tracked-packages.json'), 'utf-8'),
  )
  const result = []
  for (const path of registry.packages) {
    const pkgJsonPath = join(rootDir, path, 'package.json')
    const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'))
    if (!pkg.name) throw new Error(`${path}/package.json is missing "name"`)
    result.push({ path, name: pkg.name })
  }
  return result
}

function getCommits(baseline) {
  const format = `${COMMIT_SEP}%H${FIELD_SEP}%s${FIELD_SEP}%b`
  const raw = git([
    'log',
    '--no-merges',
    '--reverse',
    `${baseline}..HEAD`,
    `--format=${format}`,
  ])
  if (!raw) return []
  return raw
    .split(COMMIT_SEP)
    .filter(Boolean)
    .map((chunk) => {
      const [sha, subject, ...rest] = chunk.split(FIELD_SEP)
      return {
        sha: (sha || '').trim(),
        subject: (subject || '').trim(),
        body: (rest.join(FIELD_SEP) || '').trim(),
      }
    })
    .filter((c) => c.sha)
}

function getChangedFiles(sha) {
  const raw = git(['show', '--name-only', '--format=', sha])
  return raw
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
}

function main() {
  const baseline = resolveBaseline()
  if (!baseline) return

  if (!existsSync(changesetDir)) {
    mkdirSync(changesetDir, { recursive: true })
  }

  const tracked = loadTrackedPackages()
  const trackedPaths = tracked.map((p) => p.path)
  const pathToName = new Map(tracked.map((p) => [p.path, p.name]))

  const commits = getCommits(baseline)
  console.log(`[converter] Found ${commits.length} commit(s) since ${baseline}`)

  let written = 0
  let skipped = 0
  let touchedNothing = 0

  for (const commit of commits) {
    const parsed = parseConventionalCommit(commit.subject, commit.body)
    if (!parsed.parsedOk) {
      console.warn(
        `[converter] commit ${commit.sha.slice(0, 7)} ("${commit.subject}") is not conventional; defaulting bump=patch`,
      )
    }

    const files = getChangedFiles(commit.sha)
    const affected = resolveAffectedPackages(files, trackedPaths)
    if (affected.size === 0) {
      touchedNothing++
      continue
    }

    for (const pkgPath of affected) {
      const pkgName = pathToName.get(pkgPath)
      if (!pkgName) continue
      const filename = changesetFilename(commit.sha, pkgPath)
      const filePath = join(changesetDir, filename)
      if (existsSync(filePath)) {
        skipped++
        continue
      }
      writeFileSync(filePath, changesetContent(pkgName, parsed.bump, commit.subject))
      written++
    }
  }

  console.log(
    `[converter] Wrote ${written} changeset(s); skipped ${skipped} pre-existing; ` +
      `${touchedNothing} commit(s) touched no tracked package`,
  )
}

main()
