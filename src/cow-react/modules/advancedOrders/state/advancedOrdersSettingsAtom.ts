import { atomWithStorage } from 'jotai/utils'
import { atom } from 'jotai'
import { Milliseconds, Timestamp } from '@cow/types'
import { defaultOrderDeadline } from '@cow/common/pure/DeadlineSelector/deadlines'

export interface AdvancedOrdersSettingsState {
  readonly deadlineMilliseconds: Milliseconds
  readonly customDeadlineTimestamp: Timestamp | null
}

export const defaultAdvancedOrdersSettings: AdvancedOrdersSettingsState = {
  deadlineMilliseconds: defaultOrderDeadline.value,
  customDeadlineTimestamp: null,
}

export const advancedOrdersSettingsAtom = atomWithStorage<AdvancedOrdersSettingsState>(
  'advanced-orders-settings-atom:v2',
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
