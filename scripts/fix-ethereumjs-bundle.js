const fs = require('fs')
const path = require('path')

/*
These files are included in the main bundle, but we don't need them.
Because of it, we just override the content of the files by {}.
 */

const sources = ['dist.browser', 'dist', 'src']
const chains = ['mainnet', 'goerli', 'rinkeby', 'ropsten']

const filesToReplace = [
  (source, chain) => `../node_modules/@ethereumjs/common/${source}/genesisStates/${chain}.json`,
  (source, chain) =>
    `../node_modules/@web3-onboard/hw-common/node_modules/@ethereumjs/common/${source}/genesisStates/${chain}.json`,
  (source, chain) =>
    `../node_modules/web3-eth-accounts/node_modules/@ethereumjs/common/${source}/genesisStates/${chain}.json`,
  (source, chain) =>
    `../node_modules/web3-eth-accounts/node_modules/@ethereumjs/tx/node_modules/@ethereumjs/common/${source}/genesisStates/${chain}.json`,
]

filesToReplace.forEach((filePath) => {
  sources.forEach((source) => {
    chains.forEach((chain) => {
      fs.writeFileSync(path.resolve(__dirname, filePath(source, chain)), '{}')
    })
  })
})
