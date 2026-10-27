import { AAPLX_ARBITRUM, AAPLX_MAINNET } from './fixtures'
import { getAutoToken, getBestQuotedToken, toQuotedTokens } from './quotedTokens'

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
