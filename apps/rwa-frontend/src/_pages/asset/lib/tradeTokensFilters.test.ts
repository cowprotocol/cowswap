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

const AAPL_DINARI_MAINNET: RwaToken = {
  ...AAPLX_MAINNET,
  address: '0x0000000000000000000000000000000000000a01',
  symbol: 'AAPL',
  issuer: 'Dinari',
}

const AAPL_ROBINHOOD: RwaToken = {
  ...AAPLX_MAINNET,
  address: '0x0000000000000000000000000000000000000a02',
  symbol: 'AAPL',
  issuer: 'Robinhood',
}

const AAPLX_UPPERCASE: RwaToken = {
  ...AAPLX_ARBITRUM,
  address: '0x0000000000000000000000000000000000000a03',
  symbol: 'AAPLX',
}

const ASSET_TOKENS = [AAPLX_MAINNET.address, AAPLON_MAINNET.address, AAPLX_ARBITRUM.address]
const AAPLX_TOKENS = [AAPLX_MAINNET.address, AAPLX_ARBITRUM.address]

describe('getTradeTokensFilters', () => {
  it('buys the asset tokens of any network with any token held but the bought one', () => {
    const { sellTokensFilter, buyTokensFilter } = getTradeTokensFilters(AAPL, AAPLX_MAINNET, 'buy', true)

    expect(sellTokensFilter).toEqual({
      excludedTokens: AAPLX_TOKENS,
      onlyWithBalance: true,
      notice: expect.stringContaining('positive balance in your wallet'),
    })
    expect(buyTokensFilter?.tokens).toEqual(ASSET_TOKENS)
    expect(buyTokensFilter?.selectableChainIds).toEqual([AAPLX_MAINNET.chainId, AAPLX_ARBITRUM.chainId])
    expect(buyTokensFilter?.onlyWithBalance).toBeUndefined()
    expect(buyTokensFilter?.notice).toContain('AAPL')
  })

  it('sells the asset tokens held on any of its networks for any token but the sold one', () => {
    const { sellTokensFilter, buyTokensFilter } = getTradeTokensFilters(AAPL, AAPLX_ARBITRUM, 'sell', true)

    expect(sellTokensFilter).toEqual({
      tokens: ASSET_TOKENS,
      onlyWithBalance: true,
      selectableChainIds: [AAPLX_MAINNET.chainId, AAPLX_ARBITRUM.chainId],
      notice: expect.stringContaining('AAPL'),
    })
    expect(buyTokensFilter).toEqual({ excludedTokens: AAPLX_TOKENS })
  })

  it("trades an issuer's token for another issuer's token of the asset", () => {
    const sellFilters = getTradeTokensFilters(AAPL, AAPLX_MAINNET, 'sell', true)
    const buyFilters = getTradeTokensFilters(AAPL, AAPLON_MAINNET, 'buy', true)

    expect(sellFilters.buyTokensFilter?.excludedTokens).not.toContain(AAPLON_MAINNET.address)
    expect(buyFilters.sellTokensFilter?.excludedTokens).toEqual([AAPLON_MAINNET.address])
  })

  it('sells only the selected asset token without a wallet', () => {
    const { sellTokensFilter } = getTradeTokensFilters(AAPL, AAPLON_MAINNET, 'sell', false)

    expect(sellTokensFilter).toEqual({
      tokens: [AAPLON_MAINNET.address],
      selectableChainIds: [AAPLON_MAINNET.chainId],
      notice: expect.stringContaining('AAPLon'),
    })
  })

  it('sells the selected asset token on each of its networks without a wallet', () => {
    const { sellTokensFilter } = getTradeTokensFilters(AAPL, AAPLX_MAINNET, 'sell', false)

    expect(sellTokensFilter?.tokens).toEqual([AAPLX_MAINNET.address, AAPLX_ARBITRUM.address])
    expect(sellTokensFilter?.selectableChainIds).toEqual([AAPLX_MAINNET.chainId, AAPLX_ARBITRUM.chainId])
  })

  it('does not mention the wallet when it is not connected', () => {
    const buyFilters = getTradeTokensFilters(AAPL, AAPLX_MAINNET, 'buy', false)
    const sellFilters = getTradeTokensFilters(AAPL, AAPLX_MAINNET, 'sell', false)

    expect(buyFilters.sellTokensFilter?.notice).toBeUndefined()
    expect(sellFilters.sellTokensFilter?.notice).not.toContain('wallet')
  })

  it('tells the tokens apart by issuer, whatever the symbol casing', () => {
    const asset: RwaAsset = { ...AAPL, tokens: [AAPLX_MAINNET, AAPLX_UPPERCASE, AAPL_DINARI_MAINNET, AAPL_ROBINHOOD] }

    expect(getTradeTokensFilters(asset, AAPL_DINARI_MAINNET, 'sell', true).buyTokensFilter).toEqual({
      excludedTokens: [AAPL_DINARI_MAINNET.address],
    })
    expect(getTradeTokensFilters(asset, AAPLX_MAINNET, 'sell', true).buyTokensFilter).toEqual({
      excludedTokens: [AAPLX_MAINNET.address, AAPLX_UPPERCASE.address],
    })
  })
})
