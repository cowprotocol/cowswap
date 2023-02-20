const fs = require('fs')
const path = require('path')

/*
These files are included in the main bundle, but we don't need them.
Because of it, we just override the content of the files by {}.
 */

fs.writeFileSync(
  path.resolve(
    __dirname,
    '../node_modules/@ethereumjs/tx/node_modules/@ethereumjs/common/dist.browser/genesisStates/mainnet.json'
  ),
  '{}'
)
fs.writeFileSync(
  path.resolve(__dirname, '../node_modules/@ethereumjs/common/dist.browser/genesisStates/mainnet.json'),
  '{}'
)
