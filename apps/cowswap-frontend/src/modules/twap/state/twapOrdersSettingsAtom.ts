import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { getJotaiIsolatedStorage } from '@cowprotocol/core'
import { Percent } from '@uniswap/sdk-core'

import { Milliseconds } from 'types'

import { DEFAULT_NUM_OF_PARTS, DEFAULT_ORDER_DEADLINE, DEFAULT_TWAP_SLIPPAGE } from '../const'

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
}

export const defaultCustomDeadline: TwapOrdersDeadline['customDeadline'] = {
  hours: 0,
  minutes: 0,
}

export const defaultTwapOrdersSettings: TwapOrdersSettingsState = {
  // deadline
  isCustomDeadline: false,
  deadline: DEFAULT_ORDER_DEADLINE.value,
  customDeadline: defaultCustomDeadline,
  numberOfPartsValue: DEFAULT_NUM_OF_PARTS,
  // null = auto
  slippageValue: null,
  isFallbackHandlerSetupAccepted: false,
}

export const twapOrdersSettingsAtom = atomWithStorage<TwapOrdersSettingsState>(
  'twap-orders-settings-atom:v1',
  defaultTwapOrdersSettings,
  getJotaiIsolatedStorage(),
)

export const updateTwapOrdersSettingsAtom = atom(null, (get, set, nextState: Partial<TwapOrdersSettingsState>) => {
  set(twapOrdersSettingsAtom, () => {
    const prevState = get(twapOrdersSettingsAtom)

    return { ...prevState, ...nextState }
  })
})

export const twapOrderSlippageAtom = atom<Percent>((get) => {
  const { slippageValue } = get(twapOrdersSettingsAtom)

  return slippageValue != null
    ? // Multiplying on 100 to allow decimals values (e.g 0.05)
      new Percent(Math.round(slippageValue * 100), 10000)
    : DEFAULT_TWAP_SLIPPAGE
})
