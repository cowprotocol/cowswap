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
  inputFiatAmount: CurrencyAmount<Currency> | null
  outputFiatAmount: CurrencyAmount<Currency> | null
}

export function usePartsValues(): PartsOutput {
  const {
    inputCurrencyAmount,
    outputCurrencyAmount,
    inputCurrency,
    outputCurrency,
    inputCurrencyFiatAmount,
    outputCurrencyFiatAmount,
  } = useAdvancedOrdersFullState()
  const { numberOfParts } = useNoOfParts()

  return useMemo(() => {
    const output: PartsOutput = {
      inputPartAmount: null,
      outputPartAmount: null,
      inputFiatAmount: null,
      outputFiatAmount: null,
    }

    if (inputCurrency && outputCurrency) {
      output.inputPartAmount = CurrencyAmount.fromRawAmount(inputCurrency, 0)
      output.outputPartAmount = CurrencyAmount.fromRawAmount(outputCurrency, 0)
    }

    if (inputCurrencyAmount && outputCurrencyAmount && numberOfParts) {
      output.inputPartAmount = inputCurrencyAmount.divide(numberOfParts)
      output.outputPartAmount = outputCurrencyAmount.divide(numberOfParts)
    }

    if (inputCurrencyFiatAmount && outputCurrencyFiatAmount && numberOfParts) {
      output.inputFiatAmount = inputCurrencyFiatAmount.divide(numberOfParts)
      output.outputFiatAmount = outputCurrencyFiatAmount.divide(numberOfParts)
    }

    return output
  }, [
    numberOfParts,
    inputCurrencyAmount,
    outputCurrencyAmount,
    inputCurrency,
    outputCurrency,
    inputCurrencyFiatAmount,
    outputCurrencyFiatAmount,
  ])
}
