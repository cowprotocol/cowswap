import { AAPLX_ARBITRUM, AAPLX_MAINNET } from './fixtures'
import { getBestQuotedToken, toQuotedTokens } from './quotedTokens'

import type { RwaAssetQuotes, RwaToken } from '@/entities/asset'

const AAPLON_MAINNET: RwaToken = {
  ...AAPLX_MAINNET,
  address: '0x14c3abF95Cb9C93a8b82C1CdCB76D72Cb87b2d4c',
  symbol: 'AAPLon',
  issuer: 'Ondo',
}
const CHAIN_TOKENS = [AAPLX_MAINNET, AAPLON_MAINNET]

function quotes(side: RwaAssetQuotes['side'], aaplxAmount: string | null, aaplonAmount: string | null): RwaAssetQuotes {
  return {
    ticker: 'AAPL',
    chainId: 1,
    side,
    amountUsd: 1000,
    quotes: [
      { address: AAPLX_MAINNET.address.toLowerCase(), amount: aaplxAmount, error: aaplxAmount ? null : 'NoLiquidity' },
      { address: AAPLON_MAINNET.address, amount: aaplonAmount, error: null },
    ],
    degraded: false,
  }
}

describe('toQuotedTokens', () => {
  it('converts quoted amounts into a USD price per share', () => {
    const [aaplx, aaplon] = toQuotedTokens(CHAIN_TOKENS, quotes('buy', '4000000000000000000', null), undefined)

    expect(aaplx?.pricePerShare).toBe(250)
    expect(aaplx?.quote?.error).toBeNull()
    expect(aaplon?.pricePerShare).toBeNull()
  })

  it('has no prices while quotes are loading', () => {
    expect(toQuotedTokens(CHAIN_TOKENS, undefined, undefined).map(({ pricePerShare }) => pricePerShare)).toEqual([
      null,
      null,
    ])
  })

  it('matches stats by address', () => {
    const stats = {
      ticker: 'AAPL',
      chainId: 1,
      tokens: [{ address: AAPLON_MAINNET.address.toLowerCase(), onchainCap: 5, dexVolume24h: 1 }],
      degraded: false,
    }

    expect(toQuotedTokens(CHAIN_TOKENS, undefined, stats).map((quoted) => quoted.stats?.onchainCap)).toEqual([
      undefined,
      5,
    ])
  })
})

describe('getBestQuotedToken', () => {
  it('picks the cheapest share to buy', () => {
    const quoted = toQuotedTokens(CHAIN_TOKENS, quotes('buy', '4000000000000000000', '5000000000000000000'), undefined)

    expect(getBestQuotedToken(quoted, 'buy')).toBe(AAPLON_MAINNET)
  })

  it('picks the most paid share to sell', () => {
    const quoted = toQuotedTokens(CHAIN_TOKENS, quotes('sell', '4000000000000000000', '5000000000000000000'), undefined)

    expect(getBestQuotedToken(quoted, 'sell')).toBe(AAPLX_MAINNET)
  })

  it('picks the only quoted token', () => {
    const quoted = toQuotedTokens(CHAIN_TOKENS, quotes('buy', null, '5000000000000000000'), undefined)

    expect(getBestQuotedToken(quoted, 'buy')).toBe(AAPLON_MAINNET)
  })

  it('returns null without quotes', () => {
    expect(getBestQuotedToken(toQuotedTokens([AAPLX_ARBITRUM], undefined, undefined), 'buy')).toBeNull()
  })
})
