import { atomWithStorage } from 'jotai/utils'

import { DEFAULT_DEADLINE_FROM_NOW } from '@cowprotocol/common-const'
import { atomWithPartialUpdate } from '@cowprotocol/common-utils'
import { getJotaiIsolatedStorage } from '@cowprotocol/core'

export interface YieldSettingsState {
  readonly showRecipient: boolean
  readonly deadline: number
}

export const defaultYieldSettings: YieldSettingsState = {
  showRecipient: false,
  deadline: DEFAULT_DEADLINE_FROM_NOW,
}

export const { atom: yieldSettingsAtom, updateAtom: updateYieldSettingsAtom } = atomWithPartialUpdate(
  atomWithStorage<YieldSettingsState>('yieldSettingsAtom:v0', defaultYieldSettings, getJotaiIsolatedStorage()),
)
