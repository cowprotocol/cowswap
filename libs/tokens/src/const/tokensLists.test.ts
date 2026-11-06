import { SOLANA_RWA_TOKEN_LIST_URL, SOLANA_TOKEN_LIST_URL } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { DEFAULT_TOKENS_LISTS, SOLANA_RWA_TOKENS_LIST_SOURCE } from './tokensLists'

import { getSourceAsKey } from '../hooks/lists/useIsListBlocked'

const RESERVE_BNB_TOKEN_LIST_URL =
  'https://raw.githubusercontent.com/reserve-protocol/dtf-interface/1dbc095c95210f3342278acb8b865763a4d7d443/packages/dtf-catalog/tokenlists/index-dtf/restricted/bnb.tokenlist.json'

/**
 * Geoblocking matches a list by its URL, so the copy shipped in `tokensList.json` and the one the rest of
 * the app imports have to resolve to the same key. If they drift, nothing throws — the list just stops
 * being restricted.
 */
describe('Solana list sources', () => {
  it('ships the same URLs the app imports', () => {
    const sources = (DEFAULT_TOKENS_LISTS[SupportedChainId.SOLANA] || []).map((list) => getSourceAsKey(list.source))

    expect(sources).toContain(getSourceAsKey(SOLANA_TOKEN_LIST_URL))
    expect(sources).toContain(getSourceAsKey(SOLANA_RWA_TOKEN_LIST_URL))
  })

  it('resolves the RWA source to the RWA list, not to a neighbour', () => {
    expect(getSourceAsKey(SOLANA_RWA_TOKENS_LIST_SOURCE)).toBe(getSourceAsKey(SOLANA_RWA_TOKEN_LIST_URL))
  })
})

describe('DEFAULT_TOKENS_LISTS', () => {
  it('includes the Reserve Protocol BNB token list disabled by default', () => {
    const reserveList = DEFAULT_TOKENS_LISTS[SupportedChainId.BNB]?.find(
      (list) => list.source === RESERVE_BNB_TOKEN_LIST_URL,
    )

    expect(reserveList).toEqual(expect.objectContaining({ priority: 6, source: RESERVE_BNB_TOKEN_LIST_URL }))
    expect(reserveList?.enabledByDefault).toBeUndefined()
  })
})
