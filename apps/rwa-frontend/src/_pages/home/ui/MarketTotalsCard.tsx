'use client'

import type { ReactNode } from 'react'

import styles from './MarketOverview.module.css'
import { Sparkline } from './Sparkline'

import { formatRefTime } from '../lib/formatRefTime'
import { isUsMarketOpen } from '../lib/usMarketStatus'

import type { RwaMarketOverview, RwaTradingTime } from '@/entities/asset'

import { formatCompactUsd } from '@/shared/lib/format'

const DEX_VOLUME_HINT = 'DEX trades of every listed token on every network over the last 24 hours'

interface MarketTotalsCardProps {
  /** `undefined` while loading */
  overview: RwaMarketOverview | undefined
}

export function MarketTotalsCard({ overview }: MarketTotalsCardProps): ReactNode {
  const refTime = overview?.updatedAt
    ? formatRefTime(overview.updatedAt, Intl.DateTimeFormat().resolvedOptions().timeZone)
    : null

  return (
    <section className={styles.card} aria-labelledby="market-totals-title">
      <header className={styles.cardHeader}>
        <h2 id="market-totals-title" className={styles.cardTitle}>
          Market overview
        </h2>
        <span className={styles.cardHint}>7D</span>
      </header>
      <div className={styles.totals}>
        <Total label="Onchain market cap" value={overview && formatCompactUsd(overview.totals.onchainCap)} />
        <Total
          label={
            <>
              24h DEX volume{' '}
              <span className={styles.info} role="img" aria-label={DEX_VOLUME_HINT} title={DEX_VOLUME_HINT}>
                ⓘ
              </span>
            </>
          }
          value={overview && formatCompactUsd(overview.totals.dexVolume24h)}
        />
      </div>
      <div className={styles.capChart}>
        {overview ? (
          <Sparkline series={overview.totals.onchainCapSeries} tone="neutral" area />
        ) : (
          <span className={`${styles.skeleton} ${styles.skeletonChart}`} />
        )}
      </div>
      <div className={styles.axis}>
        <span>7 days ago</span>
        <span>Today</span>
      </div>
      <footer className={styles.cardFooter}>
        {overview?.tradingTime && <MarketStatus tradingTime={overview.tradingTime} />}
        {refTime && <span>Ref. {refTime}</span>}
      </footer>
    </section>
  )
}

function MarketStatus({ tradingTime }: { tradingTime: RwaTradingTime }): ReactNode {
  const open = isUsMarketOpen(tradingTime, new Date())

  return <span className={open ? styles.statusOpen : styles.statusClosed}>US market {open ? 'open' : 'closed'}</span>
}

function Total({ label, value }: { label: ReactNode; value: string | undefined }): ReactNode {
  return (
    <div className={styles.total}>
      {value === undefined ? (
        <span className={`${styles.skeleton} ${styles.skeletonValue}`} />
      ) : (
        <span className={styles.totalValue}>{value}</span>
      )}
      <span className={styles.totalLabel}>{label}</span>
    </div>
  )
}
