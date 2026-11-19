import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { DEFAULT_TOKENS_LISTS } from '@cowprotocol/tokens/lists'

import { getTradeTokenLists } from './tradeTokenLists'

describe('getTradeTokenLists', () => {
  it.each([SupportedChainId.MAINNET, SupportedChainId.ARBITRUM_ONE, SupportedChainId.BASE])(
    'adds the RWA lists to the other lists of chain %s',
    (chainId) => {
      const lists = DEFAULT_TOKENS_LISTS[chainId] || []
      const rwaLists = lists.filter((list) => list.category === 'RWA').map((list) => list.source)

      expect(rwaLists.length).toBeGreaterThan(0)
      expect(getTradeTokenLists(chainId)).toEqual(expect.arrayContaining(rwaLists))
      expect(getTradeTokenLists(chainId)).toHaveLength(lists.length)
    },
  )
})
