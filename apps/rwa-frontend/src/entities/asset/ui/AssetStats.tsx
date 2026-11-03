import type { ReactNode } from 'react'

import styles from './AssetStats.module.css'

import { getMinutesToUsMarketChange, isUsMarketOpen } from '../lib/usMarketStatus'

import type { RwaAsset, RwaMarketData, RwaTradingTime } from '../model/types'

import { formatPercent, formatUsd } from '@/shared/lib/format'
import { InfoIcon } from '@/shared/ui/icons'
import { Tooltip } from '@/shared/ui/tooltip'

const MINUTES_PER_HOUR = 60
const MINUTES_PER_DAY = 24 * MINUTES_PER_HOUR

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
          <span className={styles.period}>24h</span>
          <Tooltip className={styles.reference} content={getReferencePriceHint(asset)}>
            · Reference price
            <InfoIcon />
          </Tooltip>
        </span>
      </div>
      {/* Rendered once market data loads, so a prerendered page doesn't hydrate with the build time status */}
      {market && asset.allowedTradingTime && <MarketStatus tradingTime={asset.allowedTradingTime} />}
    </div>
  )
}

function formatDuration(minutes: number): string {
  if (minutes < MINUTES_PER_HOUR) return `${minutes} min`
  if (minutes < MINUTES_PER_DAY) return `${Math.floor(minutes / MINUTES_PER_HOUR)}h`

  return `${Math.floor(minutes / MINUTES_PER_DAY)}d`
}

function getReferencePriceHint({ title }: RwaAsset): string {
  return `The price and chart show the tokenized market of ${title} per share, from CoinGecko, across issuers and networks. Token prices and liquidity may differ. Past performance is not indicative of future results.`
}

function MarketStatus({ tradingTime }: { tradingTime: RwaTradingTime }): ReactNode {
  const now = new Date()
  const open = isUsMarketOpen(tradingTime, now)
  const minutesToChange = getMinutesToUsMarketChange(tradingTime, now)

  return (
    <Tooltip
      className={styles.status}
      content={`US regular session · ${tradingTime.start.replace(' UTC', '')} – ${tradingTime.end} · Mon – Fri`}
    >
      <span className={open ? styles.statusOpen : styles.statusClosed}>US market {open ? 'open' : 'closed'}</span>
      {minutesToChange !== null && (
        <span>
          · {open ? 'closes' : 'opens'} in {formatDuration(minutesToChange)}
        </span>
      )}
      <InfoIcon />
    </Tooltip>
  )
}
