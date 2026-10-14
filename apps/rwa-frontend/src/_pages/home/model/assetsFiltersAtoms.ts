import { atom } from 'jotai'

import { assetsPageAtom } from './assetsPageAtom'

import type { RwaAssetType } from '@/entities/asset'

import { debouncedTextAtoms } from '@/shared/lib/debounced-text'

const FILTER_DEBOUNCE_MS = 300

export interface AssetsFilters {
  /** `null` for all types */
  type: RwaAssetType | null
  issuer: string | null
  chainId: number | null
  watchlistOnly: boolean
}

export const assetsFiltersAtom = atom<AssetsFilters>({ type: null, issuer: null, chainId: null, watchlistOnly: false })

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
