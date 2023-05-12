import { useAtomValue } from 'jotai'
import { useAdvancedOrdersFullState } from '@cow/modules/advancedOrders/hooks/useAdvancedOrdersFullState'
import { advancedOrdersSettingsAtom } from '@cow/modules/advancedOrders/state/advancedOrdersSettingsAtom'
import { useMemo } from 'react'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

export function useNoOfParts() {
  const { numberOfParts } = useAtomValue(advancedOrdersSettingsAtom)

  return useMemo(() => ({ numberOfParts }), [numberOfParts])
}

type PartsOutput = {
  inputPartAmount: CurrencyAmount<Currency> | null
  outputPartAmount: CurrencyAmount<Currency> | null
}

export function usePartsValues(): PartsOutput {
  const { inputCurrencyAmount, outputCurrencyAmount, inputCurrency, outputCurrency } = useAdvancedOrdersFullState()
  const { numberOfParts } = useNoOfParts()

  return useMemo(() => {
    if (!inputCurrency || !outputCurrency) {
      return {
        inputPartAmount: null,
        outputPartAmount: null,
      }
    } else if (!numberOfParts || !inputCurrencyAmount || !outputCurrencyAmount) {
      return {
        inputPartAmount: CurrencyAmount.fromRawAmount(inputCurrency, 0),
        outputPartAmount: CurrencyAmount.fromRawAmount(outputCurrency, 0),
      }
    }
    return {
      inputPartAmount: inputCurrencyAmount?.divide(numberOfParts),
      outputPartAmount: outputCurrencyAmount?.divide(numberOfParts),
    }
  }, [numberOfParts, inputCurrencyAmount, outputCurrencyAmount, inputCurrency, outputCurrency])
}
