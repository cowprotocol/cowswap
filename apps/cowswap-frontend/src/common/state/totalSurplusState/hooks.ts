import { useAtomValue } from 'jotai'

import { Command } from '@cowprotocol/types'

import { totalSurplusAtom, totalSurplusRefetchAtom } from './atoms'
import { TotalSurplusState } from './types'

export function useTotalSurplus(): TotalSurplusState {
  return useAtomValue(totalSurplusAtom)
}

export function useTriggerTotalSurplusUpdateCallback(): Command | null {
  return useAtomValue(totalSurplusRefetchAtom)
}
