import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { getJotaiIsolatedStorage } from '@cowprotocol/core'
import { Percent } from '@cowprotocol/currency'

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

/** Keep at most two decimal places by cutting extra digits (`10.129` → `10.12`). */
export function truncateSlippageToHundredths(slippageValue: number): number {
  const [whole, fraction = ''] = slippageValue.toString().split('.')
  const hundredths = fraction.slice(0, 2).padEnd(2, '0')

  return Number(whole) * 100 + Number(hundredths)
}

export const updateTwapOrdersSettingsAtom = atom(null, (get, set, nextState: Partial<TwapOrdersSettingsState>) => {
  set(twapOrdersSettingsAtom, () => {
    const prevState = get(twapOrdersSettingsAtom)

    return { ...prevState, ...nextState }
  })
})

export const twapOrderSlippageAtom = atom<Percent>((get) => {
  const { slippageValue } = get(twapOrdersSettingsAtom)

  return slippageValue != null
    ? // Hundredths allow two decimals (e.g. 0.05). Extra digits are truncated, not rounded.
      new Percent(truncateSlippageToHundredths(slippageValue), 10000)
    : DEFAULT_TWAP_SLIPPAGE
})
