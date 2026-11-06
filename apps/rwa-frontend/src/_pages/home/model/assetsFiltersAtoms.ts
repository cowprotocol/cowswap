import { atom } from 'jotai'
import { atomWithStorage, createJSONStorage } from 'jotai/utils'

import { assetsPageAtom } from './assetsPageAtom'

import { type AssetsFilters, parseAssetsFilters } from '../lib/parseAssetsFilters'

import { debouncedTextAtoms } from '@/shared/lib/debounced-text'

const FILTER_DEBOUNCE_MS = 300

export type PanelFilters = Pick<AssetsFilters, 'issuers' | 'chainIds' | 'minMarketCap' | 'minVolume24h'>

export const NO_PANEL_FILTERS: PanelFilters = { issuers: [], chainIds: [], minMarketCap: null, minVolume24h: null }

const jsonStorage = createJSONStorage<AssetsFilters>()

export const assetsFiltersAtom = atomWithStorage<AssetsFilters>(
  'rwaAssetsFilters:v1',
  { type: null, ...NO_PANEL_FILTERS, watchlistOnly: false },
  {
    ...jsonStorage,
    getItem: (key, initialValue) => parseAssetsFilters(jsonStorage.getItem(key, initialValue), initialValue),
  },
)

/** Filters of the panel that are set, one per kind */
export const activePanelFiltersCountAtom = atom((get) => {
  const { issuers, chainIds, minMarketCap, minVolume24h } = get(assetsFiltersAtom)

  return [issuers.length > 0, chainIds.length > 0, minMarketCap !== null, minVolume24h !== null].filter(Boolean).length
})

export const updateAssetsFiltersAtom = atom(null, (get, set, update: Partial<AssetsFilters>) => {
  set(assetsFiltersAtom, { ...get(assetsFiltersAtom), ...update })
  set(assetsPageAtom, 1)
})

const filterQueryAtoms = debouncedTextAtoms(FILTER_DEBOUNCE_MS)

export const assetsFilterQueryAtom = filterQueryAtoms.valueAtom

export const debouncedAssetsFilterQueryAtom = filterQueryAtoms.debouncedValueAtom

export const setAssetsFilterQueryAtom = atom(null, (_get, set, query: string) => {
  set(filterQueryAtoms.setValueAtom, query)
  set(assetsPageAtom, 1)
})
