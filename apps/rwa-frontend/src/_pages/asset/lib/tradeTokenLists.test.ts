import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { DEFAULT_TOKENS_LISTS } from '@cowprotocol/tokens/lists'

import { COW_SWAP_TOKENS_LIST, getTradeTokenLists } from './tradeTokenLists'

describe('getTradeTokenLists', () => {
  it.each([SupportedChainId.MAINNET, SupportedChainId.ARBITRUM_ONE, SupportedChainId.BASE])(
    'passes only the CoW Swap and RWA lists of chain %s',
    (chainId) => {
      const lists = DEFAULT_TOKENS_LISTS[chainId] || []
      const rwaLists = lists.filter((list) => list.category === 'RWA').map((list) => list.source)

      expect(rwaLists.length).toBeGreaterThan(0)
      expect(getTradeTokenLists(chainId)).toEqual([COW_SWAP_TOKENS_LIST, ...rwaLists])
    },
  )

  it('leaves out the lists that are off by default, such as Curve', () => {
    expect(getTradeTokenLists(SupportedChainId.MAINNET)).not.toContain(
      'https://curvefi.github.io/curve-assets/ethereum.json',
    )
  })
})
