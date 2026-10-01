import { areAddressesEqual } from '@cowprotocol/cow-sdk'

import type { RwaAssetQuotes, RwaNetworkStats, RwaToken, RwaTokenNetworkStats, RwaTokenQuote } from '@/entities/asset'

import { toTokenUnits } from '@/shared/lib/format'

export interface QuotedToken {
  token: RwaToken
  /** `undefined` while quotes are loading */
  quote: RwaTokenQuote | undefined
  /** USD per token: paid on `buy`, received on `sell`. Includes fees */
  pricePerShare: number | null
  stats: RwaTokenNetworkStats | undefined
}

/**
 * The token Auto trades, ranked by the latest quotes on the network. While the quotes of a new side load, those are
 * the previous side's, so the widget keeps its token instead of falling back to the first one
 */
export function getAutoToken(chainTokens: RwaToken[], chainQuotes: RwaAssetQuotes | undefined): RwaToken | null {
  if (!chainQuotes) return null

  return getBestQuotedToken(toQuotedTokens(chainTokens, chainQuotes, undefined), chainQuotes.side)
}

/**
 * The cheapest share to buy, or the most paid one to sell. Unverified quotes are skipped: identical requests have
 * returned amounts an order of magnitude apart. `null` when no token has a verified quote
 */
export function getBestQuotedToken(quotedTokens: QuotedToken[], side: RwaAssetQuotes['side']): RwaToken | null {
  const priced = quotedTokens.filter(
    (quoted): quoted is QuotedToken & { pricePerShare: number } =>
      quoted.pricePerShare !== null && quoted.quote?.verified === true,
  )
  const [best] = [...priced].sort((a, b) =>
    side === 'buy' ? a.pricePerShare - b.pricePerShare : b.pricePerShare - a.pricePerShare,
  )

  return best?.token ?? null
}

export function toQuotedTokens(
  chainTokens: RwaToken[],
  quotes: RwaAssetQuotes | undefined,
  stats: RwaNetworkStats | undefined,
): QuotedToken[] {
  return chainTokens.map((token) => {
    const quote = quotes?.quotes.find(({ address }) => areAddressesEqual(address, token.address))
    const units = quote?.amount ? toTokenUnits(quote.amount, token.decimals) : 0

    return {
      token,
      quote,
      pricePerShare: quotes && units > 0 ? quotes.amountUsd / units : null,
      stats: stats?.tokens.find(({ address }) => areAddressesEqual(address, token.address)),
    }
  })
}
