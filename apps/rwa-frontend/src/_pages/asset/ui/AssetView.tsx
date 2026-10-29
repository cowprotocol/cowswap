'use client'

import { type ReactNode, useRef } from 'react'

import Link from 'next/link'

import { AssetAccount } from './AssetAccount'
import { AssetPriceChart } from './AssetPriceChart'
import styles from './AssetView.module.css'
import { TradeWidget } from './TradeWidget'

import { getTradingPauseMessage } from '../lib/tradingPause'
import { useAssetMarket } from '../model/useAssetMarket'
import { useFitStickyTop } from '../model/useFitStickyTop'

import { AssetStats, IssuersCount, type RwaAsset } from '@/entities/asset'
import { NetworkLogos } from '@/shared/ui/network-logos'
import { StatusMessage } from '@/shared/ui/status-message'
import { TokenLogo } from '@/shared/ui/token-logo'

const SIDE_STICKY_GAP = 16

export function AssetView({ asset }: { asset: RwaAsset }): ReactNode {
  const { data, error, market } = useAssetMarket(asset.ticker)
  const sideRef = useRef<HTMLElement>(null)
  const tradingPauseMessage = getTradingPauseMessage(data?.tradingPause, new Date())

  useFitStickyTop(sideRef, SIDE_STICKY_GAP)

  return (
    <div className={styles.layout}>
      <div className={styles.main}>
        <Link className={styles.back} href="/">
          <ArrowLeftIcon />
          Explore
        </Link>
        <AssetIdentity asset={asset} />
        {error && !data && <StatusMessage>Failed to load market data: {error.message}</StatusMessage>}
        {data?.degraded && <StatusMessage>Market data is temporarily unavailable</StatusMessage>}
        {tradingPauseMessage && <StatusMessage>{tradingPauseMessage}</StatusMessage>}
        <AssetStats asset={asset} market={market} />
        <AssetPriceChart ticker={asset.ticker} />
        <AssetAccount asset={asset} />
      </div>
      <aside ref={sideRef} className={styles.side}>
        <TradeWidget asset={asset} />
      </aside>
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
  const chainIds = [...new Set(asset.tokens.map((token) => token.chainId))]

  return (
    <header className={styles.identity}>
      <TokenLogo symbol={asset.ticker} logoUrl={asset.logoUrl} size="hero" />
      <div className={styles.name}>
        <h1>{asset.title}</h1>
        <div className={styles.meta}>
          <span>{asset.ticker}</span>
          <IssuersCount className={styles.issuers} tokens={asset.tokens} />
          <NetworkLogos chainIds={chainIds} />
        </div>
      </div>
    </header>
  )
}
