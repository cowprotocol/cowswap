import { Currency, CurrencyAmount, Price } from '@uniswap/sdk-core'
import { isFractionFalsy } from '@cow/utils/isFractionFalsy'

export function buildPriceFromCurrencyAmounts(
  inputCurrencyAmount: CurrencyAmount<Currency>,
  outputCurrencyAmount: CurrencyAmount<Currency>
): Price<Currency, Currency>
export function buildPriceFromCurrencyAmounts(
  inputCurrencyAmount: CurrencyAmount<Currency> | null,
  outputCurrencyAmount: CurrencyAmount<Currency> | null
): Price<Currency, Currency> | null
export function buildPriceFromCurrencyAmounts(
  inputCurrencyAmount: CurrencyAmount<Currency> | null,
  outputCurrencyAmount: CurrencyAmount<Currency> | null
): Price<Currency, Currency> | null {
  if (
    !inputCurrencyAmount ||
    !outputCurrencyAmount ||
    isFractionFalsy(inputCurrencyAmount) ||
    isFractionFalsy(outputCurrencyAmount)
  ) {
    return null
  }

  return new Price({ baseAmount: inputCurrencyAmount, quoteAmount: outputCurrencyAmount })
}
