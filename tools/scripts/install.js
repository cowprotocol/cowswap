const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const ROOT_DIR = path.resolve(__dirname, '../..')
const APPS_DIR = path.join(ROOT_DIR, 'apps')
const LIBS_DIR = path.join(ROOT_DIR, 'libs')
const ROOT_NPMRC_PATH = path.join(ROOT_DIR, '.npmrc')
const TEMP_USER_CONFIG_PATH = path.join(ROOT_DIR, '.npmrc.preview')

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

  runPnpmInstall()
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
try {
  pinNonSdkPackagesToNpmjs()
} catch (err) {
  console.error('[install.js] Failed to pin non-SDK packages to npmjs:', err)
  process.exit(1)
}

const installationSuccess = runPnpmInstall(PACKAGE_READ_AUTH_TOKEN)

if (!installationSuccess) {
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
    let changed = false

    for (const section of ['dependencies', 'devDependencies']) {
      const deps = pkg[section]
      if (!deps) continue

      for (const depName of Object.keys(deps)) {
        if (!depName.startsWith('@cowprotocol/')) continue
        if (isSdkPackage(depName)) continue
        if (deps[depName].startsWith('workspace:')) continue
        if (deps[depName].startsWith('https://')) continue

        const tarballUrl = getNpmjsTarballUrl(depName, deps[depName])
        console.log(`[install.js] pinning ${depName}@${deps[depName]} -> ${tarballUrl}`)
        deps[depName] = tarballUrl
        changed = true
      }
    }

    if (changed) {
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
    }
  }
}

/**
 * Runs pnpm install in the repository root.
 *
 * Uses frozen lockfile by default. When `authToken` is provided it creates a temporary
 * user config with said `authToken` and runs with no frozen lockfile.
 */
function runPnpmInstall(authToken) {
  const installArgs = authToken ? `--no-frozen-lockfile --userconfig "${TEMP_USER_CONFIG_PATH}"` : '--frozen-lockfile'

  if (authToken) {
    console.log(`[install.js] Installing with SDK PR version (pnpm install ${installArgs})...`)
  } else {
    console.log(`[install.js] Installing normally (pnpm install ${installArgs})...`)
  }

  try {
    if (authToken) createTempUserConfig(authToken)

    execSync(`pnpm install ${installArgs}`, {
      cwd: ROOT_DIR,
      stdio: 'inherit',
    })

    return true
  } catch (err) {
    console.error('[install.js] Failed to install dependencies:', err)
  } finally {
    if (authToken) {
      try {
        removeTempUserConfig()
      } catch (err) {
        console.warn('[install.js] Failed to remove temp user config:', err)
      }
    }
  }
}

/**
 * Creates a temporary npm user config used for authenticated SDK installs.
 *
 * The file starts with the current repository `.npmrc` content and appends
 * the @cowprotocol registry/auth entries required for GitHub Packages.
 */
function createTempUserConfig(token) {
  const rootNpmrcContent = fs.existsSync(ROOT_NPMRC_PATH) ? fs.readFileSync(ROOT_NPMRC_PATH, 'utf-8').trimEnd() : ''
  const userConfig = [
    rootNpmrcContent,
    '# Generated by tools/scripts/install.js',
    '@cowprotocol:registry=https://npm.pkg.github.com',
    `//npm.pkg.github.com/:_authToken=${token}`,
    '',
  ].join('\n')

  fs.writeFileSync(TEMP_USER_CONFIG_PATH, userConfig)
}

/**
 * Deletes the temporary npm user config file if it exists.
 */
function removeTempUserConfig() {
  fs.rmSync(TEMP_USER_CONFIG_PATH, { force: true })
}
