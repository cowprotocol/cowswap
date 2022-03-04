// import ethereumLogoUrl from 'assets/images/ethereum-logo.png'
// import arbitrumLogoUrl from 'assets/svg/arbitrum_logo.svg'
// import optimismLogoUrl from 'assets/svg/optimistic_ethereum.svg'
// import ms from 'ms.macro'

import EthereumLogo from 'assets/cow-swap/network-mainnet-logo.svg' // mod
import RinkebyLogo from 'assets/cow-swap/network-rinkeby-logo.svg' // mod
import GnosisChainLogo from 'assets/cow-swap/network-gnosis-chain-logo.svg' // mod
export * from '@src/constants/chains'

export enum SupportedChainId {
  MAINNET = 1,
  // ROPSTEN = 3,
  RINKEBY = 4,
  // GOERLI = 5,
  // KOVAN = 42,

  // ARBITRUM_ONE = 42161,
  // ARBITRUM_RINKEBY = 421611,
  // OPTIMISM = 10,
  // OPTIMISTIC_KOVAN = 69,

  XDAI = 100,
}

export const ALL_SUPPORTED_CHAIN_IDS: SupportedChainId[] = [
  SupportedChainId.MAINNET,
  // SupportedChainId.ROPSTEN,
  SupportedChainId.RINKEBY,
  // SupportedChainId.GOERLI,
  // SupportedChainId.KOVAN,

  // SupportedChainId.ARBITRUM_ONE,
  // SupportedChainId.ARBITRUM_RINKEBY,
  // SupportedChainId.OPTIMISM,
  // SupportedChainId.OPTIMISTIC_KOVAN,

  SupportedChainId.XDAI,
]

export const L1_CHAIN_IDS = [
  SupportedChainId.MAINNET,
  // SupportedChainId.ROPSTEN,
  SupportedChainId.RINKEBY,
  // SupportedChainId.GOERLI,
  // SupportedChainId.KOVAN,
  SupportedChainId.XDAI,
] as const

export type SupportedL1ChainId = typeof L1_CHAIN_IDS[number]

export const L2_CHAIN_IDS = [
  // SupportedChainId.ARBITRUM_ONE,
  // SupportedChainId.ARBITRUM_RINKEBY,
  // SupportedChainId.OPTIMISM,
  // SupportedChainId.OPTIMISTIC_KOVAN,
] as const

export type SupportedL2ChainId = typeof L2_CHAIN_IDS[number]
