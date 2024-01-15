import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { COW_PROTOCOL_LINK } from './common'

import GnosisChainLogo from '@cowprotocol/assets/cow-swap/network-gnosis-chain-logo.svg'
import GoerliLogo from '@cowprotocol/assets/cow-swap/network-goerli-logo.svg'
import SepoliaLogo from '@cowprotocol/assets/cow-swap/network-sepolia-logo.svg'
import EthereumLogo from '@cowprotocol/assets/cow-swap/network-mainnet-logo.svg'
import { NATIVE_CURRENCIES } from './nativeAndWrappedTokens'
import { TokenWithLogo } from './types'

export interface BaseChainInfo {
  readonly docs: string
  readonly bridge?: string
  readonly explorer: string
  readonly infoLink: string
  readonly logoUrl: string
  readonly label: string
  readonly urlAlias: string
  readonly helpCenterUrl?: string
  readonly explorerTitle: string
  readonly color: string
  readonly nativeCurrency: TokenWithLogo
}

export type ChainInfoMap = Record<SupportedChainId, BaseChainInfo>

export const CHAIN_INFO: ChainInfoMap = {
  [SupportedChainId.MAINNET]: {
    docs: 'https://docs.cow.fi',
    explorer: 'https://etherscan.io',
    infoLink: COW_PROTOCOL_LINK,
    label: 'Ethereum',
    explorerTitle: 'Etherscan',
    urlAlias: '',
    logoUrl: EthereumLogo,
    color: '#62688F',
    nativeCurrency: NATIVE_CURRENCIES[SupportedChainId.MAINNET],
  },
  [SupportedChainId.GOERLI]: {
    docs: 'https://docs.cow.fi',
    explorer: 'https://goerli.etherscan.io',
    infoLink: COW_PROTOCOL_LINK,
    label: 'Görli',
    explorerTitle: 'Etherscan',
    urlAlias: 'goerli',
    logoUrl: GoerliLogo,
    color: '#2F99F2',
    nativeCurrency: NATIVE_CURRENCIES[SupportedChainId.GOERLI],
  },
  [SupportedChainId.SEPOLIA]: {
    docs: 'https://docs.cow.fi',
    explorer: 'https://sepolia.etherscan.io',
    infoLink: COW_PROTOCOL_LINK,
    label: 'Sepolia',
    explorerTitle: 'Etherscan',
    urlAlias: 'sepolia',
    logoUrl: SepoliaLogo,
    color: '#C12FF2',
    nativeCurrency: NATIVE_CURRENCIES[SupportedChainId.SEPOLIA],
  },
  [SupportedChainId.GNOSIS_CHAIN]: {
    docs: 'https://docs.gnosischain.com',
    bridge: 'https://omni.gnosischain.com/bridge',
    explorer: 'https://gnosisscan.io',
    infoLink: 'https://www.gnosischain.com',
    label: 'Gnosis Chain',
    explorerTitle: 'Gnosisscan',
    urlAlias: 'gc',
    logoUrl: GnosisChainLogo,
    color: '#07795B',
    nativeCurrency: NATIVE_CURRENCIES[SupportedChainId.GNOSIS_CHAIN],
  },
}

export const CHAIN_INFO_ARRAY: BaseChainInfo[] = Object.values(CHAIN_INFO)

export function getChainInfo(chainId: SupportedChainId): BaseChainInfo {
  return CHAIN_INFO[chainId]
}
