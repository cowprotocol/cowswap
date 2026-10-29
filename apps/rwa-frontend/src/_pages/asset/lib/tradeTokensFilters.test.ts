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

const ASSET_TOKENS = [AAPLX_MAINNET.address, AAPLON_MAINNET.address, AAPLX_ARBITRUM.address]

describe('getTradeTokensFilters', () => {
  it('buys the asset tokens of any network with any other token held', () => {
    const { sellTokensFilter, buyTokensFilter } = getTradeTokensFilters(AAPL, AAPLX_MAINNET, 'buy', true)

    expect(sellTokensFilter).toEqual({
      excludedTokens: ASSET_TOKENS,
      onlyWithBalance: true,
      notice: expect.stringContaining('positive balance in your wallet'),
    })
    expect(buyTokensFilter?.tokens).toEqual(ASSET_TOKENS)
    expect(buyTokensFilter?.onlyWithBalance).toBeUndefined()
    expect(buyTokensFilter?.notice).toContain('AAPL')
  })

  it('sells the asset tokens held on the network for any other token', () => {
    const { sellTokensFilter, buyTokensFilter } = getTradeTokensFilters(AAPL, AAPLX_ARBITRUM, 'sell', true)

    expect(sellTokensFilter).toEqual({
      tokens: [AAPLX_ARBITRUM.address],
      onlyWithBalance: true,
      notice: expect.stringContaining('AAPL'),
    })
    expect(buyTokensFilter).toEqual({ excludedTokens: ASSET_TOKENS })
  })

  it('sells only the selected asset token without a wallet', () => {
    const { sellTokensFilter } = getTradeTokensFilters(AAPL, AAPLON_MAINNET, 'sell', false)

    expect(sellTokensFilter).toEqual({ tokens: [AAPLON_MAINNET.address], notice: expect.stringContaining('AAPLon') })
  })

  it('does not mention the wallet when it is not connected', () => {
    const buyFilters = getTradeTokensFilters(AAPL, AAPLX_MAINNET, 'buy', false)
    const sellFilters = getTradeTokensFilters(AAPL, AAPLX_MAINNET, 'sell', false)

    expect(buyFilters.sellTokensFilter?.notice).toBeUndefined()
    expect(sellFilters.sellTokensFilter?.notice).not.toContain('wallet')
  })
})
