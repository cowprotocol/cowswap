import type { ReactNode } from 'react'

import styles from './AssetStats.module.css'

import { isUsMarketOpen } from '../lib/usMarketStatus'

import type { RwaAsset, RwaMarketData, RwaTradingTime } from '../model/types'

import { formatPercent, formatUsd } from '@/shared/lib/format'

interface AssetStatsProps {
  asset: RwaAsset
  market: RwaMarketData | null | undefined
}

export function AssetStats({ asset, market }: AssetStatsProps): ReactNode {
  const change = market?.change24h
  const changeClassName = change ? (change > 0 ? styles.positive : styles.negative) : ''

  return (
    <div className={styles.stats}>
      <div className={styles.priceRow}>
        <span className={styles.price}>{formatUsd(market?.price)}</span>
        <span className={styles.change}>
          <span className={changeClassName}>{formatPercent(change)}</span>
          <span className={styles.period}>24H</span>
        </span>
      </div>
      {/* Rendered once market data loads, so a prerendered page doesn't hydrate with the build time status */}
      {market && asset.allowedTradingTime && <MarketStatus tradingTime={asset.allowedTradingTime} />}
    </div>
  )
}

function MarketStatus({ tradingTime }: { tradingTime: RwaTradingTime }): ReactNode {
  const open = isUsMarketOpen(tradingTime, new Date())

  return (
    <span className={styles.status}>
      <span className={open ? styles.statusOpen : styles.statusClosed}>US market {open ? 'open' : 'closed'}</span>
      <span className={styles.hours}>
        · {tradingTime.start} – {tradingTime.end}
      </span>
    </span>
  )
}
