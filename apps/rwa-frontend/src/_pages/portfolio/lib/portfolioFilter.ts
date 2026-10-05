import type { RwaAssetSummary, RwaAssetType, RwaTokenSummary } from '@/entities/asset'

export interface PortfolioFilter {
  /** `null` for all asset types */
  assetType: RwaAssetType | null
  /** `null` for all issuers */
  issuer: string | null
  /** `null` for all networks */
  chainId: number | null
}

export const NO_PORTFOLIO_FILTER: PortfolioFilter = { assetType: null, issuer: null, chainId: null }

export function matchesPortfolioFilter(
  filter: PortfolioFilter,
  asset: RwaAssetSummary,
  token: RwaTokenSummary,
): boolean {
  return (
    (filter.assetType === null || asset.type === filter.assetType) &&
    (filter.issuer === null || token.issuer === filter.issuer) &&
    (filter.chainId === null || token.chainId === filter.chainId)
  )
}
