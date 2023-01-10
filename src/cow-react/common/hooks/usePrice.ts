import { useSafeMemo } from '@cow/common/hooks/useSafeMemo'
import { Currency, CurrencyAmount, Price } from '@uniswap/sdk-core'

export function usePrice(
  inputCurrencyAmount: CurrencyAmount<Currency> | null,
  outputCurrencyAmount: CurrencyAmount<Currency> | null
): Price<Currency, Currency> | null {
  return useSafeMemo(() => {
    if (!outputCurrencyAmount || !inputCurrencyAmount) return null
    return new Price({ baseAmount: inputCurrencyAmount, quoteAmount: outputCurrencyAmount })
  }, [inputCurrencyAmount, outputCurrencyAmount])
}
