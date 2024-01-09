export const footerConfig = {
  isBeta: false,
  url: {
    web: 'https://github.com/cowprotocol/explorer/tree/v',
    // TODO: Pending to move and adapt the wiki
    appId: null,
    // appId: 'https://github.com/gnosis/gp-v1-ui/wiki/App-Ids-for-Forks',
    contracts: {
      settlement: `https://github.com/cowprotocol/contracts/blob/v${CONTRACT_VERSION}/src/contracts/GPv2Settlement.sol`,
      vaultRelayer: `https://github.com/cowprotocol/contracts/blob/v${CONTRACT_VERSION}/src/contracts/GPv2VaultRelayer.sol`,
    },
  },
}
