import type { Position } from '@/widgets/account'

import {
  getDividendModel,
  getTokenKey,
  getTokenUsdPrice,
  type RwaAssetSummary,
  type RwaTokenSummary,
} from '@/entities/asset'
import { toTokenUnits } from '@/shared/lib/format'

export interface Holding {
  asset: RwaAssetSummary
  /** USD per share, `null` while market data is loading or unknown */
  price: number | null
  tokens: TokenHolding[]
  /** Sum of `tokens` shares */
  shares: number
  /** USD, sum of `tokens` values. `null` while any of them has no price */
  value: number | null
}

export interface HoldingPrices {
  /** USD per share of the underlying */
  getAssetPrice(asset: RwaAssetSummary): number | null
  /** USD per token */
  getTokenPrice(token: RwaTokenSummary): number | null
  /** Shares of the underlying one token stands for, from the issuer */
  getSharesPerToken(token: RwaTokenSummary): number | null
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
  /** Shares of the underlying the token represents */
  shares: number
  /** USD, `null` without a price */
  value: number | null
}

/** Holdings ordered by value, the unpriced ones last */
export function buildHoldings(assets: RwaAssetSummary[], positions: Position[], prices: HoldingPrices): Holding[] {
  const positionsByKey = new Map(positions.map((position) => [getTokenKey(position.token), position]))

  return assets
    .flatMap((asset): Holding[] => {
      const tokens = asset.tokens.flatMap((token) => positionsByKey.get(getTokenKey(token)) ?? [])

      if (!tokens.length) return []

      const price = prices.getAssetPrice(asset)
      const tokenHoldings = tokens.map(({ token, balance }) =>
        toTokenHolding(token, balance, prices.getTokenPrice(token), price, prices.getSharesPerToken(token)),
      )
      const shares = tokenHoldings.reduce((sum, holding) => sum + holding.shares, 0)
      const value = tokenHoldings.every((holding) => holding.value !== null)
        ? tokenHoldings.reduce((sum, holding) => sum + (holding.value ?? 0), 0)
        : null

      return [{ asset, price, tokens: tokenHoldings, shares, value }]
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

/** A price-accrual token carries its multiplier in its price, so without the issuer's one the price ratio stands in */
function estimateSharesPerToken(token: RwaTokenSummary, tokenPrice: number | null, assetPrice: number | null): number {
  return getDividendModel(token) === 'price-accrual' && tokenPrice !== null && assetPrice !== null && assetPrice > 0
    ? tokenPrice / assetPrice
    : 1
}

function toTokenHolding(
  token: RwaTokenSummary,
  balance: string,
  tokenPrice: number | null,
  assetPrice: number | null,
  sharesPerToken: number | null,
): TokenHolding {
  const units = toTokenUnits(balance, token.decimals)
  const price = getTokenUsdPrice(tokenPrice, assetPrice, sharesPerToken)
  const value = price === null ? null : units * price
  const shares = units * (sharesPerToken ?? estimateSharesPerToken(token, tokenPrice, assetPrice))

  return { token, balance, shares, value }
}
