import type { RwaMarketData, RwaToken } from '@/entities/asset'

import { toTokenUnits } from '@/shared/lib/format'

/** USD at the token price, or at the stock price when the token has none. `null` without either */
export function getPositionValue(
  token: RwaToken,
  balance: string,
  market: RwaMarketData | null | undefined,
): number | null {
  const tokenPrice = token.coingeckoId ? market?.tokens[token.coingeckoId]?.price : null
  const price = tokenPrice ?? market?.price ?? null

  return price === null ? null : toTokenUnits(balance, token.decimals) * price
}
