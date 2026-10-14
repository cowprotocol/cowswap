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
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="7" cy="7" r="5.25" stroke="currentColor" strokeWidth="1.5" />
          <path d="m11 11 3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
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
        <select
          className={styles.filterSelect}
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
        </select>
        <select
          className={styles.filterSelect}
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
        </select>
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
