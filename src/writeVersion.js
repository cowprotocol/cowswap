/* eslint-disable @typescript-eslint/no-var-requires */
const { version: CONTRACTS_VERSION } = require('@cowprotocol/contracts/package.json')

const fs = require('fs')

const { version: WEB_VERSION } = require('../package.json')

const OUTPUT_FILE = 'public/version.json'

const versionDetails = {
  contracts: CONTRACTS_VERSION,
  web: WEB_VERSION,
}

console.log('Version file generated in:', OUTPUT_FILE)
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(versionDetails, null, 2))
