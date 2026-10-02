import type { ReactNode } from 'react'

import styles from './AssetStats.module.css'

import type { RwaAsset, RwaMarketData } from '../model/types'

import { formatCompactUsd, formatPercent, formatRange, formatUsd } from '@/shared/lib/format'

interface AssetStatsProps {
  asset: RwaAsset
  market: RwaMarketData | null | undefined
}

export function AssetStats({ asset, market }: AssetStatsProps): ReactNode {
  const { allowedTradingTime } = asset
  const change = market?.change24h
  const changeClassName = change ? (change > 0 ? styles.positive : styles.negative) : ''

  return (
    <div className={styles.stats}>
      <div className={styles.priceRow}>
        <span className={styles.price}>{formatUsd(market?.price)}</span>
        <span className={changeClassName}>{formatPercent(change)} (24h)</span>
      </div>
      <dl className={styles.grid}>
        <div>
          <dt>Day range</dt>
          <dd>{formatRange(market?.dayLow, market?.dayHigh)}</dd>
        </div>
        <div>
          <dt>Tokenized market cap</dt>
          <dd>{formatCompactUsd(market?.marketCap)}</dd>
        </div>
        {allowedTradingTime && (
          <div>
            <dt>{allowedTradingTime.title}</dt>
            <dd>
              {allowedTradingTime.start} – {allowedTradingTime.end}
            </dd>
          </div>
        )}
      </dl>
    </div>
  )
}
