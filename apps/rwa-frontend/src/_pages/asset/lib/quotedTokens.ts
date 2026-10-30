import { areAddressesEqual } from '@cowprotocol/cow-sdk'

import {
  getTokenKey,
  type RwaAssetQuotes,
  type RwaNetworkStats,
  type RwaToken,
  type RwaTokenNetworkStats,
  type RwaTokenQuote,
} from '@/entities/asset'
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
  /** USD per share of the underlying: paid on `buy`, received on `sell`. Includes fees. Per token without `sharesPerToken` */
  pricePerShare: number | null
  /** Shares of the underlying one token stands for, from the issuer */
  sharesPerToken: number | null
  /** `pricePerShare` is more than `MAX_STOCK_PRICE_DEVIATION` away from the stock price */
  isPriceOutlier: boolean
  stats: RwaTokenNetworkStats | undefined
}

type RankedQuotedToken = QuotedToken & { pricePerShare: number }

const BEST_QUOTE_LABELS: Record<RwaAssetQuotes['side'], string> = {
  buy: 'Lowest price',
  sell: 'Highest price',
}

const BEST_VERIFIED_QUOTE_LABELS: Record<RwaAssetQuotes['side'], string> = {
  buy: 'Lowest verified price',
  sell: 'Highest verified price',
}

/**
 * The token Auto trades, ranked by the latest quotes on the network. While the quotes of a new side load, those are
 * the previous side's, so the widget keeps its token instead of falling back to the first one
 */
export function getAutoToken(
  chainTokens: RwaToken[],
  chainQuotes: RwaAssetQuotes | undefined,
  stockPrice: number | null,
  sharesPerToken: Record<string, number>,
): RwaToken | null {
  if (!chainQuotes) return null

  return getBestQuotedToken(
    toQuotedTokens(chainTokens, chainQuotes, undefined, stockPrice, sharesPerToken),
    chainQuotes.side,
  )
}

/**
 * The cheapest share to buy, or the most paid one to sell. Verified quotes win over unverified ones, which are ranked
 * only when no quote is verified. `null` when no token has a ranked quote
 */
export function getBestQuotedToken(quotedTokens: QuotedToken[], side: RwaAssetQuotes['side']): RwaToken | null {
  const [best] = sortQuotedTokens(quotedTokens, side)

  return best && isRankedQuote(best) ? best.token : null
}

/**
 * Label of the `getBestQuotedToken` quote. With a verified quote, cheaper unverified quotes are still listed below it,
 * so the label must not claim the best price of all
 */
export function getBestQuoteLabel(side: RwaAssetQuotes['side'], hasVerifiedQuote: boolean): string {
  return (hasVerifiedQuote ? BEST_VERIFIED_QUOTE_LABELS : BEST_QUOTE_LABELS)[side]
}

/** Tokens of a collapsed list: the first `count` and the selected one */
export function getCollapsedQuotedTokens(
  quotedTokens: QuotedToken[],
  selectedToken: RwaToken | undefined,
  count: number,
): QuotedToken[] {
  return quotedTokens.filter((quoted, index) => index < count || quoted.token === selectedToken)
}

export function isRankedQuote(quoted: QuotedToken): quoted is RankedQuotedToken {
  return quoted.pricePerShare !== null && !quoted.isPriceOutlier
}

/**
 * `sorted` in its `previousOrder` of token keys when the refresh moves no token to another tier and keeps the best one,
 * so tokens with close quotes don't swap rows under the cursor on every refresh
 */
export function keepPreviousOrder(sorted: QuotedToken[], previousOrder: string[] | null): QuotedToken[] {
  if (!previousOrder) return sorted

  const byKey = new Map(sorted.map((quoted) => [getTokenKey(quoted.token), quoted]))
  const previous = previousOrder.flatMap((key) => byKey.get(key) ?? [])
  const isSameRanking =
    previous.length === sorted.length &&
    previous[0] === sorted[0] &&
    previous.every((quoted, index) => {
      const current = sorted[index]

      return current !== undefined && getQuoteTier(quoted) === getQuoteTier(current)
    })

  return isSameRanking ? previous : sorted
}

/**
 * The best quote first: verified quotes by price, then unverified ones by price, then tokens without a ranked quote in
 * their original order
 */
export function sortQuotedTokens(quotedTokens: QuotedToken[], side: RwaAssetQuotes['side']): QuotedToken[] {
  return [...quotedTokens].sort((a, b) => {
    const tierDiff = getQuoteTier(a) - getQuoteTier(b)

    if (tierDiff !== 0 || !isRankedQuote(a) || !isRankedQuote(b)) return tierDiff

    return side === 'buy' ? a.pricePerShare - b.pricePerShare : b.pricePerShare - a.pricePerShare
  })
}

/**
 * `stockPrice` is `null` while market data is loading, then no price is an outlier.
 * `sharesPerToken` is `RwaMarketData.sharesPerToken`
 */
export function toQuotedTokens(
  chainTokens: RwaToken[],
  quotes: RwaAssetQuotes | undefined,
  stats: RwaNetworkStats | undefined,
  stockPrice: number | null,
  sharesPerToken: Record<string, number>,
): QuotedToken[] {
  return chainTokens.map((token) => {
    const quote = quotes?.quotes.find(({ address }) => areAddressesEqual(address, token.address))
    const tokenSharesPerToken = sharesPerToken[getTokenKey(token)] ?? null
    const pricePerShare = quotes && quote ? getPricePerShare(token, quotes.amountUsd, quote, tokenSharesPerToken) : null

    return {
      token,
      quote,
      pricePerShare,
      sharesPerToken: tokenSharesPerToken,
      isPriceOutlier:
        pricePerShare !== null &&
        stockPrice !== null &&
        stockPrice > 0 &&
        Math.abs(pricePerShare / stockPrice - 1) > MAX_STOCK_PRICE_DEVIATION,
      stats: stats?.tokens.find(({ address }) => areAddressesEqual(address, token.address)),
    }
  })
}

function getPricePerShare(
  token: RwaToken,
  amountUsd: number,
  quote: RwaTokenQuote,
  sharesPerToken: number | null,
): number | null {
  const shares = quote.amount ? toTokenUnits(quote.amount, token.decimals) * (sharesPerToken ?? 1) : 0

  return shares > 0 ? amountUsd / shares : null
}

function getQuoteTier(quoted: QuotedToken): number {
  if (!isRankedQuote(quoted)) return 2

  return quoted.quote?.verified ? 0 : 1
}
