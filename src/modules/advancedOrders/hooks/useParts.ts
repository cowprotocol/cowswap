import { useAtomValue } from 'jotai'
import { useAdvancedOrdersFullState } from 'modules/advancedOrders/hooks/useAdvancedOrdersFullState'
import { advancedOrdersSettingsAtom } from 'modules/advancedOrders/state/advancedOrdersSettingsAtom'
import { useMemo } from 'react'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

export function useNoOfParts() {
  const { numberOfPartsValue, numberOfPartsError } = useAtomValue(advancedOrdersSettingsAtom)
  return { numberOfPartsValue, numberOfPartsError }
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
  const { numberOfPartsValue } = useNoOfParts()

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

    if (inputCurrencyAmount && outputCurrencyAmount && numberOfPartsValue) {
      output.inputPartAmount = inputCurrencyAmount.divide(numberOfPartsValue)
      output.outputPartAmount = outputCurrencyAmount.divide(numberOfPartsValue)
    }

    if (inputCurrencyFiatAmount && outputCurrencyFiatAmount && numberOfPartsValue) {
      output.inputFiatAmount = inputCurrencyFiatAmount.divide(numberOfPartsValue)
      output.outputFiatAmount = outputCurrencyFiatAmount.divide(numberOfPartsValue)
    }

    return output
  }, [
    numberOfPartsValue,
    inputCurrencyAmount,
    outputCurrencyAmount,
    inputCurrency,
    outputCurrency,
    inputCurrencyFiatAmount,
    outputCurrencyFiatAmount,
  ])
}
