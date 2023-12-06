import { atomWithStorage } from 'jotai/utils'

import { atomWithPartialUpdate } from '@cowprotocol/common-utils'

export interface SwapSettingsState {
  partiallyFillable: boolean
}

export const { atom: swapSettingsAtom, updateAtom: updateSwapSettingsAtom } = atomWithPartialUpdate(
  atomWithStorage<SwapSettingsState>('swapSettingsAtom:v1', {
    partiallyFillable: false,
  })
)
