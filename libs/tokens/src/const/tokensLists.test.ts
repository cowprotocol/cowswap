import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { DEFAULT_TOKENS_LISTS } from './tokensLists'

const RESERVE_BNB_TOKEN_LIST_URL =
  'https://raw.githubusercontent.com/reserve-protocol/dtf-interface/1dbc095c95210f3342278acb8b865763a4d7d443/packages/dtf-catalog/tokenlists/index-dtf/restricted/bnb.tokenlist.json'

describe('DEFAULT_TOKENS_LISTS', () => {
  it('includes the Reserve Protocol BNB token list disabled by default', () => {
    const reserveList = DEFAULT_TOKENS_LISTS[SupportedChainId.BNB]?.find(
      (list) => list.source === RESERVE_BNB_TOKEN_LIST_URL,
    )

    expect(reserveList).toEqual(expect.objectContaining({ priority: 6, source: RESERVE_BNB_TOKEN_LIST_URL }))
    expect(reserveList?.enabledByDefault).toBeUndefined()
  })
})
