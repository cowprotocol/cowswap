import { atom, Getter, Setter } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { getJotaiIsolatedStorage } from '@cowprotocol/core'

import { Milliseconds, Timestamp } from 'types'

import { defaultLimitOrderDeadline } from 'modules/limitOrders/pure/DeadlineSelector/deadlines'
import { partiallyFillableOverrideAtom } from 'modules/limitOrders/state/partiallyFillableOverride'
import {
  alternativeOrderAtomSetterFactory,
  alternativeOrderReadWriteAtomFactory,
} from 'modules/trade/state/alternativeOrder'

export interface LimitOrdersSettingsState {
  readonly showRecipient: boolean
  readonly partialFillsEnabled: boolean
  readonly deadlineMilliseconds: Milliseconds
  readonly customDeadlineTimestamp: Timestamp | null
  readonly limitPricePosition: 'top' | 'between' | 'bottom'
  readonly limitPriceLocked: boolean
  readonly ordersTableOnLeft: boolean
  readonly isUsdValuesMode: boolean
}

export const defaultLimitOrdersSettings: LimitOrdersSettingsState = {
  showRecipient: false,
  partialFillsEnabled: true,
  deadlineMilliseconds: defaultLimitOrderDeadline.value,
  customDeadlineTimestamp: null,
  limitPricePosition: 'bottom',
  limitPriceLocked: true,
  ordersTableOnLeft: false,
  isUsdValuesMode: false,
}

// regular
const regularLimitOrdersSettingsAtom = atomWithStorage<LimitOrdersSettingsState>(
  'limit-orders-settings-atom:v3',
  defaultLimitOrdersSettings,
  getJotaiIsolatedStorage(),
)
const regularUpdateLimitOrdersSettingsAtom = atom(
  null,
  partialFillsOverrideSetterFactory(regularLimitOrdersSettingsAtom),
)

// alternative
const alternativeLimitOrdersSettingsAtom = atom<LimitOrdersSettingsState>(defaultLimitOrdersSettings)
const alternativeUpdateLimitOrdersSettingsAtom = atom(
  null,
  partialFillsOverrideSetterFactory(alternativeLimitOrdersSettingsAtom),
)

// export
export const limitOrdersSettingsAtom = alternativeOrderReadWriteAtomFactory(
  regularLimitOrdersSettingsAtom,
  alternativeLimitOrdersSettingsAtom,
)
export const updateLimitOrdersSettingsAtom = atom(
  null,
  alternativeOrderAtomSetterFactory(regularUpdateLimitOrdersSettingsAtom, alternativeUpdateLimitOrdersSettingsAtom),
)

// utils

function partialFillsOverrideSetterFactory(
  atomToUpdate: typeof regularLimitOrdersSettingsAtom | typeof alternativeLimitOrdersSettingsAtom,
) {
  return (get: Getter, set: Setter, nextState: Partial<LimitOrdersSettingsState>) => {
    set(atomToUpdate, () => {
      const prevState = get(atomToUpdate)

      if (nextState.partialFillsEnabled !== prevState.partialFillsEnabled) {
        // Whenever `partialFillsEnabled` changes, reset `partiallyFillableOverrideAtom`
        set(partiallyFillableOverrideAtom, undefined)
      }

      return { ...prevState, ...nextState }
    })
  }
}
