import type { RwaTokenSummary } from '@/entities/asset'

export interface PortfolioFilter {
  /** `null` for all issuers */
  issuer: string | null
  /** `null` for all networks */
  chainId: number | null
}

export const NO_PORTFOLIO_FILTER: PortfolioFilter = { issuer: null, chainId: null }

export function matchesPortfolioFilter(filter: PortfolioFilter, token: RwaTokenSummary): boolean {
  return (
    (filter.issuer === null || token.issuer === filter.issuer) &&
    (filter.chainId === null || token.chainId === filter.chainId)
  )
}
