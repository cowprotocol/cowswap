const fs = require('fs')
const path = require('path')

const ROOT_DIR = path.resolve(__dirname, '../..')
const APPS_DIR = path.join(ROOT_DIR, 'apps')
const LIBS_DIR = path.join(ROOT_DIR, 'libs')

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
  console.log('[install-sdk-preview.js] no SDK PR version set, skipping')
  return
}

const PACKAGE_READ_AUTH_TOKEN = process.env.PACKAGE_READ_AUTH_TOKEN

if (!PACKAGE_READ_AUTH_TOKEN) {
  console.error(
    '[install-sdk-preview.js] PACKAGE_READ_AUTH_TOKEN env var is not set but expected by install-sdk-preview.js',
  )
  process.exit(1)
  return
}

const npmrc = `
# Default: install everything else from public npm
registry=https://registry.npmjs.org/

# Install @cowprotocol/* from npm.pkg.github.com
@cowprotocol:registry=https://npm.pkg.github.com

# Authentication for GitHub Packages
//npm.pkg.github.com/:_authToken=${PACKAGE_READ_AUTH_TOKEN}
`

fs.writeFileSync('.npmrc', npmrc)

// The scope-wide @cowprotocol:registry redirects ALL @cowprotocol/* packages to GitHub Packages.
// Non-SDK packages (e.g. @cowprotocol/cms) are only on npmjs and would fail to install.
// Fix: pin them to explicit npmjs tarball URLs so pnpm fetches them directly, bypassing the scope registry.
pinNonSdkPackagesToNpmjs()

function isSdkPackage(name) {
  return name === '@cowprotocol/cow-sdk' || name.startsWith('@cowprotocol/sdk-')
}

function getNpmjsTarballUrl(name, version) {
  // Strip version range prefixes (^, ~, >=, etc.) to get the exact version
  const exactVersion = version.replace(/^[\^~>=<]+/, '')
  const unscoped = name.replace(/^@cowprotocol\//, '')
  return `https://registry.npmjs.org/${name}/-/${unscoped}-${exactVersion}.tgz`
}

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
        console.log(`[install-sdk-preview.js] pinning ${depName}@${deps[depName]} -> ${tarballUrl}`)
        deps[depName] = tarballUrl
        changed = true
      }
    }

    if (changed) {
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
    }
  }
}
