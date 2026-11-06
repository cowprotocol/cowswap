import { getAssetSeoDescription, getAssetSeoTitle, getAssetSeoTokensLabel } from './assetSeo'
import { AAPLX_ARBITRUM, AAPLX_MAINNET } from './fixtures'

import type { RwaAsset, RwaToken } from '@/entities/asset'

const AAPLON_MAINNET: RwaToken = { ...AAPLX_MAINNET, symbol: 'AAPLon', issuer: 'Ondo' }

const AAPL: RwaAsset = {
  ticker: 'AAPL',
  coingeckoId: 'apple',
  title: 'Apple',
  type: 'stock',
  priority: 10,
  tokens: [AAPLX_MAINNET],
}

describe('getAssetSeoTitle', () => {
  it('names the asset type', () => {
    expect(getAssetSeoTitle(AAPL)).toBe('Apple (AAPL) tokenized stock')
    expect(getAssetSeoTitle({ ...AAPL, ticker: 'SPY', title: 'S&P 500', type: 'index' })).toBe(
      'S&P 500 (SPY) tokenized ETF',
    )
  })
})

describe('getAssetSeoTokensLabel', () => {
  it('lists a single issuer and network', () => {
    expect(getAssetSeoTokensLabel(AAPL)).toBe('xStocks token on Ethereum')
  })

  it('lists every issuer and network once', () => {
    const asset = { ...AAPL, tokens: [AAPLX_MAINNET, AAPLON_MAINNET, AAPLX_ARBITRUM] }

    expect(getAssetSeoTokensLabel(asset)).toBe('xStocks and Ondo tokens on Ethereum and Arbitrum')
  })

  it('counts the networks past the first three', () => {
    const tokens = [1, 42161, 8453, 56, 100].map((chainId) => ({ ...AAPLX_MAINNET, chainId }))

    expect(getAssetSeoTokensLabel({ ...AAPL, tokens })).toMatch(
      /^xStocks token on [^,]+, [^,]+, .+ and 2 more networks$/,
    )
  })
})

describe('getAssetSeoDescription', () => {
  it('describes the asset and its tokens', () => {
    expect(getAssetSeoDescription(AAPL)).toBe(
      'Third-party tokens referencing Apple (AAPL) stock, with swaps powered by CoW Protocol: xStocks token on Ethereum.',
    )
  })
})
