'use client'

import { type ReactNode, useMemo, useRef } from 'react'

import Link from 'next/link'

import { AssetAccount } from './AssetAccount'
import { AssetPriceChart } from './AssetPriceChart'
import styles from './AssetView.module.css'
import { IssuersMenu } from './IssuersMenu'
import { MarketKindSelector } from './MarketKindSelector'
import { TradeWidget } from './TradeWidget'

import { getTradingPauseMessage } from '../lib/tradingPause'
import { useAssetMarket } from '../model/useAssetMarket'
import { useAssetPriceStats } from '../model/useAssetPriceStats'
import { useFitStickyTop } from '../model/useFitStickyTop'

import { AssetStats, getTradeAsset, type RwaAsset } from '@/entities/asset'
import { StatusMessage } from '@/shared/ui/status-message'
import { TokenLogo } from '@/shared/ui/token-logo'

const SIDE_STICKY_GAP = 16

export function AssetView({ asset }: { asset: RwaAsset }): ReactNode {
  const { data, error } = useAssetMarket(asset.ticker)
  const { marketKind, stats, provider } = useAssetPriceStats(asset.ticker)
  const sideRef = useRef<HTMLElement>(null)
  const tradingPauseMessage = getTradingPauseMessage(data?.tradingPause, new Date())
  const tradeAsset = useMemo(() => getTradeAsset(asset), [asset])

  useFitStickyTop(sideRef, SIDE_STICKY_GAP)

  return (
    <div className={styles.layout}>
      <div className={styles.overview}>
        <Link className={styles.back} href="/">
          <ArrowLeftIcon />
          Explore
        </Link>
        <AssetIdentity asset={asset} />
        {error && !data && <StatusMessage>Failed to load market data: {error.message}</StatusMessage>}
        {data?.degraded && <StatusMessage>Tokenized stock market data is temporarily unavailable</StatusMessage>}
        {tradingPauseMessage && <StatusMessage>{tradingPauseMessage}</StatusMessage>}
        <MarketKindSelector asset={asset} />
        <AssetStats asset={asset} market={stats} marketKind={marketKind} provider={provider} />
        <AssetPriceChart ticker={asset.ticker} />
      </div>
      <aside ref={sideRef} className={styles.side} aria-label={`Trade ${asset.ticker}`}>
        {tradeAsset.tokens.length ? (
          <TradeWidget asset={tradeAsset} />
        ) : (
          <StatusMessage>{asset.ticker} tokens are on networks CoW Swap doesn't trade on yet</StatusMessage>
        )}
      </aside>
      <div className={styles.details}>
        <AssetAccount asset={asset} />
      </div>
    </div>
  )
}

function ArrowLeftIcon(): ReactNode {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M12.667 8H3.333M8 12.667 3.333 8 8 3.333"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function AssetIdentity({ asset }: { asset: RwaAsset }): ReactNode {
  return (
    <header className={styles.identity}>
      <TokenLogo symbol={asset.ticker} logoUrl={asset.logoUrl} size="hero" />
      <div className={styles.name}>
        <h1>{asset.title}</h1>
        <div className={styles.meta}>
          <span>{asset.ticker}</span>
          <IssuersMenu tokens={asset.tokens} />
        </div>
      </div>
    </header>
  )
}
