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

/** Reads the newest "📦 GitHub Packages Published" comment on the PR. */
async function fetchPublishedVersions(owner, repo, number) {
  const comments = []

  for (let page = 1; ; page++) {
    const url = `https://api.github.com/repos/${owner}/${repo}/issues/${number}/comments?per_page=100&page=${page}`
    const response = await fetch(url, { headers: { 'User-Agent': 'cowswap-sdk-updater' } })
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
  const versions = await fetchPublishedVersions(owner, repo, number)

  const overrides = {}
  for (const [name, version] of Object.entries(versions)) {
    overrides[name] = await fetchTarballUrl(name, version, token)
    console.log(`  ${name}@${version}`)
  }

  writeOverrides(overrides)
  console.log(`\nPinned ${Object.keys(overrides).length} package(s) in root package.json overrides.\n`)

  install()
}

function writeOverrides(overrides) {
  const packageJson = JSON.parse(fs.readFileSync(ROOT_PACKAGE_JSON_PATH, 'utf-8'))
  const kept = Object.entries(packageJson.pnpm.overrides).filter(([name]) => !name.startsWith('@cowprotocol/'))

  packageJson.pnpm.overrides = Object.fromEntries([...kept, ...Object.entries(overrides)])
  fs.writeFileSync(ROOT_PACKAGE_JSON_PATH, JSON.stringify(packageJson, null, 2) + '\n')
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
