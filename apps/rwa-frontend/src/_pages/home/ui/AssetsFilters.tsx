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

import { getChainLabel } from '@/shared/lib/chain'
import { SearchIcon } from '@/shared/ui/icons'
import { SelectPill } from '@/shared/ui/select-pill'

export function AssetsFilters(): ReactNode {
  const query = useAtomValue(assetsFilterQueryAtom)
  const setQuery = useSetAtom(setAssetsFilterQueryAtom)
  const { issuer, chainId, watchlistOnly } = useAtomValue(assetsFiltersAtom)
  const updateFilters = useSetAtom(updateAssetsFiltersAtom)
  const { data } = useAtomValue(assetsPageQueryAtom)
  const issuers = data?.issuers ?? []
  const chainIds = data?.chainIds ?? []

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
        <SelectPill
          aria-label="Issuer"
          value={issuer ?? ''}
          onChange={(event) => updateFilters({ issuer: event.target.value || null })}
        >
          <option value="">All issuers</option>
          {issuers.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </SelectPill>
        <SelectPill
          aria-label="Network"
          value={chainId ?? ''}
          onChange={(event) => updateFilters({ chainId: event.target.value ? Number(event.target.value) : null })}
        >
          <option value="">All networks</option>
          {chainIds.map((item) => (
            <option key={item} value={item}>
              {getChainLabel(item)}
            </option>
          ))}
        </SelectPill>
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
