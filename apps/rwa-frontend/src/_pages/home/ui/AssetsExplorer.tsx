'use client'

import { useAtomValue, useSetAtom } from 'jotai'
import type { ReactNode } from 'react'

import styles from './AssetsExplorer.module.css'
import { AssetsFilters } from './AssetsFilters'
import { AssetsTable } from './AssetsTable'
import { AssetsTypeTabs } from './AssetsTypeTabs'

import { MARKET_DATA_HINT } from '../lib/marketDataHint'
import { assetsFiltersAtom } from '../model/assetsFiltersAtoms'
import { assetsPageAtom } from '../model/assetsPageAtom'
import { assetsPageQueryAtom } from '../model/assetsQueryAtoms'
import { watchlistAtom } from '../model/watchlistAtoms'

import { InfoIcon } from '@/shared/ui/icons'
import { Pagination } from '@/shared/ui/pagination'
import { StatusMessage } from '@/shared/ui/status-message'
import { Tooltip } from '@/shared/ui/tooltip'

const ASSETS_TABLE_ID = 'assets-table'

export function AssetsExplorer(): ReactNode {
  return (
    <>
      <section className={styles.explorer} aria-label="Assets">
        <div className={styles.toolbar}>
          <AssetsTypeTabs tableId={ASSETS_TABLE_ID} />
          <AssetsFilters />
        </div>
        <AssetsList />
      </section>
      <Tooltip className={styles.aboutMetrics} content={MARKET_DATA_HINT}>
        About token metrics
        <InfoIcon />
      </Tooltip>
    </>
  )
}

function AssetsList(): ReactNode {
  const setPage = useSetAtom(assetsPageAtom)
  const { watchlistOnly } = useAtomValue(assetsFiltersAtom)
  const watchlist = useAtomValue(watchlistAtom)
  const { data, error } = useAtomValue(assetsPageQueryAtom)

  if (error && !data) return <StatusMessage>Failed to load assets: {error.message}</StatusMessage>
  if (!data) return <StatusMessage>Loading…</StatusMessage>

  return (
    <>
      {data.degraded && <StatusMessage>Market data is temporarily unavailable</StatusMessage>}
      {data.items.length ? (
        <AssetsTable id={ASSETS_TABLE_ID} assets={data.items} />
      ) : (
        <StatusMessage>
          {watchlistOnly && !watchlist.length
            ? 'Your watchlist is empty. Star an asset to add it.'
            : 'No assets match the filters'}
        </StatusMessage>
      )}
      <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
    </>
  )
}
