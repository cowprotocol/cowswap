import { useAtomValue } from 'jotai'

import { totalSurplusAtom, totalSurplusRefetchAtom } from './atoms'
import { TotalSurplusState } from './types'

export function useTotalSurplus(): TotalSurplusState {
  return useAtomValue(totalSurplusAtom)
}

export function useTriggerTotalSurplusUpdateCallback(): (() => void) | null {
  return useAtomValue(totalSurplusRefetchAtom)
}
