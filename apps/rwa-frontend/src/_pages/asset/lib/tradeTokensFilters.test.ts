import { AAPLX_ARBITRUM, AAPLX_MAINNET } from './fixtures'
import { getTradeTokensFilters } from './tradeTokensFilters'

import type { RwaAsset, RwaToken } from '@/entities/asset'

const AAPLON_MAINNET: RwaToken = {
  ...AAPLX_MAINNET,
  address: '0x14C3abF95Cb9C93a8b82C1CdCB76D72Cb87b2d4c',
  symbol: 'AAPLon',
  issuer: 'Ondo',
}

const AAPL: RwaAsset = {
  ticker: 'AAPL',
  coingeckoId: 'apple',
  title: 'Apple',
  type: 'stock',
  priority: 10,
  tokens: [AAPLX_MAINNET, AAPLON_MAINNET, AAPLX_ARBITRUM],
}

describe('getTradeTokensFilters', () => {
  it('buys the asset tokens of the network with any token held', () => {
    const { sellTokensFilter, buyTokensFilter } = getTradeTokensFilters(AAPL, 1, 'buy')

    expect(sellTokensFilter).toEqual({ onlyWithBalance: true, notice: expect.stringContaining('your wallet') })
    expect(buyTokensFilter?.tokens).toEqual([AAPLX_MAINNET.address, AAPLON_MAINNET.address])
    expect(buyTokensFilter?.onlyWithBalance).toBeUndefined()
    expect(buyTokensFilter?.notice).toContain('AAPL')
  })

  it('sells the asset tokens held on the network for any token', () => {
    const { sellTokensFilter, buyTokensFilter } = getTradeTokensFilters(AAPL, 42161, 'sell')

    expect(sellTokensFilter).toEqual({
      tokens: [AAPLX_ARBITRUM.address],
      onlyWithBalance: true,
      notice: expect.stringContaining('AAPL'),
    })
    expect(buyTokensFilter).toBeUndefined()
  })
})
