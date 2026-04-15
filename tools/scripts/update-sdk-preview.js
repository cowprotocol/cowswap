#!/usr/bin/env node

/**
 * Updates @cowprotocol/cow-sdk and @cowprotocol/sdk-* packages in all apps and libs
 * to pre-release versions published from a cow-sdk PR.
 *
 * Usage:
 *   node tools/scripts/update-sdk-preview.js <PR_URL>
 *
 * Example:
 *   node tools/scripts/update-sdk-preview.js https://github.com/cowprotocol/cow-sdk/pull/787
 */

const fs = require('fs')
const https = require('https')
const path = require('path')

const ROOT_DIR = path.resolve(__dirname, '../..')
const APPS_DIR = path.join(ROOT_DIR, 'apps')
const LIBS_DIR = path.join(ROOT_DIR, 'libs')

const PR_URL_REGEX = /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)$/

function parsePrUrl(url) {
  const match = url.match(PR_URL_REGEX)
  if (!match) {
    console.error(`Invalid PR URL: ${url}`)
    console.error('Expected format: https://github.com/<owner>/<repo>/pull/<number>')
    process.exit(1)
  }
  return { owner: match[1], repo: match[2], number: match[3] }
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': 'cowswap-sdk-updater' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return fetchJson(res.headers.location).then(resolve, reject)
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode} from ${url}`))
        }
        let data = ''
        res.on('data', (chunk) => (data += chunk))
        res.on('end', () => {
          try {
            resolve(JSON.parse(data))
          } catch (e) {
            reject(e)
          }
        })
      })
      .on('error', reject)
  })
}

async function fetchAllComments(owner, repo, number) {
  const comments = []
  let page = 1

  while (true) {
    const url = `https://api.github.com/repos/${owner}/${repo}/issues/${number}/comments?per_page=100&page=${page}`
    const batch = await fetchJson(url)
    if (!Array.isArray(batch) || batch.length === 0) break
    comments.push(...batch)
    page++
  }

  return comments
}

function parseVersionsFromComments(comments) {
  // Matches package@version where version starts with a digit (semver pre-release)
  const packageRegex = /(@cowprotocol\/[\w-]+)@(\d[\w.\-]+)/g

  // Search from the last comment backwards — the most recent publish is what we want
  for (let i = comments.length - 1; i >= 0; i--) {
    const body = comments[i].body || ''
    if (!body.includes('GitHub Packages Published')) continue

    const versions = {}
    let match
    while ((match = packageRegex.exec(body)) !== null) {
      versions[match[1]] = match[2]
    }

    if (Object.keys(versions).length > 0) return versions
  }

  console.error('Could not find a comment with title "📦 GitHub Packages Published" containing package versions.')
  process.exit(1)
}

function getPackageJsonPaths() {
  const paths = []

  for (const baseDir of [APPS_DIR, LIBS_DIR]) {
    if (!fs.existsSync(baseDir)) continue

    const entries = fs.readdirSync(baseDir, { withFileTypes: true })
    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      const pkgPath = path.join(baseDir, entry.name, 'package.json')
      if (fs.existsSync(pkgPath)) {
        paths.push(pkgPath)
      }
    }
  }

  return paths
}

function shouldUpdate(depName) {
  return depName === '@cowprotocol/cow-sdk' || depName.startsWith('@cowprotocol/sdk-')
}

function updatePackageJson(pkgPath, versions) {
  const content = fs.readFileSync(pkgPath, 'utf-8')
  const pkg = JSON.parse(content)
  let updated = false

  for (const section of ['dependencies', 'devDependencies']) {
    const deps = pkg[section]
    if (!deps) continue

    for (const depName of Object.keys(deps)) {
      if (shouldUpdate(depName) && versions[depName]) {
        const oldVersion = deps[depName]
        deps[depName] = versions[depName]
        if (oldVersion !== versions[depName]) {
          console.log(`  ${depName}: ${oldVersion} -> ${versions[depName]}`)
          updated = true
        }
      }
    }
  }

  if (updated) {
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
  }

  return updated
}

// Main
async function main() {
  const prUrl = process.argv[2]
  if (!prUrl) {
    console.error('Usage: node tools/scripts/update-sdk-preview.js <PR_URL>')
    console.error('Example: node tools/scripts/update-sdk-preview.js https://github.com/cowprotocol/cow-sdk/pull/787')
    process.exit(1)
  }

  const { owner, repo, number } = parsePrUrl(prUrl)
  console.log(`Fetching comments from ${owner}/${repo}#${number}...`)

  const comments = await fetchAllComments(owner, repo, number)
  const versions = parseVersionsFromComments(comments)

  console.log('\nPackage versions found:')
  for (const [name, version] of Object.entries(versions)) {
    console.log(`  ${name}@${version}`)
  }

  console.log('\nUpdating package.json files...\n')

  const packageJsonPaths = getPackageJsonPaths()
  let updatedCount = 0

  for (const pkgPath of packageJsonPaths) {
    const relativePath = path.relative(ROOT_DIR, pkgPath)
    const wasUpdated = updatePackageJson(pkgPath, versions)
    if (wasUpdated) {
      console.log(`  -> ${relativePath}\n`)
      updatedCount++
    }
  }

  if (updatedCount === 0) {
    console.log('No packages were updated.')
  } else {
    console.log(`\nUpdated ${updatedCount} package.json file(s).`)
    console.log('Run `pnpm install` to apply the changes.')
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
