'use client'

import { useAtomValue } from 'jotai'
import type { ReactNode } from 'react'

import Link from 'next/link'

import { AccountTabs } from './AccountTabs'
import { AssetPriceChart } from './AssetPriceChart'
import styles from './AssetView.module.css'
import { StockTokens } from './StockTokens'
import { TradeWidget } from './TradeWidget'

import { assetQueryAtomFamily, AssetStats, type RwaAsset } from '@/entities/asset'
import { StatusMessage } from '@/shared/ui/status-message'

export function AssetView({ asset }: { asset: RwaAsset }): ReactNode {
  const { data, error } = useAtomValue(assetQueryAtomFamily(asset.ticker))

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
        {error && !data && <StatusMessage>Failed to load market data: {error.message}</StatusMessage>}
        {data?.degraded && <StatusMessage>Market data is temporarily unavailable</StatusMessage>}
        <AssetStats asset={asset} market={data?.market} />
        <AssetPriceChart ticker={asset.ticker} />
        <StockTokens asset={asset} />
        <AccountTabs asset={asset} />
      </div>
      <aside className={styles.side}>
        <TradeWidget asset={asset} />
      </aside>
    </div>
  )
}
