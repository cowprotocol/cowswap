import { getTokenKey, getTokenUsdPrice, type RwaMarketData, type RwaToken } from '@/entities/asset'
import { toTokenUnits } from '@/shared/lib/format'

/** USD at `getTokenUsdPrice`. `null` without any price */
export function getPositionValue(
  token: RwaToken,
  balance: string,
  market: RwaMarketData | null | undefined,
): number | null {
  if (!market) return null

  const tokenPrice = (token.coingeckoId ? market.tokens[token.coingeckoId]?.price : null) ?? null
  const price = getTokenUsdPrice(tokenPrice, market.price, market.sharesPerToken[getTokenKey(token)] ?? null)

  return price === null ? null : toTokenUnits(balance, token.decimals) * price
}
