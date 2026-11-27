import { atom } from 'jotai'
import { atomWithStorage, createJSONStorage } from 'jotai/utils'

import { assetsPageAtom } from './assetsPageAtom'
import { DEFAULT_ASSETS_FILTERS, NO_PANEL_FILTERS, type PanelFilters } from './assetsPageQuery'

import { type AssetsFilters, parseAssetsFilters } from '../lib/parseAssetsFilters'

import { trackEvent } from '@/shared/lib/analytics'
import { debouncedTextAtoms } from '@/shared/lib/debounced-text'

export { NO_PANEL_FILTERS, type PanelFilters }

const FILTER_DEBOUNCE_MS = 300

const ASSETS_FILTERS_STORAGE_KEY = 'rwaAssetsFilters:v1'

const jsonStorage = createJSONStorage<AssetsFilters>()

const filtersStorage: typeof jsonStorage = {
  ...jsonStorage,
  getItem: (key, initialValue) => parseAssetsFilters(jsonStorage.getItem(key, initialValue), initialValue),
}

export const assetsFiltersAtom = atomWithStorage<AssetsFilters>(
  ASSETS_FILTERS_STORAGE_KEY,
  DEFAULT_ASSETS_FILTERS,
  filtersStorage,
)

export function readStoredAssetsFilters(): AssetsFilters {
  return filtersStorage.getItem(ASSETS_FILTERS_STORAGE_KEY, DEFAULT_ASSETS_FILTERS)
}

/** Filters of the panel that are set, one per kind */
export const activePanelFiltersCountAtom = atom((get) => {
  const { issuers, chainIds, minMarketCap, minVolume24h } = get(assetsFiltersAtom)

  return [issuers.length > 0, chainIds.length > 0, minMarketCap !== null, minVolume24h !== null].filter(Boolean).length
})

export const updateAssetsFiltersAtom = atom(null, (get, set, update: Partial<AssetsFilters>) => {
  const filters = { ...get(assetsFiltersAtom), ...update }

  set(assetsFiltersAtom, filters)
  set(assetsPageAtom, 1)
  trackFiltersChange(filters, Object.keys(update))
})

const filterQueryAtoms = debouncedTextAtoms(FILTER_DEBOUNCE_MS)

export const assetsFilterQueryAtom = filterQueryAtoms.valueAtom

export const debouncedAssetsFilterQueryAtom = filterQueryAtoms.debouncedValueAtom

export const setAssetsFilterQueryAtom = atom(null, (_get, set, query: string) => {
  set(filterQueryAtoms.setValueAtom, query)
  set(assetsPageAtom, 1)
})

function trackFiltersChange(filters: AssetsFilters, changed: string[]): void {
  const { type, issuers, chainIds, minMarketCap, minVolume24h, watchlistOnly } = filters

  trackEvent('assets_filter_change', {
    changed: changed.join(','),
    type,
    issuers: issuers.length ? issuers.join(',') : null,
    chainIds: chainIds.length ? chainIds.join(',') : null,
    minMarketCap,
    minVolume24h,
    watchlistOnly,
  })
}
