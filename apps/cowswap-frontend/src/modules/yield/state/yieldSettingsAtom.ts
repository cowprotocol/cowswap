import { atomWithStorage } from 'jotai/utils'

import { getJotaiIsolatedStorage } from '@cowprotocol/core'

export interface YieldSettingsState {
  readonly showRecipient: boolean
  readonly partialFillsEnabled: boolean
}

export const defaultYieldSettings: YieldSettingsState = {
  showRecipient: false,
  partialFillsEnabled: true,
}

export const yieldSettingsAtom = atomWithStorage<YieldSettingsState>(
  'yieldSettingsAtom:v0',
  defaultYieldSettings,
  getJotaiIsolatedStorage(),
)
