'use client'

import { useAtomValue, useSetAtom } from 'jotai'
import { type ReactNode, useCallback, useId, useRef, useState } from 'react'

import dynamic from 'next/dynamic'

import styles from './AssetsExplorer.module.css'
import { AssetsFiltersPanel } from './AssetsFiltersPanel'
import { StarIcon } from './StarIcon'
import { FilterIcon } from './ToolbarIcons'

import { useMediaQuery } from '../lib/useMediaQuery'
import {
  activePanelFiltersCountAtom,
  assetsFilterQueryAtom,
  assetsFiltersAtom,
  NO_PANEL_FILTERS,
  setAssetsFilterQueryAtom,
  updateAssetsFiltersAtom,
} from '../model/assetsFiltersAtoms'
import { assetsCountLabelAtom } from '../model/assetsQueryAtoms'

import { MEDIA_QUERIES } from '@/shared/config'
import { useDismissOnEscape, useDismissOnMediaQueryChange, useDismissOnOutsideInteraction } from '@/shared/lib/dismiss'
import { SearchIcon } from '@/shared/ui/icons'

const AssetsFiltersDrawer = dynamic(
  () => import('./AssetsFiltersDrawer').then((module) => module.AssetsFiltersDrawer),
  {
    ssr: false,
  },
)

export function AssetsFilters(): ReactNode {
  const query = useAtomValue(assetsFilterQueryAtom)
  const setQuery = useSetAtom(setAssetsFilterQueryAtom)
  const { watchlistOnly } = useAtomValue(assetsFiltersAtom)
  const activeFilters = useAtomValue(activePanelFiltersCountAtom)
  const updateFilters = useSetAtom(updateAssetsFiltersAtom)
  const assetsCount = useAtomValue(assetsCountLabelAtom)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const isPhoneWidth = useMediaQuery(MEDIA_QUERIES.upToSmall)
  const searchPlaceholder = useSearchPlaceholder()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const filtersId = useId()
  const isPopoverOpen = isFiltersOpen && !isPhoneWidth
  const closeFilters = useCallback(() => setIsFiltersOpen(false), [])
  const closeAndFocusTrigger = useCallback(() => {
    setIsFiltersOpen(false)
    triggerRef.current?.focus()
  }, [])

  useDismissOnOutsideInteraction(isPopoverOpen, [wrapperRef], closeFilters, false)
  useDismissOnEscape(isPopoverOpen, closeFilters, triggerRef)
  // Not `isPopoverOpen`: React commits between media query listeners, which would remove this one before it fires
  useDismissOnMediaQueryChange(isFiltersOpen, MEDIA_QUERIES.upToSmall, closeAndFocusTrigger)

  return (
    <>
      <label className={styles.filterInput}>
        <SearchIcon />
        <input
          type="search"
          placeholder={searchPlaceholder}
          aria-label="Search assets"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <span className={styles.visuallyHidden} role="status">
        {assetsCount}
      </span>
      <button
        type="button"
        className={`${styles.outlinedButton} ${styles.iconButton}`}
        aria-pressed={watchlistOnly}
        onClick={() => updateFilters({ watchlistOnly: !watchlistOnly })}
      >
        <StarIcon filled={watchlistOnly} />
        <span className={styles.buttonLabel}>Watchlist</span>
      </button>
      <div ref={wrapperRef}>
        <button
          ref={triggerRef}
          type="button"
          className={`${styles.outlinedButton} ${styles.iconButton}`}
          data-active={activeFilters > 0}
          aria-expanded={isFiltersOpen}
          aria-controls={isFiltersOpen ? filtersId : undefined}
          onClick={() => setIsFiltersOpen((isOpen) => !isOpen)}
        >
          <FilterIcon />
          <span className={styles.buttonLabel}>Filters</span>
          {activeFilters > 0 && (
            <span className={styles.filtersCount}>
              {activeFilters}
              <span className={styles.visuallyHidden}> active</span>
            </span>
          )}
        </button>
        {isPhoneWidth ? (
          <AssetsFiltersDrawer
            id={filtersId}
            isOpen={isFiltersOpen}
            onOpenChange={setIsFiltersOpen}
            triggerRef={triggerRef}
          />
        ) : (
          <AssetsFiltersPanel id={filtersId} hidden={!isFiltersOpen} />
        )}
      </div>
      {activeFilters > 0 && (
        <button
          type="button"
          className={styles.clearButton}
          onClick={() => updateFilters({ ...NO_PANEL_FILTERS, type: null })}
        >
          Clear
        </button>
      )}
    </>
  )
}

function useSearchPlaceholder(): string {
  const isTinyWidth = useMediaQuery(MEDIA_QUERIES.upToTiny)
  const isTabletWidth = useMediaQuery(MEDIA_QUERIES.upToMedium)

  if (isTinyWidth) return 'Search…'

  return isTabletWidth ? 'Search assets…' : 'Search assets or tickers…'
}
