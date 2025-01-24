import { Currency, CurrencyAmount, Price } from '@uniswap/sdk-core'

export function calculateRateForAmount(
  isBuyAmountChange: boolean,
  amount: CurrencyAmount<Currency> | null,
  inputCurrencyAmount: CurrencyAmount<Currency> | null,
  outputCurrencyAmount: CurrencyAmount<Currency> | null,
): Price<Currency, Currency> | null {
  if (!amount) {
    return null
  }

  if (isBuyAmountChange) {
    return (
      inputCurrencyAmount &&
      new Price(inputCurrencyAmount.currency, amount.currency, inputCurrencyAmount.quotient, amount.quotient)
    )
  } else {
    return (
      outputCurrencyAmount &&
      new Price(amount.currency, outputCurrencyAmount.currency, amount.quotient, outputCurrencyAmount.quotient)
    )
  }
}
