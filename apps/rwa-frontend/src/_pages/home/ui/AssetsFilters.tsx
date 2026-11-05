'use client'

import { useAtomValue, useSetAtom } from 'jotai'
import type { ReactNode } from 'react'

import styles from './AssetsExplorer.module.css'
import { StarIcon } from './StarIcon'

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

  return (
    <div className={styles.filters}>
      <label className={styles.filterInput}>
        <SearchIcon />
        <input
          type="search"
          placeholder="Filter assets…"
          aria-label="Filter assets"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <span className={styles.visuallyHidden} role="status">
        {data && `${data.total} ${data.total === 1 ? 'asset' : 'assets'}`}
      </span>
      <div className={styles.filterControls}>
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
        <button
          type="button"
          className={styles.watchlistButton}
          aria-pressed={watchlistOnly}
          onClick={() => updateFilters({ watchlistOnly: !watchlistOnly })}
        >
          <StarIcon filled={watchlistOnly} />
          Watchlist
        </button>
      </div>
    </div>
  )
}
