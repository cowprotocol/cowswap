'use client'

import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import type { ReactNode } from 'react'

import Image from 'next/image'
import Link from 'next/link'

import styles from './AssetsTable.module.css'
import { Sparkline, type SparklineTone } from './Sparkline'
import { StarIcon } from './StarIcon'

import { assetsPageAtom } from '../model/assetsPageAtom'
import { assetsSortAtom } from '../model/assetsSortAtom'
import { toggleWatchlistAtom, watchlistAtom } from '../model/watchlistAtoms'

import { RWA_ASSET_TYPE_LABELS, type RwaAssetListItem, type RwaSortField } from '@/entities/asset'
import { getChainLabel, getChainLogoUrl } from '@/shared/lib/chain'
import { formatCompactUsd, formatPercent, formatUsd } from '@/shared/lib/format'
import { usePrefersDarkScheme } from '@/shared/lib/theme'
import { TokenLogo } from '@/shared/ui/token-logo'

const NETWORK_LOGO_SIZE = 16

interface AssetsTableProps {
  id: string
  assets: RwaAssetListItem[]
}

interface SortableHeaderProps {
  field: RwaSortField
  title: string
  numeric?: boolean
  className?: string
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
            <SortableHeader field="ticker" title="Asset" />
            <SortableHeader field="price" title="Stock price" numeric />
            <SortableHeader field="change24h" title="24H change" numeric />
            <SortableHeader field="dexVolume24h" title="24h DEX volume" numeric className={styles.optional} />
            <SortableHeader field="onchainCap" title="Onchain market cap" numeric className={styles.optional} />
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
              <IssuersCount asset={asset} />
              <NetworkLogos asset={asset} />
            </div>
          </div>
        </div>
      </td>
      <td className={styles.numeric}>{formatUsd(asset.market?.price)}</td>
      <td className={`${styles.numeric} ${changeClassName(change)}`}>{formatPercent(change)}</td>
      <td className={`${styles.numeric} ${styles.optional}`}>{formatCompactUsd(asset.dexVolume24h)}</td>
      <td className={`${styles.numeric} ${styles.optional}`}>{formatCompactUsd(asset.onchainCap)}</td>
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

function IssuersCount({ asset }: { asset: RwaAssetListItem }): ReactNode {
  const issuers = [...new Set(asset.tokens.map((token) => token.issuer))]

  return (
    <span className={styles.issuers} title={issuers.join(', ')}>
      {issuers.length} {issuers.length === 1 ? 'issuer' : 'issuers'}
    </span>
  )
}

function NetworkLogos({ asset }: { asset: RwaAssetListItem }): ReactNode {
  const prefersDark = usePrefersDarkScheme()
  const chainIds = [...new Set(asset.tokens.map((token) => token.chainId))]

  return (
    <span className={styles.networks}>
      {chainIds.map((chainId) => {
        const logoUrl = getChainLogoUrl(chainId, prefersDark)
        const label = getChainLabel(chainId)

        return logoUrl ? (
          <Image
            key={chainId}
            src={logoUrl}
            alt={label}
            title={label}
            width={NETWORK_LOGO_SIZE}
            height={NETWORK_LOGO_SIZE}
            unoptimized
          />
        ) : null
      })}
    </span>
  )
}

function SortableHeader({ field, title, numeric = false, className }: SortableHeaderProps): ReactNode {
  const [{ sort, order }, setSort] = useAtom(assetsSortAtom)
  const setPage = useSetAtom(assetsPageAtom)
  const isActive = sort === field

  const onClick = (): void => {
    const defaultOrder = field === 'ticker' ? 'asc' : 'desc'
    const flippedOrder = order === 'asc' ? 'desc' : 'asc'

    setSort({ sort: field, order: isActive ? flippedOrder : defaultOrder })
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
