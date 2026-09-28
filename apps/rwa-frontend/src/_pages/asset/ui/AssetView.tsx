'use client'

import type { ReactNode } from 'react'

import Link from 'next/link'

import { AssetPriceChart } from './AssetPriceChart'
import styles from './AssetView.module.css'
import { TradeWidget } from './TradeWidget'

import { AssetStats, useAsset } from '@/entities/asset'
import { StatusMessage } from '@/shared/ui/status-message'

export function AssetView({ ticker }: { ticker: string }): ReactNode {
  const { data: asset, error } = useAsset(ticker)

  if (error && !asset)
    return (
      <StatusMessage>
        Failed to load {ticker}: {error.message}
      </StatusMessage>
    )
  if (!asset) return <StatusMessage>Loading…</StatusMessage>

  return (
    <div className={styles.layout}>
      <div className={styles.main}>
        <Link className={styles.back} href="/">
          ← All assets
        </Link>
        <header className={styles.header}>
          <h1>{asset.title}</h1>
          <span className={styles.badge}>{asset.ticker}</span>
          <span className={styles.badge}>{asset.type}</span>
        </header>
        <AssetStats asset={asset} />
        <AssetPriceChart ticker={asset.ticker} />
      </div>
      <aside className={styles.side}>
        <TradeWidget asset={asset} />
      </aside>
    </div>
  )
}
