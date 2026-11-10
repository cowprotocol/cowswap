'use client'

import { type ReactNode, useId, useLayoutEffect, useRef, useState } from 'react'

import styles from './AssetAbout.module.css'
import { MarketKindSelector } from './MarketKindSelector'

import { useAssetPriceStats } from '../model/useAssetPriceStats'

import { RWA_ASSET_TYPE_LABELS, RWA_REGISTRY_EDIT_URL, type RwaAsset } from '@/entities/asset'
import { formatCompactUsd, formatDate, formatUsd } from '@/shared/lib/format'
import { ChevronDownIcon, PencilIcon } from '@/shared/ui/icons'
import { TokenLogo } from '@/shared/ui/token-logo'
import { Tooltip } from '@/shared/ui/tooltip'

const PROPOSE_FIX_LABEL = 'Found a mistake? Propose a fix'

interface RangeStatProps {
  label: string
  low: number | null | undefined
  high: number | null | undefined
  price: number | null | undefined
}

export function AssetAbout({ asset }: { asset: RwaAsset }): ReactNode {
  const { marketKind, stats, yearRange } = useAssetPriceStats(asset.ticker)
  const isStock = marketKind === 'stock'
  const { profile } = asset

  return (
    <section className={styles.about} aria-labelledby="asset-about-title">
      <header className={styles.header}>
        <TokenLogo symbol={asset.ticker} logoUrl={asset.logoUrl} />
        <h2 id="asset-about-title">About {asset.title}</h2>
        <span className={styles.sector}>{profile?.sector ?? RWA_ASSET_TYPE_LABELS[asset.type]}</span>
        {profile && <ProfileLinks profile={profile} />}
      </header>
      {profile && <Description text={profile.description} />}
      <MarketKindSelector asset={asset} className={styles.marketKind} />
      <dl className={styles.well}>
        <RangeStat label="Day range" low={stats?.dayLow} high={stats?.dayHigh} price={stats?.price} />
        <RangeStat
          label={
            yearRange?.since
              ? `Range since ${formatDate(new Date(yearRange.since * 1000).toISOString())}`
              : '52-week range'
          }
          low={yearRange?.low}
          high={yearRange?.high}
          price={stats?.price}
        />
        {stats && (
          <>
            <ValueStat
              label={isStock ? 'Market cap' : 'Tokenized market cap'}
              value={formatCompactUsd(stats.marketCap)}
            />
            <ValueStat label="Volume (24h)" value={formatCompactUsd(stats.volume24h)} />
          </>
        )}
      </dl>
    </section>
  )
}

function Description({ text }: { text: string }): ReactNode {
  const ref = useRef<HTMLParagraphElement>(null)
  const id = useId()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isClamped, setIsClamped] = useState(false)

  useLayoutEffect(() => {
    const element = ref.current

    if (element && !isExpanded) setIsClamped(element.scrollHeight > element.clientHeight)
  }, [text, isExpanded])

  return (
    <>
      <p ref={ref} id={id} className={isExpanded ? styles.description : `${styles.description} ${styles.clamped}`}>
        {text}
      </p>
      {(isClamped || isExpanded) && (
        <button
          type="button"
          className={styles.readMore}
          aria-expanded={isExpanded}
          aria-controls={id}
          onClick={() => setIsExpanded((expanded) => !expanded)}
        >
          {isExpanded ? 'Show less' : 'Read more'}
          <ChevronDownIcon />
        </button>
      )}
    </>
  )
}

function ProfileLinks({ profile }: { profile: NonNullable<RwaAsset['profile']> }): ReactNode {
  if (!profile.website && !profile.description) return null

  return (
    <span className={styles.links}>
      {profile.website && (
        <a className={styles.website} href={profile.website} target="_blank" rel="noopener noreferrer">
          {new URL(profile.website).hostname.replace(/^www\./, '')} <span aria-hidden="true">↗</span>
        </a>
      )}
      {profile.description && (
        <Tooltip className={styles.proposeFix} content={PROPOSE_FIX_LABEL}>
          <a href={RWA_REGISTRY_EDIT_URL} target="_blank" rel="noopener noreferrer" aria-label={PROPOSE_FIX_LABEL}>
            <PencilIcon />
          </a>
        </Tooltip>
      )}
    </span>
  )
}

function RangeStat({ label, low, high, price }: RangeStatProps): ReactNode {
  const hasRange = typeof low === 'number' && typeof high === 'number' && high > low
  const position = hasRange && typeof price === 'number' ? Math.min(Math.max((price - low) / (high - low), 0), 1) : null

  return (
    <div className={styles.stat}>
      <dt>{label}</dt>
      <dd>
        <span className={styles.bar} aria-hidden="true">
          {position !== null && <span className={styles.dot} style={{ left: `${position * 100}%` }} />}
        </span>
        <span className={styles.rangeLabels}>
          <span>{formatUsd(low)}</span>
          <span className={styles.visuallyHidden}> to </span>
          <span>{formatUsd(high)}</span>
        </span>
      </dd>
    </div>
  )
}

function ValueStat({ label, value }: { label: string; value: string }): ReactNode {
  return (
    <div className={styles.stat}>
      <dt>{label}</dt>
      <dd className={styles.value}>{value}</dd>
    </div>
  )
}
