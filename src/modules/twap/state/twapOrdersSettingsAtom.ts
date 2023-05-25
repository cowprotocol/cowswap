import { atomWithStorage } from 'jotai/utils'
import { atom } from 'jotai'
import { Milliseconds } from 'types'
import { defaultNumOfParts, defaultOrderDeadline } from '../const'

export interface TwapOrdersDeadline {
  readonly isCustomDeadline: boolean
  readonly deadline: Milliseconds
  readonly customDeadline: {
    hours: number
    minutes: number
  }
}

export interface TwapOrdersSettingsState extends TwapOrdersDeadline {
  readonly numberOfPartsValue: number
  readonly slippageValue: number | null
}

export const defaultCustomDeadline: TwapOrdersDeadline['customDeadline'] = {
  hours: 0,
  minutes: 0,
}

export const defaultTwapOrdersSettings: TwapOrdersSettingsState = {
  // deadline
  isCustomDeadline: false,
  deadline: defaultOrderDeadline.value,
  customDeadline: defaultCustomDeadline,
  numberOfPartsValue: defaultNumOfParts,
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
