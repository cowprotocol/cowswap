import { AAPLX_ARBITRUM, AAPLX_MAINNET } from './fixtures'
import { getAutoToken, getBestQuotedToken, sortQuotedTokens, toQuotedTokens } from './quotedTokens'

import type { RwaAssetQuotes, RwaToken } from '@/entities/asset'

const AAPLON_MAINNET: RwaToken = {
  ...AAPLX_MAINNET,
  address: '0x14c3abF95Cb9C93a8b82C1CdCB76D72Cb87b2d4c',
  symbol: 'AAPLon',
  issuer: 'Ondo',
}
const CHAIN_TOKENS = [AAPLX_MAINNET, AAPLON_MAINNET]

function quotes(
  side: RwaAssetQuotes['side'],
  aaplxAmount: string | null,
  aaplonAmount: string | null,
  verifiedQuotes: 'all' | 'aaplx' | 'none' = 'all',
): RwaAssetQuotes {
  return {
    ticker: 'AAPL',
    chainId: 1,
    side,
    amountUsd: 1000,
    quotes: [
      {
        address: AAPLX_MAINNET.address.toLowerCase(),
        amount: aaplxAmount,
        verified: aaplxAmount !== null && verifiedQuotes !== 'none',
        error: aaplxAmount ? null : 'NoLiquidity',
      },
      { address: AAPLON_MAINNET.address, amount: aaplonAmount, verified: verifiedQuotes === 'all', error: null },
    ],
    degraded: false,
  }
}

describe('toQuotedTokens', () => {
  it('converts quoted amounts into a USD price per share', () => {
    const [aaplx, aaplon] = toQuotedTokens(CHAIN_TOKENS, quotes('buy', '4000000000000000000', null), undefined, null)

    expect(aaplx?.pricePerShare).toBe(250)
    expect(aaplx?.quote?.error).toBeNull()
    expect(aaplon?.pricePerShare).toBeNull()
  })

  it('has no prices while quotes are loading', () => {
    expect(toQuotedTokens(CHAIN_TOKENS, undefined, undefined, null).map(({ pricePerShare }) => pricePerShare)).toEqual([
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

    expect(toQuotedTokens(CHAIN_TOKENS, undefined, stats, null).map((quoted) => quoted.stats?.onchainCap)).toEqual([
      undefined,
      5,
    ])
  })
})

describe('getBestQuotedToken', () => {
  it('picks the cheapest share to buy', () => {
    const quoted = toQuotedTokens(
      CHAIN_TOKENS,
      quotes('buy', '4000000000000000000', '5000000000000000000'),
      undefined,
      null,
    )

    expect(getBestQuotedToken(quoted, 'buy')).toBe(AAPLON_MAINNET)
  })

  it('picks the most paid share to sell', () => {
    const quoted = toQuotedTokens(
      CHAIN_TOKENS,
      quotes('sell', '4000000000000000000', '5000000000000000000'),
      undefined,
      null,
    )

    expect(getBestQuotedToken(quoted, 'sell')).toBe(AAPLX_MAINNET)
  })

  it('picks the only quoted token', () => {
    const quoted = toQuotedTokens(CHAIN_TOKENS, quotes('buy', null, '5000000000000000000'), undefined, null)

    expect(getBestQuotedToken(quoted, 'buy')).toBe(AAPLON_MAINNET)
  })

  it('returns null without quotes', () => {
    expect(getBestQuotedToken(toQuotedTokens([AAPLX_ARBITRUM], undefined, undefined, null), 'buy')).toBeNull()
  })

  it('skips an unverified quote even when it is cheaper', () => {
    const quoted = toQuotedTokens(
      CHAIN_TOKENS,
      quotes('buy', '4000000000000000000', '50000000000000000000', 'aaplx'),
      undefined,
      null,
    )

    expect(getBestQuotedToken(quoted, 'buy')).toBe(AAPLX_MAINNET)
  })

  it('ranks unverified quotes when no quote is verified', () => {
    const quoted = toQuotedTokens(
      CHAIN_TOKENS,
      quotes('buy', '4000000000000000000', '5000000000000000000', 'none'),
      undefined,
      null,
    )

    expect(getBestQuotedToken(quoted, 'buy')).toBe(AAPLON_MAINNET)
  })

  it('skips a price far from the stock price', () => {
    // $1000 for 0.32 shares is $3125 a share, against a $230 stock price
    const quoted = toQuotedTokens(
      CHAIN_TOKENS,
      quotes('sell', '4000000000000000000', '320000000000000000'),
      undefined,
      230,
    )

    expect(quoted.map(({ isPriceOutlier }) => isPriceOutlier)).toEqual([false, true])
    expect(getBestQuotedToken(quoted, 'sell')).toBe(AAPLX_MAINNET)
  })
})

describe('sortQuotedTokens', () => {
  const AAPLB_MAINNET: RwaToken = {
    ...AAPLX_MAINNET,
    address: '0x0000000000000000000000000000000000000aab',
    symbol: 'AAPLb',
    issuer: 'Backed',
  }

  function symbols(quoted: ReturnType<typeof toQuotedTokens>): string[] {
    return quoted.map(({ token }) => token.symbol)
  }

  it('puts the cheapest share to buy first', () => {
    const quoted = toQuotedTokens(
      CHAIN_TOKENS,
      quotes('buy', '4000000000000000000', '5000000000000000000'),
      undefined,
      null,
    )

    expect(symbols(sortQuotedTokens(quoted, 'buy'))).toEqual(['AAPLon', 'AAPLx'])
  })

  it('puts the most paid share to sell first', () => {
    const quoted = toQuotedTokens(
      CHAIN_TOKENS,
      quotes('sell', '5000000000000000000', '4000000000000000000'),
      undefined,
      null,
    )

    expect(symbols(sortQuotedTokens(quoted, 'sell'))).toEqual(['AAPLon', 'AAPLx'])
  })

  it('puts verified quotes before cheaper unverified ones', () => {
    const quoted = toQuotedTokens(
      CHAIN_TOKENS,
      quotes('buy', '4000000000000000000', '50000000000000000000', 'aaplx'),
      undefined,
      null,
    )

    expect(symbols(sortQuotedTokens(quoted, 'buy'))).toEqual(['AAPLx', 'AAPLon'])
  })

  it('puts tokens without a ranked quote last, in their original order', () => {
    const quoted = toQuotedTokens(
      [AAPLB_MAINNET, ...CHAIN_TOKENS],
      quotes('buy', null, '5000000000000000000'),
      undefined,
      null,
    )

    expect(symbols(sortQuotedTokens(quoted, 'buy'))).toEqual(['AAPLon', 'AAPLb', 'AAPLx'])
  })

  it('puts a price far from the stock price after ranked quotes', () => {
    const quoted = toQuotedTokens(
      CHAIN_TOKENS,
      quotes('sell', '320000000000000000', '4000000000000000000'),
      undefined,
      230,
    )

    expect(symbols(sortQuotedTokens(quoted, 'sell'))).toEqual(['AAPLon', 'AAPLx'])
  })

  it('keeps the original order while quotes are loading', () => {
    expect(symbols(sortQuotedTokens(toQuotedTokens(CHAIN_TOKENS, undefined, undefined, null), 'buy'))).toEqual([
      'AAPLx',
      'AAPLon',
    ])
  })
})

describe('getAutoToken', () => {
  it('ranks the quotes by their own side, so the previous side keeps its token while the new side loads', () => {
    const sellQuotes = quotes('sell', '4000000000000000000', '5000000000000000000')

    expect(getAutoToken(CHAIN_TOKENS, sellQuotes, null)).toBe(AAPLX_MAINNET)
    expect(getAutoToken(CHAIN_TOKENS, { ...sellQuotes, side: 'buy' }, null)).toBe(AAPLON_MAINNET)
  })

  it('returns null without quotes on the network', () => {
    expect(getAutoToken(CHAIN_TOKENS, undefined, null)).toBeNull()
  })
})
