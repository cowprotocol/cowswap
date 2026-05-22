const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const ROOT_DIR = path.resolve(__dirname, '../..')
const APPS_DIR = path.join(ROOT_DIR, 'apps')
const LIBS_DIR = path.join(ROOT_DIR, 'libs')
const ROOT_NPMRC_PATH = path.join(ROOT_DIR, '.npmrc')
const TEMP_PNPMFILE_PATH = path.join(ROOT_DIR, '.pnpmfile.preview.cjs')

const packageJson = require('../../apps/cowswap-frontend/package.json')
const sdkPrVersionRegex = /pr-\d+/
const sdkPrefix = '@cowprotocol/'
const hasSdkPrVersion = Object.keys(packageJson.dependencies)
  .filter((key) => key.startsWith(sdkPrefix))
  .some((key) => {
    const version = packageJson.dependencies[key]

    return sdkPrVersionRegex.test(version)
  })

if (!hasSdkPrVersion) {
  console.log('[install.js] No SDK PR version found in apps/cowswap-frontend/package.json.')

  try {
    runPnpmInstall()
  } catch (err) {
    console.error('[install.js] Failed to install dependencies:', err)
    process.exit(1)
  }

  return
}

console.log('[install.js] SDK PR version found in apps/cowswap-frontend/package.json.')

const PACKAGE_READ_AUTH_TOKEN = process.env.PACKAGE_READ_AUTH_TOKEN

if (!PACKAGE_READ_AUTH_TOKEN) {
  console.error('[install.js] PACKAGE_READ_AUTH_TOKEN env var is missing. Could not complete installation.')
  process.exit(1)
  return
}

// The scope-wide @cowprotocol:registry redirects ALL @cowprotocol/* packages to GitHub Packages.
// Non-SDK packages (e.g. @cowprotocol/cms) are only on npmjs and would fail to install.
// Fix: pin them to explicit npmjs tarball URLs so pnpm fetches them directly, bypassing the scope registry.
let rewriteMap

try {
  rewriteMap = pinNonSdkPackagesToNpmjs()
} catch (err) {
  console.error('[install.js] Failed to pin non-SDK packages to npmjs:', err)
  process.exit(1)
}

try {
  runPnpmInstall(PACKAGE_READ_AUTH_TOKEN, rewriteMap)
} catch (err) {
  console.error('[install.js] Failed to install dependencies:', err)
  process.exit(1)
}

/**
 * Returns whether a package name belongs to the SDK set handled via GitHub Packages.
 */
function isSdkPackage(name) {
  return name === '@cowprotocol/cow-sdk' || name.startsWith('@cowprotocol/sdk-')
}

/**
 * Builds an npmjs tarball URL for a scoped CoW package version.
 */
function getNpmjsTarballUrl(name, version) {
  // Strip version range prefixes (^, ~, >=, etc.) to get the exact version
  const exactVersion = version.replace(/^[\^~>=<]+/, '')
  const unscoped = name.replace(/^@cowprotocol\//, '')
  return `https://registry.npmjs.org/${name}/-/${unscoped}-${exactVersion}.tgz`
}

/**
 * Rewrites non-SDK @cowprotocol dependencies to npmjs tarball URLs.
 *
 * This avoids failures caused by routing the whole scope to GitHub Packages.
 */
function pinNonSdkPackagesToNpmjs() {
  const packageJsonPaths = []
  const rewriteMap = {}

  for (const baseDir of [APPS_DIR, LIBS_DIR]) {
    if (!fs.existsSync(baseDir)) continue
    const entries = fs.readdirSync(baseDir, { withFileTypes: true })
    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      const pkgPath = path.join(baseDir, entry.name, 'package.json')
      if (fs.existsSync(pkgPath)) packageJsonPaths.push(pkgPath)
    }
  }

  for (const pkgPath of packageJsonPaths) {
    const content = fs.readFileSync(pkgPath, 'utf-8')
    const pkg = JSON.parse(content)
    const packageName = pkg.name
    if (!packageName) continue

    for (const section of ['dependencies', 'devDependencies']) {
      const deps = pkg[section]
      if (!deps) continue

      for (const depName of Object.keys(deps)) {
        if (!depName.startsWith('@cowprotocol/')) continue
        if (isSdkPackage(depName)) continue
        if (deps[depName].startsWith('workspace:')) continue
        if (deps[depName].startsWith('https://')) continue

        const tarballUrl = getNpmjsTarballUrl(depName, deps[depName])

        if (!rewriteMap[packageName]) rewriteMap[packageName] = {}

        rewriteMap[packageName][depName] = tarballUrl
        console.log(`[install.js] pinning ${packageName} -> ${depName}@${deps[depName]} -> ${tarballUrl}`)
      }
    }
  }

  return rewriteMap
}

/**
 * Runs pnpm install in the repository root.
 *
 * Uses a frozen lockfile by default. When `authToken` is provided (SDK preview install)
 * it temporarily extends the project `.npmrc` with the GitHub Packages registry/auth
 * (pnpm has no `--userconfig` flag), optionally points pnpm at a rewrite pnpmfile, runs
 * with `--no-frozen-lockfile`, then restores `.npmrc`.
 */
function runPnpmInstall(authToken, rewriteMap = {}) {
  if (!authToken) {
    console.log('[install.js] Installing normally (pnpm install --frozen-lockfile)...')
    execSync('pnpm install --frozen-lockfile', { cwd: ROOT_DIR, stdio: 'inherit' })
    return
  }

  // An empty rewrite map is valid: non-SDK @cowprotocol packages may already be pinned
  // to npmjs tarball URLs directly in package.json (see the `startsWith('https://')`
  // skip in pinNonSdkPackagesToNpmjs), leaving nothing to rewrite.
  const hasRewrites = Object.keys(rewriteMap).length > 0
  const npmrcBackup = fs.existsSync(ROOT_NPMRC_PATH) ? fs.readFileSync(ROOT_NPMRC_PATH, 'utf-8') : null

  console.log('[install.js] Installing with SDK PR version (pnpm install --no-frozen-lockfile)...')

  try {
    if (hasRewrites) createTempPnpmfile(rewriteMap)
    extendNpmrcForPreview(authToken, hasRewrites)

    // `--no-frozen-lockfile` on the CLI overrides `frozen-lockfile=true` from .npmrc.
    execSync('pnpm install --no-frozen-lockfile', { cwd: ROOT_DIR, stdio: 'inherit' })
  } catch (err) {
    console.error('[install.js] Failed to install dependencies:', err)
    throw err
  } finally {
    // Restore the original .npmrc (drop the appended registry/auth/pnpmfile lines).
    if (npmrcBackup !== null) {
      fs.writeFileSync(ROOT_NPMRC_PATH, npmrcBackup)
    } else {
      fs.rmSync(ROOT_NPMRC_PATH, { force: true })
    }

    if (hasRewrites) {
      try {
        removeTempPnpmfile()
      } catch (err) {
        console.warn('[install.js] Failed to remove temp pnpmfile:', err)
      }
    }
  }
}

/**
 * Temporarily extends the project `.npmrc` with the GitHub Packages registry/auth
 * required to install SDK preview builds. pnpm always reads the project `.npmrc` and
 * has no `--userconfig` flag, so this is the reliable way to inject the config.
 * The caller restores the original file afterwards.
 */
function extendNpmrcForPreview(token, hasRewrites) {
  const base = fs.existsSync(ROOT_NPMRC_PATH) ? fs.readFileSync(ROOT_NPMRC_PATH, 'utf-8').trimEnd() : ''
  const lines = [
    base,
    '',
    '# Appended by tools/scripts/install.js for the SDK preview install (restored afterwards)',
    '@cowprotocol:registry=https://npm.pkg.github.com',
    `//npm.pkg.github.com/:_authToken=${token}`,
  ]

  // Point pnpm at the in-memory rewrite hook via the `pnpmfile` config key.
  if (hasRewrites) {
    lines.push(`pnpmfile=${path.basename(TEMP_PNPMFILE_PATH)}`)
  }

  lines.push('')
  fs.writeFileSync(ROOT_NPMRC_PATH, lines.join('\n'))
}

/**
 * Creates a temporary pnpm hook file that rewrites workspace manifests in memory.
 *
 * @see https://pnpm.io/pnpmfile
 */
function createTempPnpmfile(rewriteMap) {
  const pnpmfile = `module.exports = {
  hooks: {
    readPackage(pkg) {
      const rewrites = ${JSON.stringify(rewriteMap, null, 2)}[pkg.name]
      if (!rewrites) return pkg

      for (const section of ['dependencies', 'devDependencies']) {
        if (!pkg[section]) continue
        for (const depName of Object.keys(rewrites)) {
          if (pkg[section][depName]) {
            pkg[section][depName] = rewrites[depName]
          }
        }
      }

      return pkg
    },
  },
}
`

  fs.writeFileSync(TEMP_PNPMFILE_PATH, pnpmfile)
}

/**
 * Deletes the temporary pnpm hook file if it exists.
 */
function removeTempPnpmfile() {
  fs.rmSync(TEMP_PNPMFILE_PATH, { force: true })
}
