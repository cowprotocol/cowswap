import { useAtomValue } from 'jotai'

import { Nullable, Command } from '@cowprotocol/common-const'

import { totalSurplusAtom, totalSurplusRefetchAtom } from './atoms'
import { TotalSurplusState } from './types'

export function useTotalSurplus(): TotalSurplusState {
  return useAtomValue(totalSurplusAtom)
}

export function useTriggerTotalSurplusUpdateCallback(): Nullable<Command> {
  return useAtomValue(totalSurplusRefetchAtom)
}
