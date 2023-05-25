import { SupportedL1ChainId, SupportedL2ChainId } from 'legacy/constants/chains'
import EthereumLogo from 'legacy/assets/cow-swap/network-mainnet-logo.svg'
import GoerliLogo from 'legacy/assets/cow-swap/network-goerli-logo.svg'
import GnosisChainLogo from 'legacy/assets/cow-swap/network-gnosis-chain-logo.svg'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

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
  readonly helpCenterUrl?: string
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

export interface L2ChainInfo extends BaseChainInfo {
  readonly networkType: NetworkType.L2
  readonly bridge: string
  readonly statusPage?: string
  readonly defaultListUrl: string
}

export type ChainInfoMap = { readonly [chainId in SupportedL2ChainId]: L1ChainInfo | L2ChainInfo }

export const CHAIN_INFO: ChainInfoMap = {
  [SupportedChainId.MAINNET]: {
    networkType: NetworkType.L1,
    docs: 'https://docs.cow.fi/',
    explorer: 'https://etherscan.io/',
    infoLink: 'https://cow.fi/',
    label: 'Ethereum',
    logoUrl: EthereumLogo,
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
  [SupportedChainId.GOERLI]: {
    networkType: NetworkType.L1,
    docs: 'https://docs.cow.fi/',
    explorer: 'https://goerli.etherscan.io/',
    infoLink: 'https://cow.fi/',
    label: 'Görli',
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
    logoUrl: GnosisChainLogo,
    nativeCurrency: { name: 'xDai', symbol: 'XDAI', decimals: 18 },
  },
}

export function getChainInfo(chainId: SupportedL1ChainId): L1ChainInfo
export function getChainInfo(chainId: SupportedL2ChainId): L2ChainInfo
export function getChainInfo(chainId: SupportedChainId): L1ChainInfo | L2ChainInfo
export function getChainInfo(
  chainId: SupportedChainId | SupportedL1ChainId | SupportedL2ChainId | number | undefined
): L1ChainInfo | L2ChainInfo | undefined

/**
 * Overloaded method for returning ChainInfo given a chainID
 * Return type varies depending on input type:
 * number | undefined -> returns chaininfo | undefined
 * SupportedChainId -> returns L1ChainInfo | L2ChainInfo
 * SupportedL1ChainId -> returns L1ChainInfo
 * SupportedL2ChainId -> returns L2ChainInfo
 */
export function getChainInfo(chainId: any): any {
  if (chainId) {
    return CHAIN_INFO[chainId] ?? undefined
  }
  return undefined
}

export const MAINNET_INFO = CHAIN_INFO[SupportedChainId.MAINNET]
export function getChainInfoOrDefault(chainId: number | undefined) {
  return getChainInfo(chainId) ?? MAINNET_INFO
}
