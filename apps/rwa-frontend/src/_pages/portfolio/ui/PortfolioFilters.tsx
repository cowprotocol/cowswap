import { type ReactNode, useMemo } from 'react'

import styles from './Portfolio.module.css'

import type { PortfolioFilter } from '../lib/portfolioFilter'
import type { RwaAssetSummary, RwaAssetType } from '@/entities/asset'

import { useNetworkOptions } from '@/shared/ui/network-logos'
import { Select } from '@/shared/ui/select'

const ASSET_TYPES: { type: RwaAssetType | null; title: string }[] = [
  { type: null, title: 'All' },
  { type: 'stock', title: 'Stocks' },
  { type: 'index', title: 'Index funds' },
]

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
      <div className={styles.pills} role="group" aria-label="Asset type">
        {ASSET_TYPES.map(({ type, title }) => (
          <button
            key={title}
            type="button"
            aria-pressed={filter.assetType === type}
            className={filter.assetType === type ? styles.activePill : undefined}
            onClick={() => onChange({ ...filter, assetType: type })}
          >
            {title}
          </button>
        ))}
      </div>
      <Select
        variant="small"
        aria-label="Issuer"
        value={filter.issuer}
        options={[
          { value: null, label: 'All issuers' },
          ...issuers.map((issuer) => ({ value: issuer, label: issuer })),
        ]}
        onChange={(issuer) => onChange({ ...filter, issuer })}
      />
      <Select
        variant="small"
        aria-label="Network"
        value={filter.chainId}
        options={[{ value: null, label: 'All networks' }, ...networkOptions]}
        onChange={(chainId) => onChange({ ...filter, chainId })}
      />
    </div>
  )
}
