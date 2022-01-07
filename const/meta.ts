const API_BASE_URL = "https://api.cow.fi"

export const siteConfig = {
  title: 'CoW Protocol',
  description: 'Ethereums MetaDEX Aggregator built by Gnosis. It allows users to trade tokens with MEV protection while using ETH-less orders that are settled p2p among users or into the best on-chain liquidity pool.',
  descriptionShort: 'Ethereums MetaDEX Aggregator',
  url: {
    root: "https://cow.fi",
    rootETH: "cow.eth",
    swap: "https://cowswap.exchange",
    docs: "https://docs.cow.fi",
    api: API_BASE_URL + "/mainnet",
    apiDocs: API_BASE_URL + "/docs",
    analytics: "https://dune.xyz/gnosis.protocol/Gnosis-Protocol-V2",
    explorer: "https://explorer.cow.fi"
  },
  social: {
    twitter: { label: 'Twitter', account: '@MEVprotection', url: 'https://twitter.com/mevprotection' },
    discord: { label: 'Discord', url: 'https://chat.cowswap.exchange/' },
    github: { label: 'GitHub', url: 'https://github.com/gnosis/gp-v2-contracts' },
    forum: { label: 'Forum', url: 'https://forum.gnosis.io/' },
  }
}
