'use client'

import { useAtomValue, useSetAtom } from 'jotai'
import { type ReactNode, type RefObject, useCallback, useEffect, useId, useRef, useState } from 'react'

import styles from './AssetsExplorer.module.css'
import { AssetsFiltersDrawer } from './AssetsFiltersDrawer'
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
import { assetsPageQueryAtom } from '../model/assetsQueryAtoms'

import { useDismissOnOutsideInteraction } from '@/shared/lib/dismiss'
import { SearchIcon } from '@/shared/ui/icons'

const PHONE_WIDTH_QUERY = '(max-width: 720px)'
const TABLET_WIDTH_QUERY = '(max-width: 960px)'

export function AssetsFilters(): ReactNode {
  const query = useAtomValue(assetsFilterQueryAtom)
  const setQuery = useSetAtom(setAssetsFilterQueryAtom)
  const { watchlistOnly } = useAtomValue(assetsFiltersAtom)
  const activeFilters = useAtomValue(activePanelFiltersCountAtom)
  const updateFilters = useSetAtom(updateAssetsFiltersAtom)
  const { data } = useAtomValue(assetsPageQueryAtom)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const isPhoneWidth = useMediaQuery(PHONE_WIDTH_QUERY)
  const isTabletWidth = useMediaQuery(TABLET_WIDTH_QUERY)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelId = useId()
  const closePanel = useCallback(() => setIsPanelOpen(false), [])
  const assetsCount = data && `${data.total} ${data.total === 1 ? 'asset' : 'assets'}`
  const issuers = data?.issuers ?? []
  const chainIds = data?.chainIds ?? []

  useDismissOnOutsideInteraction(isPanelOpen && !isPhoneWidth, [wrapperRef], closePanel, false)
  useCloseWithFocusOnTrigger(isPanelOpen, closePanel, triggerRef)

  return (
    <>
      <label className={styles.filterInput}>
        <SearchIcon />
        <input
          type="search"
          placeholder={isTabletWidth ? 'Search assets…' : 'Search assets or tickers…'}
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
      <div ref={wrapperRef} className={styles.filtersTrigger}>
        <button
          ref={triggerRef}
          type="button"
          className={`${styles.outlinedButton} ${styles.iconButton}`}
          data-active={activeFilters > 0}
          aria-expanded={isPanelOpen}
          aria-controls={isPhoneWidth && !isPanelOpen ? undefined : panelId}
          onClick={() => setIsPanelOpen((open) => !open)}
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
            id={panelId}
            isOpen={isPanelOpen}
            onOpenChange={setIsPanelOpen}
            triggerRef={triggerRef}
            assetsCount={assetsCount}
            issuers={issuers}
            chainIds={chainIds}
          />
        ) : (
          <AssetsFiltersPanel id={panelId} hidden={!isPanelOpen} issuers={issuers} chainIds={chainIds} />
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

/** Closes on Escape, which the drawer handles itself, and when the width crosses to the other surface */
function useCloseWithFocusOnTrigger(
  isOpen: boolean,
  close: () => void,
  triggerRef: RefObject<HTMLButtonElement | null>,
): void {
  useEffect(() => {
    if (!isOpen) return

    const query = window.matchMedia(PHONE_WIDTH_QUERY)
    const closeAndFocusTrigger = (): void => {
      close()
      triggerRef.current?.focus()
    }
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && !query.matches) closeAndFocusTrigger()
    }

    document.addEventListener('keydown', onKeyDown)
    query.addEventListener('change', closeAndFocusTrigger)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      query.removeEventListener('change', closeAndFocusTrigger)
    }
    // React commits between media query listeners, so `isDrawer` as a dependency would remove this one before it fires
  }, [isOpen, close, triggerRef])
}
