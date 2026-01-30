const fs = require('fs')

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
