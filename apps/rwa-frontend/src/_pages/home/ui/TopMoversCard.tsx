'use client'

import { useAtom } from 'jotai'
import type { ReactNode } from 'react'

import styles from './MarketOverview.module.css'
import { OverviewAssetRows } from './OverviewAssetRows'

import { type TopMoversTab, topMoversTabAtom } from '../model/topMoversTabAtom'

import type { RwaMarketOverviewItem } from '@/entities/asset'

import { formatPercent } from '@/shared/lib/format'

const TABS: { value: TopMoversTab; label: string; emptyText: string }[] = [
  { value: 'gainers', label: 'Gainers', emptyText: 'No gainers in the last 24 hours' },
  { value: 'losers', label: 'Losers', emptyText: 'No losers in the last 24 hours' },
]

interface TopMoversCardProps {
  /** `undefined` while loading */
  gainers: RwaMarketOverviewItem[] | undefined
  losers: RwaMarketOverviewItem[] | undefined
  degraded: boolean
}

export function TopMoversCard({ gainers, losers, degraded }: TopMoversCardProps): ReactNode {
  const [tab, setTab] = useAtom(topMoversTabAtom)
  const isGainers = tab === 'gainers'

  return (
    <section className={styles.card} aria-labelledby="top-movers-title">
      <header className={styles.cardHeader}>
        <div>
          <h2 id="top-movers-title" className={styles.cardTitle}>
            Top movers
          </h2>
          <p className={styles.cardSubtitle}>Underlying price change · 24h</p>
        </div>
        <div className={styles.segmented} role="group" aria-label="Top movers list">
          {TABS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              className={value === tab ? styles.segmentActive : undefined}
              aria-pressed={value === tab}
              onClick={() => setTab(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </header>
      <OverviewAssetRows
        items={isGainers ? gainers : losers}
        degraded={degraded}
        emptyText={TABS.find(({ value }) => value === tab)?.emptyText ?? ''}
        tone={isGainers ? 'positive' : 'negative'}
        valueClassName={isGainers ? styles.positive : styles.negative}
        renderValue={(item) => formatPercent(item.change24h)}
      />
    </section>
  )
}
