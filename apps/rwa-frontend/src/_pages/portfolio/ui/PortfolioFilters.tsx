import { type ReactNode, useMemo } from 'react'

import styles from './Portfolio.module.css'

import { isPortfolioFiltered, NO_PORTFOLIO_FILTER, type PortfolioFilter } from '../lib/portfolioFilter'

import type { RwaAssetSummary } from '@/entities/asset'

import { useNetworkOptions } from '@/shared/ui/network-logos'
import { ResetFiltersButton } from '@/shared/ui/reset-filters-button'
import { Select } from '@/shared/ui/select'

interface PortfolioFiltersProps {
  assets: RwaAssetSummary[]
  filter: PortfolioFilter
  onChange(filter: PortfolioFilter): void
}

export function PortfolioFilters({ assets, filter, onChange }: PortfolioFiltersProps): ReactNode {
  const tokens = useMemo(() => assets.flatMap((asset) => asset.tokens), [assets])
  const issuers = useMemo(() => [...new Set(tokens.map((token) => token.issuer))].sort(), [tokens])
  const chainIds = useMemo(() => [...new Set(tokens.map((token) => token.chainId))], [tokens])
  const networkOptions = useNetworkOptions(chainIds)

  return (
    <div className={styles.filters}>
      <Select
        aria-label="Issuer"
        value={filter.issuer}
        options={[
          { value: null, label: 'All issuers' },
          ...issuers.map((issuer) => ({ value: issuer, label: issuer })),
        ]}
        onChange={(issuer) => onChange({ ...filter, issuer })}
      />
      <Select
        aria-label="Network"
        value={filter.chainId}
        options={[{ value: null, label: 'All networks' }, ...networkOptions]}
        onChange={(chainId) => onChange({ ...filter, chainId })}
      />
      {isPortfolioFiltered(filter) && <ResetFiltersButton onClick={() => onChange(NO_PORTFOLIO_FILTER)} />}
    </div>
  )
}
