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

  // no. of parts
  readonly numberOfPartsValue: number
  readonly numberOfPartsError: string | null

  // slippage
  readonly slippageValue: number | 'auto'
  readonly slippageError: string | null
}

export const defaultTwapOrdersSettings: TwapOrdersSettingsState = {
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

export const twapNumOfPartsAtom = atom((get) => {
  const { numberOfPartsValue, numberOfPartsError } = get(twapOrdersSettingsAtom)

  return { numberOfPartsValue, numberOfPartsError }
})
