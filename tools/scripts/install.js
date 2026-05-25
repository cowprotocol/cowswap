const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const ROOT_DIR = path.resolve(__dirname, '../..')
const APPS_DIR = path.join(ROOT_DIR, 'apps')
const LIBS_DIR = path.join(ROOT_DIR, 'libs')
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

        // Non-SDK @cowprotocol packages (e.g. @cowprotocol/cms, @cowprotocol/cow-runner-game)
        // are only published to npmjs, not to GitHub Packages. With `@cowprotocol:registry`
        // pointed at GitHub Packages for the SDK preview, pnpm would otherwise route ALL
        // @cowprotocol/* fetches there and 404 on these.
        //
        // We can't rely on a `https://...tgz` specifier already being in package.json:
        // pnpm's lockfile compacts those entries to `version + integrity` (no `tarball:`
        // field), and on a fresh install pnpm reconstructs the fetch URL from the active
        // scope registry — which is wrong here. Rewriting the workspace manifest at
        // `readPackage` time forces pnpm to see a URL specifier and fetch it directly,
        // bypassing the scope registry entirely.
        const existingSpec = deps[depName]
        const tarballUrl = existingSpec.startsWith('https://')
          ? existingSpec
          : getNpmjsTarballUrl(depName, existingSpec)

        if (!rewriteMap[packageName]) rewriteMap[packageName] = {}

        rewriteMap[packageName][depName] = tarballUrl
        console.log(`[install.js] pinning ${packageName} -> ${depName}@${existingSpec} -> ${tarballUrl}`)
      }
    }
  }

  return rewriteMap
}

/**
 * Runs pnpm install in the repository root.
 *
 * Uses a frozen lockfile by default. When `authToken` is provided (SDK preview install)
 * it exposes the GitHub Packages auth token to the child pnpm via the
 * `GITHUB_PACKAGES_TOKEN` env var; the project `.npmrc` references that var with
 * `//npm.pkg.github.com/:_authToken=${GITHUB_PACKAGES_TOKEN}`, and pnpm interpolates it
 * from the environment when reading the config. The token never lives on disk in the
 * working tree — neither in `.npmrc` (only the `${...}` placeholder is committed) nor
 * in any temp file we create.
 *
 * We deliberately do NOT set `@cowprotocol:registry` to GitHub Packages: all SDK preview
 * lockfile entries already carry `tarball: https://npm.pkg.github.com/download/...`, so
 * pnpm fetches them by URL and the host-scoped auth header applies. Non-SDK
 * `@cowprotocol/*` packages (`@cowprotocol/cms`, `@cowprotocol/cow-runner-game`) live
 * only on npmjs and reconstruct via the default registry — a scope override would 404
 * on them.
 *
 * Why env-var interpolation in `.npmrc` rather than `pnpm_config_*` env vars or
 * `PNPM_CONFIG_USERCONFIG`: pnpm 10.30.3 no longer reads `npm_config_*`, its
 * `pnpm_config_*` env-var parser does not reliably handle auth-token keys containing
 * `//` and `:`, and `PNPM_CONFIG_USERCONFIG` (pnpm/pnpm#9491) is still an unmerged PR.
 * `${VAR}` interpolation in `.npmrc` is the long-standing, supported npm/pnpm path.
 */
function runPnpmInstall(authToken, rewriteMap = {}) {
  if (!authToken) {
    console.log('[install.js] Installing normally (pnpm install --frozen-lockfile)...')
    execSync('pnpm install --frozen-lockfile', { cwd: ROOT_DIR, stdio: 'inherit' })
    return
  }

  // An empty rewrite map is valid: non-SDK @cowprotocol packages may already be pinned
  // to npmjs tarball URLs directly in package.json. Warn so a silent regression in
  // `pinNonSdkPackagesToNpmjs` would still be visible in logs.
  const hasRewrites = Object.keys(rewriteMap).length > 0
  if (!hasRewrites) {
    console.warn('[install.js] Auth token provided but rewrite map is empty — no @cowprotocol/* pinning needed.')
  }

  console.log('[install.js] Installing with SDK PR version (pnpm install --no-frozen-lockfile)...')

  const childEnv = { ...process.env, GITHUB_PACKAGES_TOKEN: authToken }

  try {
    if (hasRewrites) createTempPnpmfile(rewriteMap)

    // `--no-frozen-lockfile` on the CLI overrides `frozen-lockfile=true` from .npmrc.
    // `--config.pnpmfile=...` points pnpm at the temp rewrite hook when needed.
    const pnpmfileArg = hasRewrites ? ` --config.pnpmfile="${TEMP_PNPMFILE_PATH}"` : ''
    execSync(`pnpm install --no-frozen-lockfile${pnpmfileArg}`, {
      cwd: ROOT_DIR,
      stdio: 'inherit',
      env: childEnv,
    })
  } catch (err) {
    console.error('[install.js] Failed to install dependencies:', err)
    throw err
  } finally {
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
