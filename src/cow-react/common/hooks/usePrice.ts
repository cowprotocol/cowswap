import { useSafeMemo } from '@cow/common/hooks/useSafeMemo'
import { Currency, CurrencyAmount, Price } from '@uniswap/sdk-core'
import { isFractionFalsy } from '@cow/utils/isFractionFalsy'

export function usePrice(
  inputCurrencyAmount: CurrencyAmount<Currency> | null,
  outputCurrencyAmount: CurrencyAmount<Currency> | null
): Price<Currency, Currency> | null {
  return useSafeMemo(() => {
    if (
      !inputCurrencyAmount ||
      !outputCurrencyAmount ||
      isFractionFalsy(inputCurrencyAmount) ||
      isFractionFalsy(outputCurrencyAmount)
    ) {
      return null
    }

    return new Price({ baseAmount: inputCurrencyAmount, quoteAmount: outputCurrencyAmount })
  }, [inputCurrencyAmount, outputCurrencyAmount])
}
