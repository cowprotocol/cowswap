'use client'

import { useAtomValue } from 'jotai'
import type { ReactNode } from 'react'

import styles from './AssetAbout.module.css'

import { assetQueryAtomFamily, RWA_ASSET_TYPE_LABELS, type RwaAsset } from '@/entities/asset'
import { formatCompactUsd, formatRange } from '@/shared/lib/format'

export function AssetAbout({ asset }: { asset: RwaAsset }): ReactNode {
  const market = useAtomValue(assetQueryAtomFamily(asset.ticker)).data?.market
  const listings = asset.tokens.length

  return (
    <section className={styles.about} aria-labelledby="asset-about-title">
      <h2 id="asset-about-title">About {asset.title}</h2>
      <p className={styles.subtitle}>
        {asset.ticker} · {RWA_ASSET_TYPE_LABELS[asset.type]}
      </p>
      <p className={styles.group}>
        Tokenized · {listings} {listings === 1 ? 'listing' : 'listings'}
      </p>
      <dl className={styles.tiles}>
        <StatTile label="Market cap" value={formatCompactUsd(market?.marketCap)} />
        <StatTile label="24h volume" value={formatCompactUsd(market?.volume24h)} />
        <StatTile label="Day range" value={formatRange(market?.dayLow, market?.dayHigh)} />
      </dl>
    </section>
  )
}

function StatTile({ label, value }: { label: string; value: string }): ReactNode {
  return (
    <div className={styles.tile}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}
