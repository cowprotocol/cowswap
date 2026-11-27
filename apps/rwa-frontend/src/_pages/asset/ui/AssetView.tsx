'use client'

import { type ReactNode, useRef } from 'react'

import { AssetAccount } from './AssetAccount'
import { AssetBackLink } from './AssetBackLink'
import { AssetPriceChart } from './AssetPriceChart'
import styles from './AssetView.module.css'
import { IssuersMenu } from './IssuersMenu'
import { MarketKindSelector } from './MarketKindSelector'
import { TradeWidget } from './TradeWidget'

import { getTradingPauseMessage } from '../lib/tradingPause'
import { useAssetMarket } from '../model/useAssetMarket'
import { useAssetPriceStats } from '../model/useAssetPriceStats'
import { useFitStickyTop } from '../model/useFitStickyTop'
import { useTradeTokenFromUrl } from '../model/useTradeTokenFromUrl'

import { AssetStats, type RwaAsset, type RwaRelatedAsset } from '@/entities/asset'
import { useIsHydrated } from '@/shared/lib/hydrated'
import { StatusMessage } from '@/shared/ui/status-message'
import { TokenLogo } from '@/shared/ui/token-logo'

const SIDE_STICKY_GAP = 16

interface AssetViewProps {
  asset: RwaAsset
  relatedAssets: RwaRelatedAsset[]
}

export function AssetView({ asset, relatedAssets }: AssetViewProps): ReactNode {
  const { data, error } = useAssetMarket(asset.ticker)
  const { marketKind, stats, provider } = useAssetPriceStats(asset.ticker)
  const sideRef = useRef<HTMLElement>(null)
  const isHydrated = useIsHydrated()
  const tradingPauseMessage = isHydrated ? getTradingPauseMessage(data?.tradingPause, new Date()) : null

  useFitStickyTop(sideRef, SIDE_STICKY_GAP)
  useTradeTokenFromUrl(asset.tokens)

  return (
    <div className={styles.layout}>
      <div className={styles.overview}>
        <AssetBackLink />
        <AssetIdentity asset={asset} />
        {error && !data && <StatusMessage>Failed to load market data: {error.message}</StatusMessage>}
        {data?.degraded && <StatusMessage>Tokenized stock market data is temporarily unavailable</StatusMessage>}
        {tradingPauseMessage && <StatusMessage>{tradingPauseMessage}</StatusMessage>}
        <MarketKindSelector asset={asset} />
        <AssetStats asset={asset} market={stats} marketKind={marketKind} provider={provider} />
        <AssetPriceChart ticker={asset.ticker} />
      </div>
      <aside ref={sideRef} className={styles.side} aria-label={`Trade ${asset.ticker}`}>
        <TradeWidget asset={asset} />
      </aside>
      <div className={styles.details}>
        <AssetAccount asset={asset} relatedAssets={relatedAssets} />
      </div>
    </div>
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
