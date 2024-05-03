import ArbitrumOneLogo from '@cowprotocol/assets/cow-swap/network-arbitrum-one-logo.svg'
import GnosisChainLogo from '@cowprotocol/assets/cow-swap/network-gnosis-chain-logo.svg'
import EthereumLogo from '@cowprotocol/assets/cow-swap/network-mainnet-logo.svg'
import SepoliaLogo from '@cowprotocol/assets/cow-swap/network-sepolia-logo.svg'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { COW_PROTOCOL_LINK } from './common'
import { NATIVE_CURRENCIES } from './nativeAndWrappedTokens'
import { TokenWithLogo } from './types'

export interface BaseChainInfo {
  readonly docs: string
  readonly bridge?: string
  readonly explorer: string
  readonly infoLink: string
  readonly logoUrl: string
  readonly name: string
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
    name: 'mainnet',
    explorerTitle: 'Etherscan',
    urlAlias: '',
    logoUrl: EthereumLogo,
    color: '#62688F',
    nativeCurrency: NATIVE_CURRENCIES[SupportedChainId.MAINNET],
  },
  [SupportedChainId.ARBITRUM_ONE]: {
    docs: 'https://docs.arbitrum.io',
    bridge: 'https://bridge.arbitrum.io',
    explorer: 'https://arbiscan.io/',
    infoLink: 'https://arbitrum.io',
    label: 'Arbitrum One',
    name: 'arbitrum_one',
    explorerTitle: 'Arbiscan',
    urlAlias: 'abr1',
    logoUrl: ArbitrumOneLogo,
    color: '#1B4ADD',
    nativeCurrency: NATIVE_CURRENCIES[SupportedChainId.ARBITRUM_ONE],
  },
  [SupportedChainId.GNOSIS_CHAIN]: {
    docs: 'https://docs.gnosischain.com',
    bridge: 'https://bridge.gnosischain.com/',
    explorer: 'https://gnosisscan.io',
    infoLink: 'https://www.gnosischain.com',
    label: 'Gnosis Chain',
    name: 'gnosis_chain',
    explorerTitle: 'Gnosisscan',
    urlAlias: 'gc',
    logoUrl: GnosisChainLogo,
    color: '#07795B',
    nativeCurrency: NATIVE_CURRENCIES[SupportedChainId.GNOSIS_CHAIN],
  },
  [SupportedChainId.SEPOLIA]: {
    docs: 'https://docs.cow.fi',
    explorer: 'https://sepolia.etherscan.io',
    infoLink: COW_PROTOCOL_LINK,
    label: 'Sepolia',
    name: 'sepolia',
    explorerTitle: 'Etherscan',
    urlAlias: 'sepolia',
    logoUrl: SepoliaLogo,
    color: '#C12FF2',
    nativeCurrency: NATIVE_CURRENCIES[SupportedChainId.SEPOLIA],
  },
}

export const CHAIN_INFO_ARRAY: BaseChainInfo[] = Object.values(CHAIN_INFO)

export function getChainInfo(chainId: SupportedChainId): BaseChainInfo {
  return CHAIN_INFO[chainId]
}
