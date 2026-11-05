'use client'

import { useAtomValue } from 'jotai'
import { type ReactNode, useId, useLayoutEffect, useRef, useState } from 'react'

import styles from './AssetAbout.module.css'

import { getYearRange } from '../lib/yearRange'
import { assetYearChartQueryAtomFamily } from '../model/assetChartQueryAtomFamily'
import { useAssetMarket } from '../model/useAssetMarket'

import { RWA_ASSET_TYPE_LABELS, type RwaAsset } from '@/entities/asset'
import { formatDate, formatUsd } from '@/shared/lib/format'
import { ChevronDownIcon } from '@/shared/ui/icons'
import { TokenLogo } from '@/shared/ui/token-logo'

interface RangeStatProps {
  label: string
  low: number | null | undefined
  high: number | null | undefined
  price: number | null | undefined
}

export function AssetAbout({ asset }: { asset: RwaAsset }): ReactNode {
  const { market } = useAssetMarket(asset.ticker)
  const yearPoints = useAtomValue(assetYearChartQueryAtomFamily(asset.ticker)).data?.points
  const yearRange = yearPoints ? getYearRange(yearPoints) : null
  const { profile } = asset

  return (
    <section className={styles.about} aria-labelledby="asset-about-title">
      <header className={styles.header}>
        <TokenLogo symbol={asset.ticker} logoUrl={asset.logoUrl} />
        <h2 id="asset-about-title">About {asset.title}</h2>
        <span className={styles.sector}>{profile?.sector ?? RWA_ASSET_TYPE_LABELS[asset.type]}</span>
        {profile && (
          <a className={styles.website} href={profile.website} target="_blank" rel="noopener noreferrer">
            {new URL(profile.website).hostname.replace(/^www\./, '')} <span aria-hidden="true">↗</span>
          </a>
        )}
      </header>
      {profile && <Description text={profile.description} />}
      <dl className={styles.well}>
        <RangeStat label="Day range" low={market?.dayLow} high={market?.dayHigh} price={market?.price} />
        <RangeStat
          label={
            yearRange?.since
              ? `Range since ${formatDate(new Date(yearRange.since * 1000).toISOString())}`
              : '52-week range'
          }
          low={yearRange?.low}
          high={yearRange?.high}
          price={market?.price}
        />
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
