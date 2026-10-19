import type { RwaAsset, RwaMarketData } from '../model/types'

/** Logo of the first token with a `coingeckoId`, the reference one for price and chart */
export function getReferenceLogoUrl(asset: RwaAsset, market: RwaMarketData | null | undefined): string | null {
  const referenceId = asset.tokens.find((token) => token.coingeckoId)?.coingeckoId

  return referenceId ? (market?.tokens[referenceId]?.logoUrl ?? null) : null
}
