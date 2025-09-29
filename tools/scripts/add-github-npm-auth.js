const GITHUB_PACKAGE_READ_AUTH_TOKEN = process.env.GITHUB_PACKAGE_READ_AUTH_TOKEN

if (!GITHUB_PACKAGE_READ_AUTH_TOKEN) {
  console.log('GITHUB_PACKAGE_READ_AUTH_TOKEN is not specified, skipping GitHub npm auth.')
}

const fs = require('fs')

const content = `
# Default: install everything else from public npm
registry=https://registry.npmjs.org/

# Install @cowprotocol/* from npm.pkg.github.com
@cowprotocol:registry=https://npm.pkg.github.com

# Authentication for GitHub Packages
//npm.pkg.github.com/:_authToken=${GITHUB_PACKAGE_READ_AUTH_TOKEN}
`

fs.writeFileSync('.npmrc', content, 'utf8')

console.log('GitHub authentication for NPM has been set to .npmrc')
