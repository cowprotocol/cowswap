import { type ReactNode, useMemo } from 'react'

import styles from './Portfolio.module.css'

import type { PortfolioFilter } from '../lib/portfolioFilter'
import type { RwaAsset, RwaAssetType } from '@/entities/asset'

import { getChainLabel } from '@/shared/lib/chain'

const ALL = ''

const ASSET_TYPES: { type: RwaAssetType | null; title: string }[] = [
  { type: null, title: 'All' },
  { type: 'stock', title: 'Stocks' },
  { type: 'index', title: 'Index funds' },
]

interface PortfolioFiltersProps {
  assets: RwaAsset[]
  filter: PortfolioFilter
  onChange(filter: PortfolioFilter): void
}

export function PortfolioFilters({ assets, filter, onChange }: PortfolioFiltersProps): ReactNode {
  const tokens = useMemo(() => assets.flatMap((asset) => asset.tokens), [assets])
  const issuers = useMemo(() => [...new Set(tokens.map((token) => token.issuer))].sort(), [tokens])
  const chainIds = useMemo(() => [...new Set(tokens.map((token) => token.chainId))], [tokens])

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
      <select
        aria-label="Issuer"
        value={filter.issuer ?? ALL}
        onChange={(event) => onChange({ ...filter, issuer: event.target.value || null })}
      >
        <option value={ALL}>All issuers</option>
        {issuers.map((issuer) => (
          <option key={issuer} value={issuer}>
            {issuer}
          </option>
        ))}
      </select>
      <select
        aria-label="Network"
        value={filter.chainId === null ? ALL : String(filter.chainId)}
        onChange={(event) => onChange({ ...filter, chainId: event.target.value ? Number(event.target.value) : null })}
      >
        <option value={ALL}>All networks</option>
        {chainIds.map((chainId) => (
          <option key={chainId} value={String(chainId)}>
            {getChainLabel(chainId)}
          </option>
        ))}
      </select>
    </div>
  )
}
