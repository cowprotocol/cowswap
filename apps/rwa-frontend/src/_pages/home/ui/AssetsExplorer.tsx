'use client'

import { useAtomValue, useSetAtom } from 'jotai'
import type { ReactNode } from 'react'

import styles from './AssetsExplorer.module.css'
import { AssetsFilters } from './AssetsFilters'
import { AssetsTable } from './AssetsTable'
import { AssetsTypeTabs } from './AssetsTypeTabs'

import { MARKET_DATA_HINT } from '../lib/marketDataHint'
import {
  activePanelFiltersCountAtom,
  assetsFilterQueryAtom,
  assetsFiltersAtom,
  NO_PANEL_FILTERS,
  setAssetsFilterQueryAtom,
  updateAssetsFiltersAtom,
} from '../model/assetsFiltersAtoms'
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
  const { data, error } = useAtomValue(assetsPageQueryAtom)
  const assets = data?.items ?? (error ? [] : null)

  return (
    <>
      {data?.degraded && <StatusMessage>Market data is temporarily unavailable</StatusMessage>}
      <AssetsTable
        id={ASSETS_TABLE_ID}
        assets={assets}
        emptyState={error && !data ? `Failed to load assets: ${error.message}` : <NoAssetsMessage />}
      />
      {data?.items.length ? (
        <div className={styles.footer}>
          {data.total < data.typeTotal && (
            <span className={styles.scope}>
              Showing {data.total} of {data.typeTotal} {data.typeTotal === 1 ? 'asset' : 'assets'}
            </span>
          )}
          <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
        </div>
      ) : null}
    </>
  )
}

function NoAssetsMessage(): ReactNode {
  const query = useAtomValue(assetsFilterQueryAtom).trim()
  const setQuery = useSetAtom(setAssetsFilterQueryAtom)
  const { watchlistOnly } = useAtomValue(assetsFiltersAtom)
  const activeFilters = useAtomValue(activePanelFiltersCountAtom)
  const updateFilters = useSetAtom(updateAssetsFiltersAtom)
  const watchlist = useAtomValue(watchlistAtom)

  if (query) {
    return (
      <>
        No assets match “{query}”.{' '}
        <button type="button" className={styles.emptyAction} onClick={() => setQuery('')}>
          Clear search
        </button>
      </>
    )
  }

  if (watchlistOnly && !watchlist.length) return 'Your watchlist is empty. Star an asset to add it.'

  if (activeFilters) {
    return (
      <>
        No assets match the filters.{' '}
        <button type="button" className={styles.emptyAction} onClick={() => updateFilters(NO_PANEL_FILTERS)}>
          Clear filters
        </button>
      </>
    )
  }

  return 'No assets match the filters.'
}
