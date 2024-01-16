import { atom } from 'jotai'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { twapOrdersSettingsAtom } from './twapOrdersSettingsAtom'

import { advancedOrdersDerivedStateAtom } from '../../advancedOrders'
import { DEFAULT_NUM_OF_PARTS } from '../const'

export interface PartsState {
  numberOfPartsValue: number | null
  inputPartAmount: CurrencyAmount<Currency> | null
  outputPartAmount: CurrencyAmount<Currency> | null
  inputFiatAmount: CurrencyAmount<Currency> | null
  outputFiatAmount: CurrencyAmount<Currency> | null
}

export const partsStateAtom = atom<PartsState>((get) => {
  const { numberOfPartsValue } = get(twapOrdersSettingsAtom)
  const { inputCurrencyAmount, outputCurrencyAmount, inputCurrencyFiatAmount, outputCurrencyFiatAmount } =
    get(advancedOrdersDerivedStateAtom)

  const divider = numberOfPartsValue || DEFAULT_NUM_OF_PARTS

  return {
    numberOfPartsValue,
    inputPartAmount: inputCurrencyAmount?.divide(divider) || null,
    outputPartAmount: outputCurrencyAmount?.divide(divider) || null,
    inputFiatAmount: inputCurrencyFiatAmount?.divide(divider) || null,
    outputFiatAmount: outputCurrencyFiatAmount?.divide(divider) || null,
  }
})
