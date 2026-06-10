const { execSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')

const ROOT_DIR = path.resolve(__dirname, '../..')
const APPS_DIR = path.join(ROOT_DIR, 'apps')
const LIBS_DIR = path.join(ROOT_DIR, 'libs')
const TEMP_PNPMFILE_PATH = path.join(ROOT_DIR, '.pnpmfile.preview.cjs')
const LOCKFILE_PATH = path.join(ROOT_DIR, 'pnpm-lock.yaml')

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
let rewriteMap
let forceResolveKeys

try {
  ;({ rewriteMap, forceResolveKeys } = pinNonSdkPackagesToNpmjs())
} catch (err) {
  console.error('[install.js] Failed to pin non-SDK packages to npmjs:', err)
  process.exit(1)
}

try {
  runPnpmInstall(PACKAGE_READ_AUTH_TOKEN, rewriteMap, forceResolveKeys)
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
 * Extracts the exact version from a npmjs tarball URL like
 * `https://registry.npmjs.org/@cowprotocol/cms/-/cms-0.11.0.tgz` -> `0.11.0`.
 * Returns null when the URL doesn't match the expected `<unscoped>-<version>.tgz` shape.
 */
function getVersionFromTarballUrl(name, url) {
  const unscoped = name.replace(/^@cowprotocol\//, '')
  const file = url.substring(url.lastIndexOf('/') + 1)
  const prefix = `${unscoped}-`
  if (!file.startsWith(prefix) || !file.endsWith('.tgz')) return null
  return file.slice(prefix.length, -'.tgz'.length)
}

/**
 * Plans how to keep non-SDK @cowprotocol dependencies on npmjs while the whole scope
 * is routed to GitHub Packages. Returns:
 *  - rewriteMap: per-manifest deps whose version *range* must be rewritten to a npmjs
 *    tarball URL (applied via a pnpmfile readPackage hook). Changing the spec string
 *    forces pnpm to re-resolve them as direct tarballs, bypassing the scope registry.
 *  - forceResolveKeys: `name@version` lockfile keys for deps that are *already* pinned to
 *    a npmjs tarball URL in package.json. pnpm collapses those URLs into plain
 *    `@cowprotocol/<pkg>@<version>` registry entries in the committed lockfile, so on a
 *    `--no-frozen-lockfile` install ("lockfile up to date, resolution skipped") it
 *    reconstructs the tarball URL from the scope registry (GitHub) and 404s. Stripping
 *    these keys from the lockfile forces a fresh resolution that honors the npmjs URL.
 */
function pinNonSdkPackagesToNpmjs() {
  const packageJsonPaths = []
  const rewriteMap = {}
  const forceResolveKeys = new Set()

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

        // Already pinned to a npmjs tarball URL: force a fresh lockfile resolution instead
        // of rewriting (rewriting to the same URL is a no-op and leaves the stale by-name
        // entry that gets routed to GitHub Packages).
        if (deps[depName].startsWith('https://')) {
          const version = getVersionFromTarballUrl(depName, deps[depName])
          if (version) {
            forceResolveKeys.add(`${depName}@${version}`)
            console.log(`[install.js] forcing lockfile re-resolution of ${depName}@${version}`)
          } else {
            console.warn(`[install.js] could not parse version from ${depName} -> ${deps[depName]}`)
          }
          continue
        }

        const tarballUrl = getNpmjsTarballUrl(depName, deps[depName])

        if (!rewriteMap[packageName]) rewriteMap[packageName] = {}

        rewriteMap[packageName][depName] = tarballUrl
        console.log(`[install.js] pinning ${packageName} -> ${depName}@${deps[depName]} -> ${tarballUrl}`)
      }
    }
  }

  return { rewriteMap, forceResolveKeys: Array.from(forceResolveKeys) }
}

/**
 * Removes the `packages:`/`snapshots:` entries for the given `name@version` keys from the
 * lockfile so pnpm re-resolves them on the next install. Returns the original lockfile
 * contents (or null if absent) so the caller can restore it afterwards.
 */
function stripLockfileEntries(keys) {
  if (!keys.length || !fs.existsSync(LOCKFILE_PATH)) return null

  const original = fs.readFileSync(LOCKFILE_PATH, 'utf-8')
  let updated = original

  for (const key of keys) {
    const esc = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    // A top-level (2-space indented) lockfile block: the quoted key (optionally
    // peer-suffixed `(...)`) plus every deeper-indented (4+ space) continuation line.
    const re = new RegExp("\\n  '" + esc + "'(?:\\([^\\n]*\\))?:\\n(?:    .*\\n)*", 'g')
    updated = updated.replace(re, '\n')
  }

  if (updated !== original) fs.writeFileSync(LOCKFILE_PATH, updated)

  return original
}

/**
 * Runs pnpm install in the repository root.
 *
 * Uses a frozen lockfile by default. When `authToken` is provided (SDK preview install)
 * it injects the GitHub Packages registry/auth through a temporary npmrc userconfig
 * (and an optional rewrite pnpmfile) into the child pnpm process, then runs with
 * `--no-frozen-lockfile`. The auth token is written only to an OS temp directory
 * npmrc with restrictive permissions and is removed after the install attempt.
 */
function runPnpmInstall(authToken, rewriteMap = {}, forceResolveKeys = []) {
  if (!authToken) {
    console.log('[install.js] Installing normally (pnpm install --frozen-lockfile)...')
    execSync('pnpm install --frozen-lockfile', { cwd: ROOT_DIR, stdio: 'inherit' })
    return
  }

  const hasRewrites = Object.keys(rewriteMap).length > 0
  const hasForceResolve = forceResolveKeys.length > 0
  if (!hasRewrites && !hasForceResolve) {
    // Warn so a silent regression in `pinNonSdkPackagesToNpmjs` (which would let non-SDK
    // @cowprotocol packages get routed to GitHub Packages) stays visible in logs.
    console.warn('[install.js] Auth token provided but no @cowprotocol/* pinning was planned.')
  }

  console.log('[install.js] Installing with SDK PR version (pnpm install --no-frozen-lockfile)...')

  const childEnv = { ...process.env }

  if (hasRewrites) {
    // `pnpmfile` is a pnpm-specific config key (no secret); pnpm resolves it relative to cwd.
    childEnv.npm_config_pnpmfile = TEMP_PNPMFILE_PATH
  }

  let originalLockfile = null
  let tempNpmrcDir = null

  try {
    const tempNpmrc = createTempNpmrc(authToken)
    tempNpmrcDir = tempNpmrc.dir
    childEnv.npm_config_userconfig = tempNpmrc.path

    if (hasRewrites) createTempPnpmfile(rewriteMap)
    if (hasForceResolve) originalLockfile = stripLockfileEntries(forceResolveKeys)

    // `--no-frozen-lockfile` on the CLI overrides `frozen-lockfile=true` from .npmrc.
    execSync('pnpm install --no-frozen-lockfile', { cwd: ROOT_DIR, stdio: 'inherit', env: childEnv })
  } catch (err) {
    console.error('[install.js] Failed to install dependencies:', err)
    throw err
  } finally {
    if (hasRewrites) {
      try {
        fs.rmSync(TEMP_PNPMFILE_PATH, { force: true })
      } catch (err) {
        console.warn('[install.js] Failed to remove temp pnpmfile:', err)
      }
    }
    // Restore the committed lockfile so the working tree stays clean. The install already
    // populated node_modules; the on-disk lockfile is only needed by later steps that read
    // the unmodified, committed graph.
    if (originalLockfile !== null) {
      try {
        fs.writeFileSync(LOCKFILE_PATH, originalLockfile)
      } catch (err) {
        console.warn('[install.js] Failed to restore pnpm-lock.yaml:', err)
      }
    }
    if (tempNpmrcDir !== null) {
      try {
        fs.rmSync(tempNpmrcDir, { force: true, recursive: true })
      } catch (err) {
        console.warn('[install.js] Failed to remove temp npmrc:', err)
      }
    }
  }
}

/**
 * Creates a temporary npmrc containing the GitHub Packages registry/auth settings.
 *
 * pnpm 10 reliably consumes these scoped auth settings from an npmrc passed through
 * `npm_config_userconfig`; passing the same keys directly as environment variables is
 * not portable across build providers.
 */
function createTempNpmrc(authToken) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cowswap-pnpm-'))
  const npmrcPath = path.join(dir, '.npmrc')

  try {
    fs.writeFileSync(
      npmrcPath,
      `@cowprotocol:registry=https://npm.pkg.github.com\n//npm.pkg.github.com/:_authToken=${authToken}\n`,
      { mode: 0o600 },
    )
  } catch (err) {
    fs.rmSync(dir, { force: true, recursive: true })
    throw err
  }

  return { dir, path: npmrcPath }
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
