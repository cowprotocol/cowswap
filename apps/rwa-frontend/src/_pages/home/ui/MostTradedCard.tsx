import type { ReactNode } from 'react'

import styles from './MarketOverview.module.css'
import { OverviewAssetRows } from './OverviewAssetRows'

import type { RwaMarketOverviewItem } from '@/entities/asset'

import { formatCompactUsd } from '@/shared/lib/format'

interface MostTradedCardProps {
  /** `undefined` while loading */
  items: RwaMarketOverviewItem[] | undefined
  degraded: boolean
}

export function MostTradedCard({ items, degraded }: MostTradedCardProps): ReactNode {
  return (
    <section className={styles.card} aria-labelledby="most-traded-title">
      <header className={styles.cardHeader}>
        <div>
          <h2 id="most-traded-title" className={styles.cardTitle}>
            Most traded
          </h2>
          <p className={styles.cardSubtitle}>24h DEX volume · All networks</p>
        </div>
      </header>
      <OverviewAssetRows
        items={items}
        degraded={degraded}
        emptyText="No DEX trades in the last 24 hours"
        tone="neutral"
        renderValue={(item) => formatCompactUsd(item.dexVolume24h)}
      />
    </section>
  )
}
