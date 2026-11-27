import { mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'

import lpTokensList from './lpTokensList.json'
import tokensList from './tokensList.json'

import { ListSourceConfig, ListsSourcesByNetwork } from '../types'
import { getSourceAsKey } from '../utils/getSourceAsKey'

export const LP_TOKEN_LISTS = lpTokensList as Array<ListSourceConfig>

export const DEFAULT_TOKENS_LISTS: ListsSourcesByNetwork = mapSupportedNetworks(
  (chainId) => tokensList[chainId] as Array<ListSourceConfig>,
)

/**
 * Looked up by category rather than by index: the entries are hand-edited JSON, and an index silently
 * points at a different list the moment one is added or removed above it.
 */
export const RWA_TOKENS_LIST_SOURCES: readonly string[] = Object.values(DEFAULT_TOKENS_LISTS).flatMap((lists) =>
  (lists || []).filter((list) => list.category === 'RWA').map((list) => list.source),
)

export const SOLANA_RWA_TOKENS_LIST_SOURCE = (DEFAULT_TOKENS_LISTS[SupportedChainId.SOLANA] || []).filter(
  (list) => list.category === 'RWA',
)[0].source

const RWA_TOKENS_LIST_KEYS = new Set(RWA_TOKENS_LIST_SOURCES.map(getSourceAsKey))

export function isRwaTokenListSource(source: string): boolean {
  return RWA_TOKENS_LIST_KEYS.has(getSourceAsKey(source))
}
