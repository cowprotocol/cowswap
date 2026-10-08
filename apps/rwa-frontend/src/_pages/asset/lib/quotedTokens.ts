import { areAddressesEqual } from '@cowprotocol/cow-sdk'

import type { RwaAssetQuotes, RwaNetworkStats, RwaToken, RwaTokenNetworkStats, RwaTokenQuote } from '@/entities/asset'

import { toTokenUnits } from '@/shared/lib/format'

/**
 * The order book falls back to routes through nearly empty pools when a solver with deep liquidity doesn't answer, so
 * a $1000 quote can drain a pool and price a share at 10× the stock price
 */
const MAX_STOCK_PRICE_DEVIATION = 0.5

export interface QuotedToken {
  token: RwaToken
  /** `undefined` while quotes are loading */
  quote: RwaTokenQuote | undefined
  /** USD per token: paid on `buy`, received on `sell`. Includes fees */
  pricePerShare: number | null
  /** `pricePerShare` is more than `MAX_STOCK_PRICE_DEVIATION` away from the stock price */
  isPriceOutlier: boolean
  stats: RwaTokenNetworkStats | undefined
}

type RankedQuotedToken = QuotedToken & { pricePerShare: number }

/**
 * The token Auto trades, ranked by the latest quotes on the network. While the quotes of a new side load, those are
 * the previous side's, so the widget keeps its token instead of falling back to the first one
 */
export function getAutoToken(
  chainTokens: RwaToken[],
  chainQuotes: RwaAssetQuotes | undefined,
  stockPrice: number | null,
): RwaToken | null {
  if (!chainQuotes) return null

  return getBestQuotedToken(toQuotedTokens(chainTokens, chainQuotes, undefined, stockPrice), chainQuotes.side)
}

/**
 * The cheapest share to buy, or the most paid one to sell. Verified quotes win over unverified ones, which are ranked
 * only when no quote is verified. `null` when no token has a ranked quote
 */
export function getBestQuotedToken(quotedTokens: QuotedToken[], side: RwaAssetQuotes['side']): RwaToken | null {
  const ranked = quotedTokens.filter(isRankedQuote)
  const verified = ranked.filter(({ quote }) => quote?.verified)
  const [best] = [...(verified.length ? verified : ranked)].sort((a, b) =>
    side === 'buy' ? a.pricePerShare - b.pricePerShare : b.pricePerShare - a.pricePerShare,
  )

  return best?.token ?? null
}

export function isRankedQuote(quoted: QuotedToken): quoted is RankedQuotedToken {
  return quoted.pricePerShare !== null && !quoted.isPriceOutlier
}

/** `stockPrice` is `null` while market data is loading, then no price is an outlier */
export function toQuotedTokens(
  chainTokens: RwaToken[],
  quotes: RwaAssetQuotes | undefined,
  stats: RwaNetworkStats | undefined,
  stockPrice: number | null,
): QuotedToken[] {
  return chainTokens.map((token) => {
    const quote = quotes?.quotes.find(({ address }) => areAddressesEqual(address, token.address))
    const units = quote?.amount ? toTokenUnits(quote.amount, token.decimals) : 0
    const pricePerShare = quotes && units > 0 ? quotes.amountUsd / units : null

    return {
      token,
      quote,
      pricePerShare,
      isPriceOutlier:
        pricePerShare !== null &&
        stockPrice !== null &&
        stockPrice > 0 &&
        Math.abs(pricePerShare / stockPrice - 1) > MAX_STOCK_PRICE_DEVIATION,
      stats: stats?.tokens.find(({ address }) => areAddressesEqual(address, token.address)),
    }
  })
}
