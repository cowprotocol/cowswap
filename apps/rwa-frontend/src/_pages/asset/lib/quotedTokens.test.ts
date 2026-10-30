import { AAPLX_ARBITRUM, AAPLX_MAINNET } from './fixtures'
import {
  getAutoToken,
  getBestQuotedToken,
  getBestQuoteLabel,
  getCollapsedQuotedTokens,
  keepPreviousOrder,
  type QuotedToken,
  sortQuotedTokens,
  toQuotedTokens,
} from './quotedTokens'

import { getTokenKey, type RwaAssetQuotes, type RwaToken } from '@/entities/asset'

const AAPLON_MAINNET: RwaToken = {
  ...AAPLX_MAINNET,
  address: '0x14c3abF95Cb9C93a8b82C1CdCB76D72Cb87b2d4c',
  symbol: 'AAPLon',
  issuer: 'Ondo',
}
const CHAIN_TOKENS = [AAPLX_MAINNET, AAPLON_MAINNET]
const NO_SHARES: Record<string, number> = {}

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
    const [aaplx, aaplon] = toQuotedTokens(
      CHAIN_TOKENS,
      quotes('buy', '4000000000000000000', null),
      undefined,
      null,
      NO_SHARES,
    )

    expect(aaplx?.pricePerShare).toBe(250)
    expect(aaplx?.quote?.error).toBeNull()
    expect(aaplon?.pricePerShare).toBeNull()
  })

  it('has no prices while quotes are loading', () => {
    expect(
      toQuotedTokens(CHAIN_TOKENS, undefined, undefined, null, NO_SHARES).map(({ pricePerShare }) => pricePerShare),
    ).toEqual([null, null])
  })

  it('matches stats by address', () => {
    const stats = {
      ticker: 'AAPL',
      chainId: 1,
      tokens: [{ address: AAPLON_MAINNET.address.toLowerCase(), onchainCap: 5, dexVolume24h: 1 }],
      degraded: false,
    }

    expect(
      toQuotedTokens(CHAIN_TOKENS, undefined, stats, null, NO_SHARES).map((quoted) => quoted.stats?.onchainCap),
    ).toEqual([undefined, 5])
  })
})

describe('getBestQuotedToken', () => {
  it('picks the cheapest share to buy', () => {
    const quoted = toQuotedTokens(
      CHAIN_TOKENS,
      quotes('buy', '4000000000000000000', '5000000000000000000'),
      undefined,
      null,
      NO_SHARES,
    )

    expect(getBestQuotedToken(quoted, 'buy')).toBe(AAPLON_MAINNET)
  })

  it('picks the most paid share to sell', () => {
    const quoted = toQuotedTokens(
      CHAIN_TOKENS,
      quotes('sell', '4000000000000000000', '5000000000000000000'),
      undefined,
      null,
      NO_SHARES,
    )

    expect(getBestQuotedToken(quoted, 'sell')).toBe(AAPLX_MAINNET)
  })

  it('picks the only quoted token', () => {
    const quoted = toQuotedTokens(CHAIN_TOKENS, quotes('buy', null, '5000000000000000000'), undefined, null, NO_SHARES)

    expect(getBestQuotedToken(quoted, 'buy')).toBe(AAPLON_MAINNET)
  })

  it('returns null without quotes', () => {
    expect(
      getBestQuotedToken(toQuotedTokens([AAPLX_ARBITRUM], undefined, undefined, null, NO_SHARES), 'buy'),
    ).toBeNull()
  })

  it('skips an unverified quote even when it is cheaper', () => {
    const quoted = toQuotedTokens(
      CHAIN_TOKENS,
      quotes('buy', '4000000000000000000', '50000000000000000000', 'aaplx'),
      undefined,
      null,
      NO_SHARES,
    )

    expect(getBestQuotedToken(quoted, 'buy')).toBe(AAPLX_MAINNET)
  })

  it('ranks unverified quotes when no quote is verified', () => {
    const quoted = toQuotedTokens(
      CHAIN_TOKENS,
      quotes('buy', '4000000000000000000', '5000000000000000000', 'none'),
      undefined,
      null,
      NO_SHARES,
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
      NO_SHARES,
    )

    expect(quoted.map(({ isPriceOutlier }) => isPriceOutlier)).toEqual([false, true])
    expect(getBestQuotedToken(quoted, 'sell')).toBe(AAPLX_MAINNET)
  })
})

describe('getCollapsedQuotedTokens', () => {
  const quoted = toQuotedTokens([AAPLX_MAINNET, AAPLON_MAINNET, AAPLX_ARBITRUM], undefined, undefined, null, NO_SHARES)
  const tokensOf = (list: QuotedToken[]): RwaToken[] => list.map(({ token }) => token)

  it('keeps the first tokens', () => {
    expect(tokensOf(getCollapsedQuotedTokens(quoted, AAPLX_MAINNET, 2))).toEqual([AAPLX_MAINNET, AAPLON_MAINNET])
  })

  it('keeps a selected token past them', () => {
    expect(tokensOf(getCollapsedQuotedTokens(quoted, AAPLX_ARBITRUM, 1))).toEqual([AAPLX_MAINNET, AAPLX_ARBITRUM])
  })
})

describe('getBestQuoteLabel', () => {
  it('names the best quote by side', () => {
    expect(getBestQuoteLabel('buy', false)).toBe('Lowest price')
    expect(getBestQuoteLabel('sell', false)).toBe('Highest price')
  })

  it('limits the claim to verified quotes when cheaper unverified ones can be listed', () => {
    expect(getBestQuoteLabel('buy', true)).toBe('Lowest verified price')
    expect(getBestQuoteLabel('sell', true)).toBe('Highest verified price')
  })
})

describe('per-share pricing', () => {
  it('divides the price of a token by the shares it stands for', () => {
    const sharesPerToken = { [getTokenKey(AAPLON_MAINNET)]: 1.25 }
    const [aaplx, aaplon] = toQuotedTokens(
      CHAIN_TOKENS,
      quotes('buy', '4000000000000000000', '4000000000000000000'),
      undefined,
      null,
      sharesPerToken,
    )

    expect(aaplx?.pricePerShare).toBe(250)
    expect(aaplon?.pricePerShare).toBe(200)
    expect(aaplon?.sharesPerToken).toBe(1.25)
    expect(aaplx?.sharesPerToken).toBeNull()
  })

  it('ranks a token that stands for 10 shares by its price per share, not as an outlier', () => {
    // 0.4 tokens of 10 shares each: $250 a share, against a $230 stock price
    const quoted = toQuotedTokens(
      CHAIN_TOKENS,
      quotes('buy', '4500000000000000000', '400000000000000000'),
      undefined,
      230,
      { [getTokenKey(AAPLON_MAINNET)]: 10 },
    )

    expect(quoted.map(({ isPriceOutlier }) => isPriceOutlier)).toEqual([false, false])
    expect(getBestQuotedToken(quoted, 'buy')).toBe(AAPLX_MAINNET)
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
      NO_SHARES,
    )

    expect(symbols(sortQuotedTokens(quoted, 'buy'))).toEqual(['AAPLon', 'AAPLx'])
  })

  it('puts the most paid share to sell first', () => {
    const quoted = toQuotedTokens(
      CHAIN_TOKENS,
      quotes('sell', '5000000000000000000', '4000000000000000000'),
      undefined,
      null,
      NO_SHARES,
    )

    expect(symbols(sortQuotedTokens(quoted, 'sell'))).toEqual(['AAPLon', 'AAPLx'])
  })

  it('puts verified quotes before cheaper unverified ones', () => {
    const quoted = toQuotedTokens(
      CHAIN_TOKENS,
      quotes('buy', '4000000000000000000', '50000000000000000000', 'aaplx'),
      undefined,
      null,
      NO_SHARES,
    )

    expect(symbols(sortQuotedTokens(quoted, 'buy'))).toEqual(['AAPLx', 'AAPLon'])
  })

  it('puts tokens without a ranked quote last, in their original order', () => {
    const quoted = toQuotedTokens(
      [AAPLB_MAINNET, ...CHAIN_TOKENS],
      quotes('buy', null, '5000000000000000000'),
      undefined,
      null,
      NO_SHARES,
    )

    expect(symbols(sortQuotedTokens(quoted, 'buy'))).toEqual(['AAPLon', 'AAPLb', 'AAPLx'])
  })

  it('puts a price far from the stock price after ranked quotes', () => {
    const quoted = toQuotedTokens(
      CHAIN_TOKENS,
      quotes('sell', '320000000000000000', '4000000000000000000'),
      undefined,
      230,
      NO_SHARES,
    )

    expect(symbols(sortQuotedTokens(quoted, 'sell'))).toEqual(['AAPLon', 'AAPLx'])
  })

  it('keeps the original order while quotes are loading', () => {
    expect(
      symbols(sortQuotedTokens(toQuotedTokens(CHAIN_TOKENS, undefined, undefined, null, NO_SHARES), 'buy')),
    ).toEqual(['AAPLx', 'AAPLon'])
  })
})

describe('keepPreviousOrder', () => {
  const AAPLB_MAINNET: RwaToken = {
    ...AAPLX_MAINNET,
    address: '0x0000000000000000000000000000000000000aab',
    symbol: 'AAPLb',
    issuer: 'Backed',
  }

  function quoted(token: RwaToken, pricePerShare: number | null): QuotedToken {
    return {
      token,
      quote: { address: token.address, amount: '1', verified: true, error: null },
      pricePerShare,
      sharesPerToken: null,
      isPriceOutlier: false,
      stats: undefined,
    }
  }

  function order(...tokens: RwaToken[]): string[] {
    return tokens.map(getTokenKey)
  }

  function symbols(quotedTokens: QuotedToken[]): string[] {
    return quotedTokens.map(({ token }) => token.symbol)
  }

  it('keeps the previous order when a refresh swaps only tokens after the best one', () => {
    const sorted = sortQuotedTokens(
      [quoted(AAPLON_MAINNET, 100), quoted(AAPLX_MAINNET, 102), quoted(AAPLB_MAINNET, 101)],
      'buy',
    )

    expect(symbols(sorted)).toEqual(['AAPLon', 'AAPLb', 'AAPLx'])
    expect(symbols(keepPreviousOrder(sorted, order(AAPLON_MAINNET, AAPLX_MAINNET, AAPLB_MAINNET)))).toEqual([
      'AAPLon',
      'AAPLx',
      'AAPLb',
    ])
  })

  it('re-sorts when the best token changes', () => {
    const sorted = sortQuotedTokens(
      [quoted(AAPLON_MAINNET, 100), quoted(AAPLX_MAINNET, 99), quoted(AAPLB_MAINNET, 101)],
      'buy',
    )

    expect(symbols(keepPreviousOrder(sorted, order(AAPLON_MAINNET, AAPLB_MAINNET, AAPLX_MAINNET)))).toEqual([
      'AAPLx',
      'AAPLon',
      'AAPLb',
    ])
  })

  it('re-sorts when a token loses its ranked quote', () => {
    const sorted = sortQuotedTokens(
      [quoted(AAPLON_MAINNET, 100), quoted(AAPLX_MAINNET, 102), quoted(AAPLB_MAINNET, null)],
      'buy',
    )

    expect(symbols(keepPreviousOrder(sorted, order(AAPLON_MAINNET, AAPLB_MAINNET, AAPLX_MAINNET)))).toEqual([
      'AAPLon',
      'AAPLx',
      'AAPLb',
    ])
  })

  it('returns the sorted tokens without a previous order or when the tokens changed', () => {
    const sorted = sortQuotedTokens([quoted(AAPLON_MAINNET, 100), quoted(AAPLX_MAINNET, 102)], 'buy')

    expect(keepPreviousOrder(sorted, null)).toBe(sorted)
    expect(keepPreviousOrder(sorted, order(AAPLX_MAINNET, AAPLB_MAINNET))).toBe(sorted)
  })
})

describe('getAutoToken', () => {
  it('ranks the quotes by their own side, so the previous side keeps its token while the new side loads', () => {
    const sellQuotes = quotes('sell', '4000000000000000000', '5000000000000000000')

    expect(getAutoToken(CHAIN_TOKENS, sellQuotes, null, NO_SHARES)).toBe(AAPLX_MAINNET)
    expect(getAutoToken(CHAIN_TOKENS, { ...sellQuotes, side: 'buy' }, null, NO_SHARES)).toBe(AAPLON_MAINNET)
  })

  it('returns null without quotes on the network', () => {
    expect(getAutoToken(CHAIN_TOKENS, undefined, null, NO_SHARES)).toBeNull()
  })
})
