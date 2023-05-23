import { atomWithStorage } from 'jotai/utils'
import { atom } from 'jotai'
import { Milliseconds } from 'types'
import { defaultOrderDeadline } from '../pure/DeadlineSelector/deadlines'

export interface TwapOrdersSettingsState {
  // deadline
  readonly isCustomDeadline: boolean
  readonly deadline: Milliseconds
  readonly customDeadline: {
    hours: number
    minutes: number
  }
  readonly numberOfPartsValue: number
  readonly slippageValue: number | null
}

export const defaultTwapOrdersSettings: TwapOrdersSettingsState = {
  // deadline
  isCustomDeadline: false,
  deadline: defaultOrderDeadline.value,
  customDeadline: {
    hours: 0,
    minutes: 0,
  },
  numberOfPartsValue: 1,
  // null = auto
  slippageValue: null,
}

export const twapOrdersSettingsAtom = atomWithStorage<TwapOrdersSettingsState>(
  'twap-orders-settings-atom:v1',
  defaultTwapOrdersSettings
)

export const updateTwapOrdersSettingsAtom = atom(null, (get, set, nextState: Partial<TwapOrdersSettingsState>) => {
  set(twapOrdersSettingsAtom, () => {
    const prevState = get(twapOrdersSettingsAtom)

    return { ...prevState, ...nextState }
  })
})
