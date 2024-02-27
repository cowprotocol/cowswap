import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { getJotaiIsolatedStorage } from '@cowprotocol/core'

import { Milliseconds, Timestamp } from 'types'

import { defaultLimitOrderDeadline } from 'modules/limitOrders/pure/DeadlineSelector/deadlines'
import { partiallyFillableOverrideAtom } from 'modules/limitOrders/state/partiallyFillableOverride'

export interface LimitOrdersSettingsState {
  readonly showRecipient: boolean
  readonly partialFillsEnabled: boolean
  readonly deadlineMilliseconds: Milliseconds
  readonly customDeadlineTimestamp: Timestamp | null
}

export const defaultLimitOrdersSettings: LimitOrdersSettingsState = {
  showRecipient: false,
  partialFillsEnabled: true,
  deadlineMilliseconds: defaultLimitOrderDeadline.value,
  customDeadlineTimestamp: null,
}

export const limitOrdersSettingsAtom = atomWithStorage<LimitOrdersSettingsState>(
  'limit-orders-settings-atom:v2',
  defaultLimitOrdersSettings,
  getJotaiIsolatedStorage()
)

export const updateLimitOrdersSettingsAtom = atom(null, (get, set, nextState: Partial<LimitOrdersSettingsState>) => {
  set(limitOrdersSettingsAtom, () => {
    const prevState = get(limitOrdersSettingsAtom)

    if (nextState.partialFillsEnabled !== prevState.partialFillsEnabled) {
      // Whenever `partialFillsEnabled` changes, reset `partiallyFillableOverrideAtom`
      set(partiallyFillableOverrideAtom, undefined)
    }

    return { ...prevState, ...nextState }
  })
})
