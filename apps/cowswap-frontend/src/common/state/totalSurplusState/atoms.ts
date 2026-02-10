import { atom } from 'jotai'

import { TotalSurplusState } from './types'

export const totalSurplusAtom = atom<TotalSurplusState>({
  surplusAmount: null,
  isLoading: false,
  error: '',
})

/**
 * Global trigger atom for surplus cache invalidation
 * Increments when orders are fulfilled, causing SWR to refetch surplus data
 */
export const surplusInvalidationTriggerAtom = atom<number>(0)
