import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

export interface AdvancedOrdersSettingsState {
  readonly showRecipient: boolean
}

export const defaultAdvancedOrdersSettings: AdvancedOrdersSettingsState = {
  showRecipient: false,
}

export const advancedOrdersSettingsAtom = atomWithStorage<AdvancedOrdersSettingsState>(
  'advanced-orders-settings-atom:v0',
  defaultAdvancedOrdersSettings
)

export const updateAdvancedOrdersSettingsAtom = atom(
  null,
  (get, set, nextState: Partial<AdvancedOrdersSettingsState>) => {
    set(advancedOrdersSettingsAtom, () => {
      const prevState = get(advancedOrdersSettingsAtom)

      return { ...prevState, ...nextState }
    })
  }
)
