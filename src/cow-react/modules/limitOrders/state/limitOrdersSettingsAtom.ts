import { atomWithStorage } from 'jotai/utils'
import { defaultLimitOrderDeadline } from '@cow/modules/limitOrders/containers/ExpiryDate/deadlines'
import { atom } from 'jotai'

export interface LimitOrdersSettingsState {
  readonly expertMode: boolean
  readonly showRecipient: boolean
  readonly deadline: number
}

export const limitOrdersSettingsAtom = atomWithStorage<LimitOrdersSettingsState>('limit-orders-settings-atom', {
  expertMode: false,
  showRecipient: false,
  deadline: defaultLimitOrderDeadline.value,
})

export const updateLimitOrdersSettingsAtom = atom(null, (get, set, nextState: Partial<LimitOrdersSettingsState>) => {
  set(limitOrdersSettingsAtom, () => {
    const prevState = get(limitOrdersSettingsAtom)

    return { ...prevState, ...nextState }
  })
})
