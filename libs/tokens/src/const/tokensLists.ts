import { mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'

import lpTokensList from './lpTokensList.json'
import tokensList from './tokensList.json'

import { ListSourceConfig, ListsSourcesByNetwork } from '../types'

export const LP_TOKEN_LISTS = lpTokensList as Array<ListSourceConfig>

export const DEFAULT_TOKENS_LISTS: ListsSourcesByNetwork = mapSupportedNetworks(
  (chainId) => tokensList[chainId] as Array<ListSourceConfig>,
)

export const ONDO_TOKENS_LIST_SOURCE = tokensList[SupportedChainId.MAINNET][3].source

export const XSTOCKS_TOKENS_LIST_SOURCE = tokensList[SupportedChainId.MAINNET][4].source

export const SOLANA_RWA_TOKENS_LIST_SOURCE = tokensList[SupportedChainId.SOLANA][1].source

export const RWA_TOKENS_LIST_SOURCES = [
  ONDO_TOKENS_LIST_SOURCE,
  XSTOCKS_TOKENS_LIST_SOURCE,
  SOLANA_RWA_TOKENS_LIST_SOURCE,
] as const
