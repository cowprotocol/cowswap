import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { COW_PROTOCOL_LINK } from './common'

import GnosisChainLogo from '@cowprotocol/assets/cow-swap/network-gnosis-chain-logo.svg'
import GoerliLogo from '@cowprotocol/assets/cow-swap/network-goerli-logo.svg'
import SepoliaLogo from '@cowprotocol/assets/cow-swap/network-sepolia-logo.svg'
import EthereumLogo from '@cowprotocol/assets/cow-swap/network-mainnet-logo.svg'

export enum NetworkType {
  L1,
  L2,
}

interface BaseChainInfo {
  readonly networkType: NetworkType
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

export type ChainInfoMap = Record<SupportedChainId, L1ChainInfo>

export const CHAIN_INFO: ChainInfoMap = {
  [SupportedChainId.MAINNET]: {
    networkType: NetworkType.L1,
    docs: 'https://docs.cow.fi',
    explorer: 'https://etherscan.io',
    infoLink: COW_PROTOCOL_LINK,
    label: 'Ethereum',
    name: 'mainnet',
    explorerTitle: 'Etherscan',
    logoUrl: EthereumLogo,
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
  [SupportedChainId.GOERLI]: {
    networkType: NetworkType.L1,
    docs: 'https://docs.cow.fi',
    explorer: 'https://goerli.etherscan.io',
    infoLink: COW_PROTOCOL_LINK,
    label: 'Görli',
    name: 'goerli',
    explorerTitle: 'Etherscan',
    logoUrl: GoerliLogo,
    nativeCurrency: { name: 'Görli Ether', symbol: 'görETH', decimals: 18 },
  },
  [SupportedChainId.SEPOLIA]: {
    networkType: NetworkType.L1,
    docs: 'https://docs.cow.fi',
    explorer: 'https://sepolia.etherscan.io',
    infoLink: COW_PROTOCOL_LINK,
    label: 'Sepolia',
    name: 'sepolia',
    explorerTitle: 'Etherscan',
    logoUrl: SepoliaLogo,
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
  },
  [SupportedChainId.GNOSIS_CHAIN]: {
    networkType: NetworkType.L1,
    docs: 'https://docs.gnosischain.com',
    bridge: 'https://omni.gnosischain.com/bridge',
    explorer: 'https://gnosisscan.io',
    infoLink: 'https://www.gnosischain.com',
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
