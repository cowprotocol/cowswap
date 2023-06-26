import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { Percent } from '@uniswap/sdk-core'

import { Milliseconds } from 'types'

import { DEFAULT_TWAP_SLIPPAGE, defaultNumOfParts, defaultOrderDeadline } from '../const'

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
  readonly isFallbackHandlerSetupAccepted: boolean
  readonly isPriceImpactAccepted: boolean
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
  isFallbackHandlerSetupAccepted: false,
  isPriceImpactAccepted: false,
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

export const twapOrderSlippage = atom<Percent>((get) => {
  const { slippageValue } = get(twapOrdersSettingsAtom)

  return slippageValue != null
    ? // Multiplying on 100 to allow decimals values (e.g 0.05)
      new Percent(slippageValue * 100, 10000)
    : DEFAULT_TWAP_SLIPPAGE
})
