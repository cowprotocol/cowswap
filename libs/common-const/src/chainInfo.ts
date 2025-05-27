import AvalancheLogo from '@cowprotocol/assets/cow-swap/avax-logo.svg'
import ArbitrumOneLogoLight from '@cowprotocol/assets/cow-swap/network-arbitrum-one-logo-blue.svg'
import ArbitrumOneLogoDark from '@cowprotocol/assets/cow-swap/network-arbitrum-one-logo-white.svg'
import BaseLogo from '@cowprotocol/assets/cow-swap/network-base-logo.svg'
import GnosisChainLogo from '@cowprotocol/assets/cow-swap/network-gnosis-chain-logo.svg'
import EthereumLogo from '@cowprotocol/assets/cow-swap/network-mainnet-logo.svg'
import SepoliaLogo from '@cowprotocol/assets/cow-swap/network-sepolia-logo.svg'
import PolygonLogo from '@cowprotocol/assets/cow-swap/polygon-logo.svg'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { NATIVE_CURRENCIES } from './nativeAndWrappedTokens'
import { TokenWithLogo } from './types'

export interface BaseChainInfo {
  readonly docs: string
  readonly bridge?: string
  readonly explorer: string
  readonly infoLink: string
  readonly logo: { light: string; dark: string }
  readonly name: string
  readonly addressPrefix: string
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
    docs: 'https://ethereum.org/en/learn',
    explorer: 'https://etherscan.io',
    infoLink: 'https://ethereum.org',
    label: 'Ethereum',
    name: 'mainnet',
    addressPrefix: 'eth',
    explorerTitle: 'Etherscan',
    urlAlias: '',
    logo: { light: EthereumLogo, dark: EthereumLogo },
    color: '#62688F',
    nativeCurrency: NATIVE_CURRENCIES[SupportedChainId.MAINNET],
  },
  [SupportedChainId.ARBITRUM_ONE]: {
    docs: 'https://docs.arbitrum.io',
    bridge: 'https://bridge.arbitrum.io',
    explorer: 'https://arbiscan.io',
    infoLink: 'https://arbitrum.io',
    label: 'Arbitrum One',
    addressPrefix: 'arb1',
    name: 'arbitrum_one',
    explorerTitle: 'Arbiscan',
    urlAlias: 'arb1',
    logo: { light: ArbitrumOneLogoLight, dark: ArbitrumOneLogoDark },
    color: '#1B4ADD',
    nativeCurrency: NATIVE_CURRENCIES[SupportedChainId.ARBITRUM_ONE],
  },
  [SupportedChainId.BASE]: {
    docs: 'https://docs.base.org',
    bridge: 'https://bridge.base.org/deposit',
    explorer: 'https://basescan.org',
    infoLink: 'https://www.base.org',
    label: 'Base',
    addressPrefix: 'base',
    name: 'base',
    explorerTitle: 'Basescan',
    urlAlias: 'base',
    logo: { light: BaseLogo, dark: BaseLogo },
    color: '#0052FF',
    nativeCurrency: NATIVE_CURRENCIES[SupportedChainId.BASE],
  },
  [SupportedChainId.GNOSIS_CHAIN]: {
    docs: 'https://docs.gnosischain.com',
    bridge: 'https://bridge.gnosischain.com/',
    explorer: 'https://gnosisscan.io',
    infoLink: 'https://www.gnosischain.com',
    label: 'Gnosis Chain',
    name: 'gnosis_chain',
    addressPrefix: 'gno',
    explorerTitle: 'Gnosisscan',
    urlAlias: 'gc',
    logo: { light: GnosisChainLogo, dark: GnosisChainLogo },
    color: '#07795B',
    nativeCurrency: NATIVE_CURRENCIES[SupportedChainId.GNOSIS_CHAIN],
  },
  [SupportedChainId.SEPOLIA]: {
    docs: 'https://docs.cow.fi',
    explorer: 'https://sepolia.etherscan.io',
    infoLink: 'https://ethereum.org',
    label: 'Sepolia',
    name: 'sepolia',
    addressPrefix: 'sep',
    explorerTitle: 'Etherscan',
    urlAlias: 'sepolia',
    logo: { light: SepoliaLogo, dark: SepoliaLogo },
    color: '#C12FF2',
    nativeCurrency: NATIVE_CURRENCIES[SupportedChainId.SEPOLIA],
  },
  [SupportedChainId.POLYGON]: {
    docs: 'https://docs.polygon.technology',
    explorer: 'https://polygonscan.com',
    infoLink: 'https://polygon.technology',
    label: 'Polygon',
    name: 'polygon',
    addressPrefix: 'matic',
    explorerTitle: 'Polygonscan',
    urlAlias: 'pol',
    logo: { light: PolygonLogo, dark: PolygonLogo },
    color: '#ff0420',
    nativeCurrency: NATIVE_CURRENCIES[SupportedChainId.POLYGON],
  },
  [SupportedChainId.AVALANCHE]: {
    docs: 'https://build.avax.network/docs',
    explorer: 'https://snowtrace.io',
    infoLink: 'https://avax.network',
    label: 'Avalanche',
    name: 'avalanche',
    addressPrefix: 'avax',
    explorerTitle: 'Snowtrace',
    urlAlias: 'avax',
    logo: { light: AvalancheLogo, dark: AvalancheLogo },
    color: '#ff3944',
    nativeCurrency: NATIVE_CURRENCIES[SupportedChainId.AVALANCHE],
  },
}

export const CHAIN_INFO_ARRAY: BaseChainInfo[] = Object.values(CHAIN_INFO)

export function getChainInfo(chainId: SupportedChainId): BaseChainInfo {
  return CHAIN_INFO[chainId]
}
