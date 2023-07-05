import { atom } from 'jotai'

import { TotalSurplusState } from './types'

export const totalSurplusAtom = atom<TotalSurplusState>({
  surplusAmount: null,
  isLoading: false,
  error: '',
  refetch: null,
})

export const totalSurplusRefetchAtom = atom((get) => get(totalSurplusAtom).refetch)
