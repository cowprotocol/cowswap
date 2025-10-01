const fs = require('fs')

const PACKAGE_READ_AUTH_TOKEN = process.env.PACKAGE_READ_AUTH_TOKEN

if (!PACKAGE_READ_AUTH_TOKEN) {
  console.error('PACKAGE_READ_AUTH_TOKEN env var is not set but expected by install-sdk-preview.js')
  process.exit(1)
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
