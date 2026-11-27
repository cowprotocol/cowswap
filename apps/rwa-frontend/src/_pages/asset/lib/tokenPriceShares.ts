import { getTokenKey, type RwaToken } from '@/entities/asset'

/**
 * Shares per token to divide a token's CoinGecko price by, keyed by `getTokenKey`. A CoinGecko price is shared by every
 * network of its id, so a token whose multiplier differs from another token of the same id (wrapped xStocks vaults) is
 * left out, and its price stays per token
 */
export function getTokenPriceSharesPerToken(
  tokens: RwaToken[],
  sharesPerToken: Record<string, number>,
): Record<string, number> {
  const multipliersById = new Map<string, Set<number | undefined>>()

  for (const token of tokens) {
    if (!token.coingeckoId) continue

    const multipliers = multipliersById.get(token.coingeckoId) ?? new Set()

    multipliers.add(sharesPerToken[getTokenKey(token)])
    multipliersById.set(token.coingeckoId, multipliers)
  }

  return Object.fromEntries(
    tokens.flatMap((token) => {
      const key = getTokenKey(token)
      const multiplier = sharesPerToken[key]
      const isShared = !token.coingeckoId || multipliersById.get(token.coingeckoId)?.size === 1

      return multiplier !== undefined && isShared ? [[key, multiplier] as const] : []
    }),
  )
}
