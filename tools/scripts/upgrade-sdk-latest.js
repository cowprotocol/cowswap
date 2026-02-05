#!/usr/bin/env node

/**
 * Upgrades @cowprotocol/cow-sdk and all @cowprotocol/sdk-* packages to the latest
 * versions from npm across all apps and libs.
 *
 * Usage:
 *   node tools/scripts/upgrade-sdk-latest.js
 *
 * Or via npm script:
 *   pnpm upgrade-sdk-latest
 */

const fs = require('fs')
const https = require('https')
const path = require('path')

const ROOT_DIR = path.resolve(__dirname, '../..')
const APPS_DIR = path.join(ROOT_DIR, 'apps')
const LIBS_DIR = path.join(ROOT_DIR, 'libs')

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

async function getLatestVersion(packageName) {
  const url = `https://registry.npmjs.org/${packageName}/latest`
  try {
    const data = await fetchJson(url)
    return data.version
  } catch (err) {
    console.error(`  Warning: Could not fetch latest version for ${packageName}: ${err.message}`)
    return null
  }
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

function collectPackagesToUpdate(packageJsonPaths) {
  const packages = new Set()

  for (const pkgPath of packageJsonPaths) {
    const content = fs.readFileSync(pkgPath, 'utf-8')
    const pkg = JSON.parse(content)

    for (const section of ['dependencies', 'devDependencies']) {
      const deps = pkg[section]
      if (!deps) continue

      for (const depName of Object.keys(deps)) {
        if (shouldUpdate(depName)) {
          packages.add(depName)
        }
      }
    }
  }

  return Array.from(packages).sort()
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
        const newVersion = versions[depName]
        if (oldVersion !== newVersion) {
          deps[depName] = newVersion
          console.log(`  ${depName}: ${oldVersion} -> ${newVersion}`)
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

async function main() {
  console.log('Collecting SDK packages to update...\n')

  const packageJsonPaths = getPackageJsonPaths()
  const packagesToUpdate = collectPackagesToUpdate(packageJsonPaths)

  if (packagesToUpdate.length === 0) {
    console.log('No @cowprotocol/cow-sdk or @cowprotocol/sdk-* packages found.')
    return
  }

  console.log('Fetching latest versions from npm...\n')

  const versions = {}
  for (const packageName of packagesToUpdate) {
    const version = await getLatestVersion(packageName)
    if (version) {
      versions[packageName] = version
      console.log(`  ${packageName}@${version}`)
    }
  }

  console.log('\nUpdating package.json files...\n')

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
    console.log('All packages are already up to date.')
  } else {
    console.log(`\nUpdated ${updatedCount} package.json file(s).`)
    console.log('Run `pnpm install` to apply the changes.')
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
