import { L1ChainInfo } from '@src/constants/chains'
// import EthereumLogo from 'assets/images/ethereum-logo.png'
import EthereumLogo from 'assets/cow-swap/network-mainnet-logo.svg' // mod
import RinkebyLogo from 'assets/cow-swap/network-rinkeby-logo.svg' // mod
import xDaiLogo from 'assets/cow-swap/network-xdai-logo.svg' // mod
export * from '@src/constants/chains'

export enum SupportedChainId {
  MAINNET = 1,
  // ROPSTEN = 3,
  RINKEBY = 4,
  // GOERLI = 5,
  // KOVAN = 42,
  XDAI = 100,
  //   ARBITRUM_KOVAN = 144545313136048,
  //   ARBITRUM_ONE = 42161,
}

export type ChainInfo = { readonly [chainId in SupportedChainId]: L1ChainInfo & { logoUrl: string } } /* & {
  readonly [chainId in SupportedL2ChainId]: L2ChainInfo
} & { readonly [chainId in SupportedL1ChainId]: L1ChainInfo } */

export const CHAIN_INFO: ChainInfo = {
  /* [SupportedChainId.ARBITRUM_ONE]: {
    bridge: 'https://bridge.arbitrum.io/',
    docs: 'https://offchainlabs.com/',
    explorer: 'https://arbiscan.io/',
    infoLink: 'https://info.uniswap.org/#/arbitrum',
    label: 'Arbitrum',
    logoUrl: arbitrumLogoUrl,
  },
  [SupportedChainId.ARBITRUM_RINKEBY]: {
    bridge: 'https://bridge.arbitrum.io/',
    docs: 'https://offchainlabs.com/',
    explorer: 'https://rinkeby-explorer.arbitrum.io/',
    infoLink: 'https://info.uniswap.org/#/arbitrum/',
    label: 'Arbitrum Rinkeby',
    logoUrl: arbitrumLogoUrl,
  }, */
  [SupportedChainId.MAINNET]: {
    docs: 'https://docs.uniswap.org/',
    explorer: 'https://gnosis-protocol.io/mainnet',
    infoLink: '',
    // label: 'Mainnet',
    label: 'Ethereum',
    logoUrl: EthereumLogo,
  },
  [SupportedChainId.RINKEBY]: {
    docs: 'https://docs.uniswap.org/',
    explorer: 'https://gnosis-protocol.io/rinkeby',
    infoLink: '',
    label: 'Rinkeby',
    // logoUrl: EthereumLogo,
    logoUrl: RinkebyLogo, // mod
  },
  [SupportedChainId.XDAI]: {
    docs: 'https://docs.uniswap.org/',
    explorer: 'https://gnosis-protocol.io/xdai',
    infoLink: '',
    label: 'xDai',
    // logoUrl: EthereumLogo,
    logoUrl: xDaiLogo, // mod
  },
  /* [SupportedChainId.ROPSTEN]: {
    docs: 'https://docs.uniswap.org/',
    explorer: 'https://ropsten.etherscan.io/',
    infoLink: 'https://info.uniswap.org/#/',
    label: 'Ropsten',
  },
  [SupportedChainId.KOVAN]: {
    docs: 'https://docs.uniswap.org/',
    explorer: 'https://kovan.etherscan.io/',
    infoLink: 'https://info.uniswap.org/#/',
    label: 'Kovan',
  },
  [SupportedChainId.GOERLI]: {
    docs: 'https://docs.uniswap.org/',
    explorer: 'https://goerli.etherscan.io/',
    infoLink: 'https://info.uniswap.org/#/',
    label: 'Görli',
  },
  [SupportedChainId.OPTIMISM]: {
    bridge: 'https://gateway.optimism.io/',
    docs: 'https://optimism.io/',
    explorer: 'https://optimistic.etherscan.io/',
    infoLink: 'https://info.uniswap.org/#/optimism/',
    label: 'Optimism',
    logoUrl: optimismLogoUrl,
  },
  [SupportedChainId.OPTIMISTIC_KOVAN]: {
    bridge: 'https://gateway.optimism.io/',
    docs: 'https://optimism.io/',
    explorer: 'https://optimistic.etherscan.io/',
    infoLink: 'https://info.uniswap.org/#/optimism',
    label: 'Optimistic Kovan',
    logoUrl: optimismLogoUrl,
  }, */
}

export const NETWORK_LABELS: { [chainId in SupportedChainId | number]: string } = {
  // [SupportedChainId.MAINNET]: 'Mainnet',
  [SupportedChainId.MAINNET]: 'Ethereum', // mod
  [SupportedChainId.RINKEBY]: 'Rinkeby',
  // [SupportedChainId.ROPSTEN]: 'Ropsten',
  // [SupportedChainId.GOERLI]: 'Görli',
  // [SupportedChainId.KOVAN]: 'Kovan',
  // [SupportedChainId.XDAI]: 'XDai',
  [SupportedChainId.XDAI]: 'xDai', // mod
  //   [SupportedChainId.ARBITRUM_KOVAN]: 'kArbitrum',
  //   [SupportedChainId.ARBITRUM_ONE]: 'Arbitrum One',
}

export const ALL_SUPPORTED_CHAIN_IDS: SupportedChainId[] = [
  SupportedChainId.MAINNET,
  SupportedChainId.RINKEBY,
  SupportedChainId.XDAI,
]
