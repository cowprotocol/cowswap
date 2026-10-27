'use client'

import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import type { ReactNode } from 'react'

import Link from 'next/link'

import styles from './AssetsTable.module.css'
import { Sparkline, type SparklineTone } from './Sparkline'
import { StarIcon } from './StarIcon'

import { MARKET_DATA_HINT } from '../lib/marketDataHint'
import { assetsPageAtom } from '../model/assetsPageAtom'
import { assetsSortAtom } from '../model/assetsSortAtom'
import { toggleWatchlistAtom, watchlistAtom } from '../model/watchlistAtoms'

import {
  getDefaultSortOrder,
  IssuersCount,
  RWA_ASSET_TYPE_LABELS,
  type RwaAssetListItem,
  type RwaSortField,
} from '@/entities/asset'
import { formatCompactUsd, formatPercent, formatUsd } from '@/shared/lib/format'
import { InfoIcon } from '@/shared/ui/icons'
import { NetworkLogos } from '@/shared/ui/network-logos'
import { TokenLogo } from '@/shared/ui/token-logo'
import { Tooltip } from '@/shared/ui/tooltip'

interface AssetsTableProps {
  id: string
  assets: RwaAssetListItem[]
}

interface SortableHeaderProps {
  field: RwaSortField
  title: string
  numeric?: boolean
  className?: string
  hint?: string
}

export function AssetsTable({ id, assets }: AssetsTableProps): ReactNode {
  return (
    <div className={styles.frame}>
      <table id={id} className={styles.table}>
        <thead>
          <tr>
            <th className={styles.watchColumn}>
              <span className={styles.visuallyHidden}>Watchlist</span>
            </th>
            <SortableHeader field="title" title="Asset" />
            <SortableHeader field="price" title="Reference price" numeric hint={MARKET_DATA_HINT} />
            <SortableHeader field="change24h" title="24H change" numeric />
            <SortableHeader field="volume24h" title="24h volume" numeric className={styles.optional} />
            <SortableHeader field="marketCap" title="Tokenized market cap" numeric className={styles.optional} />
            <th className={`${styles.numeric} ${styles.chartColumn}`}>24H chart</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => (
            <AssetRow key={asset.ticker} asset={asset} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AssetRow({ asset }: { asset: RwaAssetListItem }): ReactNode {
  const change = asset.market?.change24h

  return (
    <tr>
      <td className={styles.watchColumn}>
        <WatchButton ticker={asset.ticker} title={asset.title} />
      </td>
      <td>
        <div className={styles.asset}>
          <TokenLogo symbol={asset.ticker} logoUrl={asset.logoUrl} />
          <div className={styles.assetText}>
            <Link className={styles.assetLink} href={`/asset/${asset.ticker}`}>
              {asset.title}
            </Link>
            <div className={styles.assetMeta}>
              <span>{asset.ticker}</span>
              <span className={styles.assetType}>{RWA_ASSET_TYPE_LABELS[asset.type]}</span>
              <IssuersCount className={styles.issuers} tokens={asset.tokens} />
              <NetworkLogos chainIds={[...new Set(asset.tokens.map((token) => token.chainId))]} />
            </div>
          </div>
        </div>
      </td>
      <td className={styles.numeric}>{formatUsd(asset.market?.price)}</td>
      <td className={`${styles.numeric} ${changeClassName(change)}`}>{formatPercent(change)}</td>
      <td className={`${styles.numeric} ${styles.optional}`}>{formatCompactUsd(asset.market?.volume24h)}</td>
      <td className={`${styles.numeric} ${styles.optional}`}>{formatCompactUsd(asset.market?.marketCap)}</td>
      <td className={`${styles.numeric} ${styles.chartColumn}`}>
        <span className={styles.sparkline}>
          <Sparkline series={asset.series} tone={getTone(change)} />
        </span>
      </td>
    </tr>
  )
}

function changeClassName(change: number | null | undefined): string {
  if (!change) return ''

  return change > 0 ? styles.positive : styles.negative
}

function getTone(change: number | null | undefined): SparklineTone {
  if (!change) return 'neutral'

  return change > 0 ? 'positive' : 'negative'
}

function SortableHeader({ field, title, numeric = false, className, hint }: SortableHeaderProps): ReactNode {
  const [{ sort, order }, setSort] = useAtom(assetsSortAtom)
  const setPage = useSetAtom(assetsPageAtom)
  const isActive = sort === field

  const onClick = (): void => {
    const flippedOrder = order === 'asc' ? 'desc' : 'asc'

    setSort({ sort: field, order: isActive ? flippedOrder : getDefaultSortOrder(field) })
    setPage(1)
  }

  return (
    <th
      className={[numeric && styles.numeric, className].filter(Boolean).join(' ')}
      aria-sort={isActive ? (order === 'asc' ? 'ascending' : 'descending') : undefined}
    >
      <button type="button" className={isActive ? styles.activeSort : styles.sort} onClick={onClick}>
        {isActive && <span aria-hidden="true">{order === 'asc' ? '↑' : '↓'}</span>}
        {title}
      </button>
      {hint && (
        <Tooltip className={styles.info} content={hint}>
          <span role="img" aria-label="About market data">
            <InfoIcon />
          </span>
        </Tooltip>
      )}
    </th>
  )
}

function WatchButton({ ticker, title }: { ticker: string; title: string }): ReactNode {
  const isWatched = useAtomValue(watchlistAtom).includes(ticker)
  const toggleWatchlist = useSetAtom(toggleWatchlistAtom)

  return (
    <button
      type="button"
      className={isWatched ? styles.watchedButton : styles.watchButton}
      aria-label={isWatched ? `Remove ${title} from watchlist` : `Save ${title} to watchlist`}
      aria-pressed={isWatched}
      onClick={() => toggleWatchlist(ticker)}
    >
      <StarIcon filled={isWatched} />
    </button>
  )
}
