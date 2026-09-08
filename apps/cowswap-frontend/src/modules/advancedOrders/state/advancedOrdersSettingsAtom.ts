import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { getJotaiIsolatedStorage, migrateLocalStorageKey } from '@cowprotocol/core'

export interface AdvancedOrdersSettingsState {
  readonly showRecipient: boolean
  readonly enablePartialApprovalBySettings: boolean
}

export const defaultAdvancedOrdersSettings: AdvancedOrdersSettingsState = {
  showRecipient: false,
  enablePartialApprovalBySettings: true,
}

migrateLocalStorageKey<AdvancedOrdersSettingsState>(
  'advanced-orders-settings-atom:v0',
  'advanced-orders-settings-atom:v1',
  { enablePartialApprovalBySettings: true },
)

export const advancedOrdersSettingsAtom = atomWithStorage<AdvancedOrdersSettingsState>(
  'advanced-orders-settings-atom:v1',
  defaultAdvancedOrdersSettings,
  getJotaiIsolatedStorage(),
)

export const updateAdvancedOrdersSettingsAtom = atom(
  null,
  (get, set, nextState: Partial<AdvancedOrdersSettingsState>) => {
    set(advancedOrdersSettingsAtom, () => {
      const prevState = get(advancedOrdersSettingsAtom)

      return { ...prevState, ...nextState }
    })
  },
)
