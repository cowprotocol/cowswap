import type { ReactNode } from 'react'

import Link from 'next/link'

import styles from './MarketOverview.module.css'
import { Sparkline, type SparklineTone } from './Sparkline'

import type { RwaMarketOverviewItem } from '@/entities/asset'

import { TokenLogo } from '@/shared/ui/token-logo'

const SKELETON_ROWS = 3

interface OverviewAssetRowsProps {
  /** `undefined` while loading */
  items: RwaMarketOverviewItem[] | undefined
  /** An empty list then means missing data, not a quiet market */
  degraded: boolean
  emptyText: string
  tone: SparklineTone
  valueClassName?: string
  renderValue(item: RwaMarketOverviewItem): ReactNode
}

export function OverviewAssetRows({
  items,
  degraded,
  emptyText,
  tone,
  valueClassName,
  renderValue,
}: OverviewAssetRowsProps): ReactNode {
  if (!items) {
    return (
      <ul className={styles.rows} aria-busy="true">
        {Array.from({ length: SKELETON_ROWS }, (_, index) => (
          <li key={index} className={styles.row}>
            <span className={`${styles.skeleton} ${styles.skeletonLogo}`} />
            <span className={`${styles.skeleton} ${styles.skeletonText}`} />
          </li>
        ))}
      </ul>
    )
  }

  if (!items.length) return <p className={styles.empty}>{degraded ? 'Data temporarily unavailable' : emptyText}</p>

  return (
    <ul className={styles.rows}>
      {items.map((item) => (
        <li key={item.ticker}>
          <Link className={styles.row} href={`/asset/${item.ticker}`}>
            <TokenLogo symbol={item.ticker} logoUrl={item.logoUrl} />
            <span className={styles.asset}>
              <span className={styles.assetTitle}>{item.title}</span>
              <span className={styles.assetTicker}>{item.ticker}</span>
            </span>
            <span className={[styles.rowValue, valueClassName].filter(Boolean).join(' ')}>{renderValue(item)}</span>
            <span className={styles.rowSparkline}>
              <Sparkline series={item.series} tone={tone} />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
