'use client'

import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import type { ReactNode } from 'react'

import Link from 'next/link'

import styles from './AssetsTable.module.css'
import { Sparkline, type SparklineTone } from './Sparkline'
import { StarIcon } from './StarIcon'

import { MARKET_DATA_HINT } from '../lib/marketDataHint'
import { ASSETS_PAGE_SIZE, assetsPageAtom } from '../model/assetsPageAtom'
import { assetsSortAtom } from '../model/assetsSortAtom'
import { toggleWatchlistAtom, watchlistAtom } from '../model/watchlistAtoms'

import { getDefaultSortOrder, RWA_ASSET_TYPE_LABELS, type RwaAssetListItem, type RwaSortField } from '@/entities/asset'
import { EMPTY_VALUE, formatCompactUsd, formatPercent, formatUsd } from '@/shared/lib/format'
import { InfoIcon } from '@/shared/ui/icons'
import { NetworkLogos } from '@/shared/ui/network-logos'
import { TokenLogo } from '@/shared/ui/token-logo'
import { Tooltip } from '@/shared/ui/tooltip'

const COLUMNS_COUNT = 7

/** Widths of the asset title and meta bars, varied per row so the skeleton reads as text */
const SKELETON_TEXT_WIDTHS: [number, number][] = [
  [54, 28],
  [100, 30],
  [106, 26],
]

interface AssetsTableProps {
  id: string
  /** `null` while loading */
  assets: RwaAssetListItem[] | null
  /** Shown in place of the rows when `assets` is empty */
  emptyState: ReactNode
}

interface SortableHeaderProps {
  field: RwaSortField
  title: string
  numeric?: boolean
  className?: string
  hint?: string
}

export function AssetsTable({ id, assets, emptyState }: AssetsTableProps): ReactNode {
  return (
    <div className={styles.frame}>
      <table id={id} className={styles.table} aria-busy={!assets}>
        <thead>
          <tr>
            <th className={styles.watchColumn}>
              <span className={styles.visuallyHidden}>Watchlist</span>
            </th>
            <SortableHeader field="title" title="Asset" />
            <SortableHeader field="price" title="Reference price" numeric hint={MARKET_DATA_HINT} />
            <SortableHeader field="change24h" title="24h change" numeric />
            <SortableHeader field="volume24h" title="24h volume" numeric className={styles.optional} />
            <SortableHeader field="marketCap" title="Onchain market cap" numeric className={styles.optional} />
            <th className={`${styles.numeric} ${styles.chartColumn}`}>24h chart</th>
          </tr>
        </thead>
        <tbody>
          {!assets ? (
            Array.from({ length: ASSETS_PAGE_SIZE }, (_, index) => <SkeletonRow key={index} index={index} />)
          ) : assets.length ? (
            assets.map((asset) => <AssetRow key={asset.ticker} asset={asset} />)
          ) : (
            <tr className={styles.emptyRow}>
              <td colSpan={COLUMNS_COUNT}>{emptyState}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function AssetRow({ asset }: { asset: RwaAssetListItem }): ReactNode {
  const change = asset.market?.change24h
  const issuersCount = new Set(asset.tokens.map((token) => token.issuer)).size

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
              <span className={styles.issuers}>
                {issuersCount} {issuersCount === 1 ? 'issuer' : 'issuers'}
              </span>
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
          <Sparkline series={asset.series} tone={getTone(change)} placeholder={EMPTY_VALUE} />
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

function SkeletonRow({ index }: { index: number }): ReactNode {
  const [titleWidth, tickerWidth] = SKELETON_TEXT_WIDTHS[index % SKELETON_TEXT_WIDTHS.length] ?? [80, 28]

  return (
    <tr className={styles.skeletonRow} aria-hidden="true">
      <td className={styles.watchColumn}>
        <span className={styles.skeletonStar}>
          <StarIcon filled={false} />
        </span>
      </td>
      <td>
        <div className={styles.asset}>
          <span className={`${styles.skeletonBar} ${styles.skeletonLogo}`} />
          <div className={styles.assetText}>
            <span className={styles.skeletonBar} style={{ width: titleWidth }} />
            <span className={styles.skeletonMeta}>
              <span className={styles.skeletonBar} style={{ width: tickerWidth }} />
              <span className={styles.skeletonBar} style={{ width: 58 }} />
            </span>
          </div>
        </div>
      </td>
      <td className={styles.numeric}>
        <span className={styles.skeletonBar} />
      </td>
      <td className={styles.numeric}>
        <span className={styles.skeletonBar} />
      </td>
      <td className={`${styles.numeric} ${styles.optional}`}>
        <span className={styles.skeletonBar} />
      </td>
      <td className={`${styles.numeric} ${styles.optional}`}>
        <span className={styles.skeletonBar} />
      </td>
      <td className={`${styles.numeric} ${styles.chartColumn}`}>
        <span className={`${styles.skeletonBar} ${styles.skeletonChart}`} />
      </td>
    </tr>
  )
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
