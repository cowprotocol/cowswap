import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { DEFAULT_TOKENS_LISTS } from '../../const/tokensLists'
import { ListSourceConfig, TokenListsByChainState } from '../../types'

export interface MissingRwaList {
  chainId: SupportedChainId
  list: ListSourceConfig
}

/**
 * The shipped RWA lists that have no tokens in stored state: never fetched for their chain, or stored as
 * `'deleted'` by a build that did not yet keep removed RWA lists.
 */
export function getMissingRwaLists(listsStatesByChain: Partial<TokenListsByChainState>): MissingRwaList[] {
  return Object.entries(DEFAULT_TOKENS_LISTS).flatMap(([chainIdStr, lists]) => {
    const chainId = Number(chainIdStr) as SupportedChainId
    const chainState = listsStatesByChain[chainId]

    return (lists || [])
      .filter((list) => list.category === 'RWA')
      .filter((list) => {
        const stored = chainState?.[list.source]

        return !stored || stored === 'deleted'
      })
      .map((list) => ({ chainId, list }))
  })
}
