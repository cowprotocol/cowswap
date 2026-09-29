#!/usr/bin/env node

/**
 * Points the whole monorepo at the @cowprotocol/cow-sdk and @cowprotocol/sdk-* builds
 * published from a cow-sdk PR, then updates pnpm-lock.yaml.
 *
 * Preview builds live on GitHub Packages, every other @cowprotocol package lives on npmjs,
 * and pnpm's registry config is scope-wide — so redirecting the scope breaks the npmjs ones.
 * Instead each preview is pinned by its full GitHub tarball URL in the root `pnpm.overrides`,
 * exactly like the npmjs tarball URLs already used for @cowprotocol/cms. No registry
 * redirect, no pnpmfile, and workspace package.json files stay untouched.
 *
 * Usage:
 *   PACKAGE_READ_AUTH_TOKEN=<github token> node tools/scripts/update-sdk-preview.js <PR_URL>
 *
 * To drop the preview: delete the @cowprotocol entries from `pnpm.overrides` and reinstall.
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const ROOT_DIR = path.resolve(__dirname, '../..')
const ROOT_PACKAGE_JSON_PATH = path.join(ROOT_DIR, 'package.json')
const GITHUB_PACKAGES_REGISTRY = 'https://npm.pkg.github.com'
const PR_URL_REGEX = /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)$/
// Matches `@cowprotocol/<pkg>@<version>` in the publish bot's comment.
const PACKAGE_REGEX = /(@cowprotocol\/[\w-]+)@(\d[\w.\-]+)/g

function collectWorkspacePins() {
  const pins = {}

  for (const dir of ['apps', 'libs']) {
    const base = path.join(ROOT_DIR, dir)
    if (!fs.existsSync(base)) continue

    for (const entry of fs.readdirSync(base)) {
      const file = path.join(base, entry, 'package.json')
      if (!fs.existsSync(file)) continue

      const pkg = JSON.parse(fs.readFileSync(file, 'utf-8'))
      for (const section of ['dependencies', 'devDependencies']) {
        for (const [name, version] of Object.entries(pkg[section] ?? {})) {
          if (!name.startsWith('@cowprotocol/') || !/^\d/.test(version)) continue
          if (!pins[name] || compareVersions(version, pins[name]) > 0) pins[name] = version
        }
      }
    }
  }

  return pins
}

function compareVersions(a, b) {
  const left = a.split('.').map(Number)
  const right = b.split('.').map(Number)

  for (let i = 0; i < 3; i++) {
    if ((left[i] ?? 0) !== (right[i] ?? 0)) return (left[i] ?? 0) < (right[i] ?? 0) ? -1 : 1
  }

  return 0
}

/** Reads the newest "📦 GitHub Packages Published" comment on the PR. */
async function fetchPublishedVersions(owner, repo, number, token) {
  const comments = []

  for (let page = 1; ; page++) {
    const url = `https://api.github.com/repos/${owner}/${repo}/issues/${number}/comments?per_page=100&page=${page}`
    const response = await fetch(url, {
      // cow-sdk is public, so this works unauthenticated too — but anonymous GitHub API calls are
      // capped at 60/hour per IP, and the token is already required below.
      headers: { 'User-Agent': 'cowswap-sdk-updater', Authorization: `Bearer ${token}` },
    })
    if (!response.ok) throw new Error(`HTTP ${response.status} from ${url}`)

    const batch = await response.json()
    if (batch.length === 0) break
    comments.push(...batch)
  }

  for (const { body = '' } of comments.reverse()) {
    if (!body.includes('GitHub Packages Published')) continue

    const versions = Object.fromEntries([...body.matchAll(PACKAGE_REGEX)].map(([, name, version]) => [name, version]))
    if (Object.keys(versions).length > 0) return versions
  }

  throw new Error('No "📦 GitHub Packages Published" comment with package versions found on that PR.')
}

/** GitHub Packages tarball URLs carry an opaque content hash, so they have to be looked up. */
async function fetchTarballUrl(name, version, token) {
  const response = await fetch(`${GITHUB_PACKAGES_REGISTRY}/${name}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) throw new Error(`HTTP ${response.status} reading ${name} from GitHub Packages`)

  const tarball = (await response.json()).versions?.[version]?.dist?.tarball
  if (!tarball) throw new Error(`${name}@${version} is not published to GitHub Packages`)

  return tarball
}

function install() {
  console.log('Running pnpm install --no-frozen-lockfile...')
  execSync('pnpm install --no-frozen-lockfile', {
    cwd: ROOT_DIR,
    stdio: 'inherit',
    env: {
      ...process.env,
      // Preview tarballs are reached by URL, which `block-exotic-subdeps=true` rejects while
      // resolving. Only relaxed here; CI's frozen install skips resolution and keeps the guard.
      npm_config_block_exotic_subdeps: 'false',
    },
  })
  console.log('\nDone. Commit package.json and pnpm-lock.yaml together.')
}

async function main() {
  const prUrl = process.argv[2]
  if (!prUrl) {
    console.error('Usage: PACKAGE_READ_AUTH_TOKEN=... node tools/scripts/update-sdk-preview.js <PR_URL>')
    process.exit(1)
  }

  const match = prUrl.match(PR_URL_REGEX)
  if (!match) {
    console.error(`Invalid PR URL: ${prUrl} (expected https://github.com/<owner>/<repo>/pull/<number>)`)
    process.exit(1)
  }

  const token = process.env.PACKAGE_READ_AUTH_TOKEN
  if (!token) {
    console.error('PACKAGE_READ_AUTH_TOKEN env var is required to read GitHub Packages metadata.')
    process.exit(1)
  }

  const [, owner, repo, number] = match
  console.log(`Fetching published versions from ${owner}/${repo}#${number}...`)
  const versions = await fetchPublishedVersions(owner, repo, number, token)

  const overrides = {}
  for (const [name, version] of Object.entries(versions)) {
    overrides[name] = await fetchTarballUrl(name, version, token)
    console.log(`  ${name}@${version}`)
  }

  warnAboutDowngrades(overrides)
  writeOverrides(overrides)
  console.log(`\nPinned ${Object.keys(overrides).length} package(s) in root package.json overrides.\n`)

  install()
}

/**
 * A preview is published from an SDK branch that may sit behind main, so an override can silently
 * roll a package back — which breaks the build only later, at typecheck, far from the cause.
 * Warn rather than skip: the package under test is usually behind the workspace pin too.
 */
function warnAboutDowngrades(overrides) {
  const pinned = collectWorkspacePins()
  const behind = []

  for (const [name, url] of Object.entries(overrides)) {
    // The capture only matches when a prerelease suffix follows, so every previewBase here comes
    // from a `-pr-NNN-<sha>` build — which sorts BEFORE the plain release of the same version.
    const previewBase = url.match(/\/(\d+\.\d+\.\d+)-/)?.[1]
    const pin = pinned[name]
    if (!previewBase || !pin) continue

    const comparison = compareVersions(previewBase, pin)
    if (comparison > 0) continue

    behind.push(
      comparison < 0
        ? `  ${name}: workspace pins ${pin}, preview is ${previewBase}`
        : `  ${name}: workspace pins released ${pin}, preview is only a ${previewBase} prerelease`,
    )
  }

  if (behind.length === 0) return

  console.warn(`\n⚠️  ${behind.length} package(s) roll BACKWARDS vs what this repo pins:`)
  console.warn(behind.join('\n'))
  console.warn('If the preview branch predates a package the app now depends on, the install will')
  console.warn('succeed and the build will fail on missing exports. Rebase the SDK PR, or drop the')
  console.warn('affected entries from pnpm.overrides.\n')
}

function writeOverrides(overrides) {
  const packageJson = JSON.parse(fs.readFileSync(ROOT_PACKAGE_JSON_PATH, 'utf-8'))
  const kept = Object.entries(packageJson.pnpm.overrides).filter(([name]) => !name.startsWith('@cowprotocol/'))

  packageJson.pnpm.overrides = Object.fromEntries([...kept, ...Object.entries(overrides)])
  fs.writeFileSync(ROOT_PACKAGE_JSON_PATH, JSON.stringify(packageJson, null, 2) + '\n')
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err.message || err)
    process.exit(1)
  })
}

module.exports = { collectWorkspacePins, compareVersions }
