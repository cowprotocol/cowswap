import {
  arbitrumOne,
  avalanche,
  base,
  bnb,
  ChainInfo,
  gnosisChain,
  lens,
  linea,
  mainnet,
  plasma,
  polygon,
  sepolia,
  SupportedChainId,
} from '@cowprotocol/cow-sdk'

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
  readonly eip155Label: string
  readonly urlAlias: string
  readonly helpCenterUrl?: string
  readonly explorerTitle: string
  readonly color: string
  readonly nativeCurrency: TokenWithLogo
}

export type ChainInfoMap = Record<SupportedChainId, BaseChainInfo>

function mapChainInfoToBaseChainInfo(
  chainInfo: ChainInfo,
): Pick<
  BaseChainInfo,
  | 'docs'
  | 'bridge'
  | 'explorer'
  | 'infoLink'
  | 'logo'
  | 'addressPrefix'
  | 'label'
  | 'explorerTitle'
  | 'color'
  | 'eip155Label'
> {
  // TODO: temporary hack to point to the new logos for Linea and Plasma while the SDK PR is not merged
  const logo =
    chainInfo.logo && (chainInfo.id === SupportedChainId.LINEA || chainInfo.id === SupportedChainId.PLASMA)
      ? {
          light: chainInfo.logo.light.replace('\/main\/', '/feat/q4-chains/'),
          dark: chainInfo.logo.dark.replace('\/main\/', '/feat/q4-chains/'),
        }
      : chainInfo.logo
  return {
    docs: chainInfo.docs.url,
    bridge: chainInfo.bridges?.[0]?.url,
    explorer: chainInfo.blockExplorer.url ?? '',
    infoLink: chainInfo.website.url,
    logo,
    addressPrefix: chainInfo.addressPrefix,
    label: chainInfo.label,
    explorerTitle: chainInfo.blockExplorer.name,
    color: chainInfo.color,
    eip155Label: chainInfo.eip155Label,
  }
}

/**
 * Map with chain information for supported networks.
 * Ordered by relevance, first is most relevant.
 * Keep in mind when iterating over this map that the order of keys is guaranteed to be numerically sorted.
 * So this order is mostly for reference and not for iteration.
 */
export const CHAIN_INFO: ChainInfoMap = {
  [SupportedChainId.MAINNET]: {
    ...mapChainInfoToBaseChainInfo(mainnet),
    name: 'ethereum',
    urlAlias: '',
    nativeCurrency: NATIVE_CURRENCIES[SupportedChainId.MAINNET],
  },
  [SupportedChainId.BNB]: {
    ...mapChainInfoToBaseChainInfo(bnb),
    name: 'bnb',
    urlAlias: 'bnb',
    nativeCurrency: NATIVE_CURRENCIES[SupportedChainId.BNB],
  },
  [SupportedChainId.BASE]: {
    ...mapChainInfoToBaseChainInfo(base),
    name: 'base',
    urlAlias: 'base',
    nativeCurrency: NATIVE_CURRENCIES[SupportedChainId.BASE],
  },
  [SupportedChainId.ARBITRUM_ONE]: {
    ...mapChainInfoToBaseChainInfo(arbitrumOne),
    name: 'arbitrum_one',
    urlAlias: 'arb1',
    nativeCurrency: NATIVE_CURRENCIES[SupportedChainId.ARBITRUM_ONE],
  },
  [SupportedChainId.POLYGON]: {
    ...mapChainInfoToBaseChainInfo(polygon),
    name: 'polygon',
    urlAlias: 'pol',
    nativeCurrency: NATIVE_CURRENCIES[SupportedChainId.POLYGON],
  },
  [SupportedChainId.AVALANCHE]: {
    ...mapChainInfoToBaseChainInfo(avalanche),
    name: 'avalanche',
    urlAlias: 'avax',
    nativeCurrency: NATIVE_CURRENCIES[SupportedChainId.AVALANCHE],
  },
  [SupportedChainId.GNOSIS_CHAIN]: {
    ...mapChainInfoToBaseChainInfo(gnosisChain),
    name: 'gnosis_chain',
    urlAlias: 'gc',
    nativeCurrency: NATIVE_CURRENCIES[SupportedChainId.GNOSIS_CHAIN],
  },
  [SupportedChainId.LENS]: {
    ...mapChainInfoToBaseChainInfo(lens),
    name: 'lens',
    urlAlias: 'lens',
    nativeCurrency: NATIVE_CURRENCIES[SupportedChainId.LENS],
  },
  [SupportedChainId.LINEA]: {
    ...mapChainInfoToBaseChainInfo(linea),
    name: 'linea',
    urlAlias: 'linea',
    nativeCurrency: NATIVE_CURRENCIES[SupportedChainId.LINEA],
  },
  [SupportedChainId.PLASMA]: {
    ...mapChainInfoToBaseChainInfo(plasma),
    name: 'plasma',
    urlAlias: 'plasma',
    nativeCurrency: NATIVE_CURRENCIES[SupportedChainId.PLASMA],
  },
  [SupportedChainId.SEPOLIA]: {
    ...mapChainInfoToBaseChainInfo(sepolia),
    name: 'sepolia',
    urlAlias: 'sepolia',
    nativeCurrency: NATIVE_CURRENCIES[SupportedChainId.SEPOLIA],
  },
}

/**
 * Sorted array of chain IDs in order of relevance.
 */
export const SORTED_CHAIN_IDS: SupportedChainId[] = [
  SupportedChainId.MAINNET,
  SupportedChainId.BNB,
  SupportedChainId.BASE,
  SupportedChainId.ARBITRUM_ONE,
  SupportedChainId.POLYGON,
  SupportedChainId.AVALANCHE,
  SupportedChainId.LINEA, // TODO: decide where to place Linea
  SupportedChainId.PLASMA, // TODO: decide where to place Plasma
  SupportedChainId.GNOSIS_CHAIN,
  SupportedChainId.LENS,
  SupportedChainId.SEPOLIA,
]

export const CHAIN_INFO_ARRAY: BaseChainInfo[] = SORTED_CHAIN_IDS.map((id) => CHAIN_INFO[id])

export function getChainInfo(chainId: SupportedChainId): BaseChainInfo {
  return CHAIN_INFO[chainId]
}
