import { atomWithStorage } from 'jotai/utils'

import { DEFAULT_DEADLINE_FROM_NOW } from '@cowprotocol/common-const'
import { atomWithPartialUpdate } from '@cowprotocol/common-utils'
import { getJotaiIsolatedStorage } from '@cowprotocol/core'

export interface SwapSettingsState {
  readonly showRecipient: boolean
  readonly deadline: number
  readonly enablePartialApprovalBySettings: boolean
  // Fast path (out-of-competition execution) — staging test only, see cowprotocol/services#4883.
  readonly enableFastPath: boolean
}

export const defaultSwapSettings: SwapSettingsState = {
  showRecipient: false,
  deadline: DEFAULT_DEADLINE_FROM_NOW,
  enablePartialApprovalBySettings: true,
  enableFastPath: false,
}

export const { atom: swapSettingsAtom, updateAtom: updateSwapSettingsAtom } = atomWithPartialUpdate(
  atomWithStorage<SwapSettingsState>('swapSettingsAtom:v2', defaultSwapSettings, getJotaiIsolatedStorage()),
)
