import { atomWithStorage } from 'jotai/utils'
import { atom } from 'jotai'
import { Milliseconds } from '@cow/types'
import { defaultOrderDeadline } from '@cow/common/pure/DeadlineSelector/deadlines'

export interface AdvancedOrdersSettingsState {
  // deadline
  readonly isCustomDeadline: boolean
  readonly deadline: Milliseconds
  readonly customDeadline: {
    hours: number
    minutes: number
  }

  // no. of parts
  readonly numberOfPartsValue: number
  readonly numberOfPartsError: string | null

  // slippage
  readonly slippageValue: number | 'auto'
  readonly slippageError: string | null
}

export const defaultAdvancedOrdersSettings: AdvancedOrdersSettingsState = {
  // deadline
  isCustomDeadline: false,
  deadline: defaultOrderDeadline.value,
  customDeadline: {
    hours: 0,
    minutes: 0,
  },

  // no. of parts
  numberOfPartsValue: 1,
  numberOfPartsError: null,

  // slippage
  slippageValue: 'auto',
  slippageError: null,
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
