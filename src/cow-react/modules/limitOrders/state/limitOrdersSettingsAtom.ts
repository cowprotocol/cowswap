import { atomWithStorage } from 'jotai/utils'

export interface LimitOrdersSettingsState {
  readonly expertMode: boolean
  readonly showRecipient: boolean
}

export const limitOrdersSettingsAtom = atomWithStorage<LimitOrdersSettingsState>('limit-orders-settings-atom', {
  expertMode: false,
  showRecipient: false,
})
