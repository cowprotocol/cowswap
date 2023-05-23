import { atom } from 'jotai'
import { twapOrdersSettingsAtom } from './twapOrdersSettingsAtom'
import { advancedOrdersDerivedStateAtom } from '../../advancedOrders'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

export interface PartsState {
  inputPartAmount: CurrencyAmount<Currency> | null
  outputPartAmount: CurrencyAmount<Currency> | null
  inputFiatAmount: CurrencyAmount<Currency> | null
  outputFiatAmount: CurrencyAmount<Currency> | null
}

export const partsStateAtom = atom<PartsState>((get) => {
  const { numberOfPartsValue } = get(twapOrdersSettingsAtom)
  const { inputCurrencyAmount, outputCurrencyAmount, inputCurrencyFiatAmount, outputCurrencyFiatAmount } =
    get(advancedOrdersDerivedStateAtom)

  const divider = numberOfPartsValue || 1

  return {
    inputPartAmount: inputCurrencyAmount?.divide(divider) || null,
    outputPartAmount: outputCurrencyAmount?.divide(divider) || null,
    inputFiatAmount: inputCurrencyFiatAmount?.divide(divider) || null,
    outputFiatAmount: outputCurrencyFiatAmount?.divide(divider) || null,
  }
})
