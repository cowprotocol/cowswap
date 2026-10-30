'use client'

import { useAtomValue, useSetAtom } from 'jotai'
import { type ReactNode, useId, useState } from 'react'

import styles from './AssetsExplorer.module.css'
import { StarIcon } from './StarIcon'
import { FilterIcon } from './ToolbarIcons'

import {
  assetsFilterQueryAtom,
  assetsFiltersAtom,
  setAssetsFilterQueryAtom,
  updateAssetsFiltersAtom,
} from '../model/assetsFiltersAtoms'
import { assetsPageQueryAtom } from '../model/assetsQueryAtoms'

import { SearchIcon } from '@/shared/ui/icons'
import { useNetworkOptions } from '@/shared/ui/network-logos'
import { Select } from '@/shared/ui/select'

export function AssetsFilters(): ReactNode {
  const query = useAtomValue(assetsFilterQueryAtom)
  const setQuery = useSetAtom(setAssetsFilterQueryAtom)
  const { issuer, chainId, watchlistOnly } = useAtomValue(assetsFiltersAtom)
  const updateFilters = useSetAtom(updateAssetsFiltersAtom)
  const { data } = useAtomValue(assetsPageQueryAtom)
  const issuers = data?.issuers ?? []
  const networkOptions = useNetworkOptions(data?.chainIds ?? [])
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const panelId = useId()
  const activeFilters = Number(issuer !== null) + Number(chainId !== null)

  return (
    <>
      <label className={styles.filterInput}>
        <SearchIcon />
        <input
          type="search"
          placeholder="Search assets or tickers…"
          aria-label="Search assets"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <span className={styles.visuallyHidden} role="status">
        {data && `${data.total} ${data.total === 1 ? 'asset' : 'assets'}`}
      </span>
      <button
        type="button"
        className={styles.outlinedButton}
        aria-pressed={watchlistOnly}
        onClick={() => updateFilters({ watchlistOnly: !watchlistOnly })}
      >
        <StarIcon filled={watchlistOnly} />
        Watchlist
      </button>
      <button
        type="button"
        className={styles.outlinedButton}
        aria-expanded={isPanelOpen}
        aria-controls={panelId}
        onClick={() => setIsPanelOpen((open) => !open)}
      >
        <FilterIcon />
        Filters
        {activeFilters > 0 && (
          <span className={styles.filtersCount}>
            {activeFilters}
            <span className={styles.visuallyHidden}> active</span>
          </span>
        )}
      </button>
      {activeFilters > 0 && (
        <button
          type="button"
          className={styles.clearButton}
          onClick={() => updateFilters({ issuer: null, chainId: null })}
        >
          Clear
        </button>
      )}
      <div id={panelId} className={styles.filtersPanel} hidden={!isPanelOpen}>
        <Select
          aria-label="Issuer"
          value={issuer}
          options={[{ value: null, label: 'All issuers' }, ...issuers.map((item) => ({ value: item, label: item }))]}
          onChange={(value) => updateFilters({ issuer: value })}
        />
        <Select
          aria-label="Network"
          value={chainId}
          options={[{ value: null, label: 'All networks' }, ...networkOptions]}
          onChange={(value) => updateFilters({ chainId: value })}
        />
      </div>
    </>
  )
}
