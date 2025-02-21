import { atomWithStorage } from 'jotai/utils'

import { DEFAULT_DEADLINE_FROM_NOW } from '@cowprotocol/common-const'
import { atomWithPartialUpdate } from '@cowprotocol/common-utils'
import { getJotaiIsolatedStorage } from '@cowprotocol/core'

export interface SwapSettingsState {
  readonly showRecipient: boolean
  readonly deadline: number
}

export const defaultSwapSettings: SwapSettingsState = {
  showRecipient: false,
  deadline: DEFAULT_DEADLINE_FROM_NOW,
}

export const { atom: swapSettingsAtom, updateAtom: updateSwapSettingsAtom } = atomWithPartialUpdate(
  atomWithStorage<SwapSettingsState>('swapSettingsAtom:v0', defaultSwapSettings, getJotaiIsolatedStorage()),
)
