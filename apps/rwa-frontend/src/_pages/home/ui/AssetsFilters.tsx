'use client'

import { useAtomValue, useSetAtom } from 'jotai'
import { type ReactNode, useCallback, useEffect, useId, useRef, useState } from 'react'

import styles from './AssetsExplorer.module.css'
import { AssetsFiltersPanel } from './AssetsFiltersPanel'
import { StarIcon } from './StarIcon'
import { FilterIcon } from './ToolbarIcons'

import {
  activePanelFiltersCountAtom,
  assetsFilterQueryAtom,
  assetsFiltersAtom,
  NO_PANEL_FILTERS,
  setAssetsFilterQueryAtom,
  updateAssetsFiltersAtom,
} from '../model/assetsFiltersAtoms'
import { assetsPageQueryAtom } from '../model/assetsQueryAtoms'

import { useDismissOnOutsideInteraction } from '@/shared/lib/dismiss'
import { SearchIcon } from '@/shared/ui/icons'

export function AssetsFilters(): ReactNode {
  const query = useAtomValue(assetsFilterQueryAtom)
  const setQuery = useSetAtom(setAssetsFilterQueryAtom)
  const { watchlistOnly } = useAtomValue(assetsFiltersAtom)
  const activeFilters = useAtomValue(activePanelFiltersCountAtom)
  const updateFilters = useSetAtom(updateAssetsFiltersAtom)
  const { data } = useAtomValue(assetsPageQueryAtom)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelId = useId()
  const closePanel = useCallback(() => setIsPanelOpen(false), [])

  useDismissOnOutsideInteraction(isPanelOpen, [wrapperRef], closePanel, false)

  useEffect(() => {
    if (!isPanelOpen) return

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') return

      closePanel()
      triggerRef.current?.focus()
    }

    document.addEventListener('keydown', onKeyDown)

    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isPanelOpen, closePanel])

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
      <div ref={wrapperRef}>
        <button
          ref={triggerRef}
          type="button"
          className={styles.outlinedButton}
          data-active={activeFilters > 0}
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
        <AssetsFiltersPanel
          id={panelId}
          hidden={!isPanelOpen}
          issuers={data?.issuers ?? []}
          chainIds={data?.chainIds ?? []}
        />
      </div>
      {activeFilters > 0 && (
        <button type="button" className={styles.clearButton} onClick={() => updateFilters(NO_PANEL_FILTERS)}>
          Clear
        </button>
      )}
    </>
  )
}
