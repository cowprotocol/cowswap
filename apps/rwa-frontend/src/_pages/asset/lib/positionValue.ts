import { getTokenKey, type RwaMarketData, type RwaToken } from '@/entities/asset'
import { toTokenUnits } from '@/shared/lib/format'

/**
 * USD at the token price, or at the stock price of the shares the token stands for when it has none.
 * `null` without either
 */
export function getPositionValue(
  token: RwaToken,
  balance: string,
  market: RwaMarketData | null | undefined,
): number | null {
  const price = market ? getTokenPrice(token, market) : null

  return price === null ? null : toTokenUnits(balance, token.decimals) * price
}

function getTokenPrice(token: RwaToken, market: RwaMarketData): number | null {
  const tokenPrice = token.coingeckoId ? market.tokens[token.coingeckoId]?.price : null

  return tokenPrice ?? (market.price === null ? null : market.price * (market.sharesPerToken[getTokenKey(token)] ?? 1))
}
