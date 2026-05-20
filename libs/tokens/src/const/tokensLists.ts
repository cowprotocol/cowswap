import { mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'

import lpTokensList from './lpTokensList.json'
import tokensList from './tokensList.json'

import { ListSourceConfig, ListsSourcesByNetwork } from '../types'

export const LP_TOKEN_LISTS = lpTokensList as Array<ListSourceConfig>

// `tokensList.json` doesn't have a Solana entry yet — fall back to an empty array per chain
// when the chainId isn't represented in the JSON.
const tokensListByChainId = tokensList as Record<string, Array<ListSourceConfig>>
export const DEFAULT_TOKENS_LISTS: ListsSourcesByNetwork = mapSupportedNetworks(
  (chainId) => tokensListByChainId[String(chainId)] ?? [],
)

export const UNISWAP_TOKENS_LIST = 'https://ipfs.io/ipns/tokens.uniswap.org'

export const ONDO_TOKENS_LIST_SOURCE = tokensList[SupportedChainId.MAINNET][3].source

export const XSTOCKS_TOKENS_LIST_SOURCE = tokensList[SupportedChainId.MAINNET][4].source

export const RWA_TOKENS_LIST_SOURCES = [ONDO_TOKENS_LIST_SOURCE, XSTOCKS_TOKENS_LIST_SOURCE] as const
