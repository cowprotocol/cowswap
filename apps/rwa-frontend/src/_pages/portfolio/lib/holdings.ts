import type { Position } from '@/widgets/account'

import { getTokenKey, type RwaAssetSummary, type RwaTokenSummary } from '@/entities/asset'
import { toTokenUnits } from '@/shared/lib/format'

export interface Holding {
  asset: RwaAssetSummary
  /** USD per share, `null` while market data is loading or unknown */
  price: number | null
  tokens: TokenHolding[]
  /** Sum of `tokens` shares */
  shares: number
  /** USD, `null` without a price */
  value: number | null
}

export interface PortfolioTotals {
  /** USD, sum of the holdings with a price. `null` when no holding has one */
  value: number | null
  assets: number
  tokens: number
  networks: number
  /** Held assets left out of `value` because they have no price */
  unpricedAssets: number
}

export interface TokenHolding {
  token: RwaTokenSummary
  /** Atoms, decimal string */
  balance: string
  /** One token is one share of the underlying asset */
  shares: number
  /** USD, `null` without a price */
  value: number | null
}

/** Holdings ordered by value, the unpriced ones last */
export function buildHoldings(
  assets: RwaAssetSummary[],
  positions: Position[],
  getPrice: (asset: RwaAssetSummary) => number | null,
): Holding[] {
  const positionsByKey = new Map(positions.map((position) => [getTokenKey(position.token), position]))

  return assets
    .flatMap((asset): Holding[] => {
      const tokens = asset.tokens.flatMap((token) => positionsByKey.get(getTokenKey(token)) ?? [])

      if (!tokens.length) return []

      const price = getPrice(asset)
      const tokenHoldings = tokens.map(({ token, balance }) => {
        const shares = toTokenUnits(balance, token.decimals)

        return { token, balance, shares, value: price === null ? null : shares * price }
      })
      const shares = tokenHoldings.reduce((sum, holding) => sum + holding.shares, 0)

      return [{ asset, price, tokens: tokenHoldings, shares, value: price === null ? null : shares * price }]
    })
    .sort((a, b) => (b.value ?? -1) - (a.value ?? -1))
}

export function getPortfolioTotals(holdings: Holding[]): PortfolioTotals {
  const tokens = holdings.flatMap((holding) => holding.tokens)
  const priced = holdings.filter((holding) => holding.value !== null)

  return {
    value: priced.length ? priced.reduce((sum, holding) => sum + (holding.value ?? 0), 0) : null,
    assets: holdings.length,
    tokens: tokens.length,
    networks: new Set(tokens.map(({ token }) => token.chainId)).size,
    unpricedAssets: holdings.length - priced.length,
  }
}
