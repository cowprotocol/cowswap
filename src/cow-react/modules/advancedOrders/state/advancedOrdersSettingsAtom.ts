import { atomWithStorage } from 'jotai/utils'
import { atom } from 'jotai'
import { Milliseconds, Timestamp } from '@cow/types'
import { defaultOrderDeadline } from '@cow/common/pure/DeadlineSelector/deadlines'

export enum SlippageError {
  InvalidInput = 'InvalidInput',
}

export interface AdvancedOrdersSettingsState {
  // deadline
  readonly deadlineMilliseconds: Milliseconds
  readonly customDeadlineTimestamp: Timestamp | null

  // no. of parts
  readonly numberOfParts: number

  // slippage
  readonly slippage: number | 'auto'
  readonly slippageError: SlippageError | null
}

export const defaultAdvancedOrdersSettings: AdvancedOrdersSettingsState = {
  // deadline
  deadlineMilliseconds: defaultOrderDeadline.value,
  customDeadlineTimestamp: null,

  // no. of parts
  numberOfParts: 1,

  // slippage
  slippage: 'auto',
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
