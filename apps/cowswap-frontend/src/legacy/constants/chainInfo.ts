import { SupportedChainId } from '@cowprotocol/cow-sdk'

import GnosisChainLogo from 'legacy/assets/cow-swap/network-gnosis-chain-logo.svg'
import GoerliLogo from 'legacy/assets/cow-swap/network-goerli-logo.svg'
import EthereumLogo from 'legacy/assets/cow-swap/network-mainnet-logo.svg'

export enum NetworkType {
  L1,
  L2,
}

interface BaseChainInfo {
  readonly networkType: NetworkType
  readonly blockWaitMsBeforeWarning?: number
  readonly docs: string
  readonly bridge?: string
  readonly explorer: string
  readonly infoLink: string
  readonly logoUrl: string
  readonly label: string
  readonly name: string
  readonly helpCenterUrl?: string
  readonly explorerTitle: string
  readonly nativeCurrency: {
    name: string // e.g. 'Goerli ETH',
    symbol: string // e.g. 'gorETH',
    decimals: number // e.g. 18,
  }
}

export interface L1ChainInfo extends BaseChainInfo {
  readonly networkType: NetworkType.L1
  readonly defaultListUrl?: string
}

export type ChainInfoMap = { readonly [chainId in SupportedChainId]: L1ChainInfo }

export const CHAIN_INFO: ChainInfoMap = {
  [SupportedChainId.MAINNET]: {
    networkType: NetworkType.L1,
    docs: 'https://docs.cow.fi/',
    explorer: 'https://etherscan.io/',
    infoLink: 'https://cow.fi/',
    label: 'Ethereum',
    name: 'mainnet',
    explorerTitle: 'Etherscan',
    logoUrl: EthereumLogo,
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
  [SupportedChainId.GOERLI]: {
    networkType: NetworkType.L1,
    docs: 'https://docs.cow.fi/',
    explorer: 'https://goerli.etherscan.io/',
    infoLink: 'https://cow.fi/',
    label: 'Görli',
    name: 'goerli',
    explorerTitle: 'Etherscan',
    logoUrl: GoerliLogo,
    nativeCurrency: { name: 'Görli Ether', symbol: 'görETH', decimals: 18 },
  },
  [SupportedChainId.GNOSIS_CHAIN]: {
    networkType: NetworkType.L1,
    docs: 'https://docs.gnosischain.com/',
    bridge: 'https://omni.gnosischain.com/bridge',
    explorer: 'https://gnosisscan.io/',
    infoLink: 'https://www.gnosischain.com/',
    label: 'Gnosis Chain',
    name: 'gnosis_chain',
    explorerTitle: 'Gnosisscan',
    logoUrl: GnosisChainLogo,
    nativeCurrency: { name: 'xDai', symbol: 'XDAI', decimals: 18 },
  },
}

export function getChainInfo(chainId: SupportedChainId): L1ChainInfo {
  return CHAIN_INFO[chainId]
}
