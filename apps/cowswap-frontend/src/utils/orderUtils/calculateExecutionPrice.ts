import { rawToTokenAmount } from '@cowprotocol/common-utils'
import { OrderKind } from '@cowprotocol/contracts'
import { Currency, CurrencyAmount, Fraction, Price } from '@uniswap/sdk-core'

import JSBI from 'jsbi'

export interface ExecutionPriceParams {
  inputCurrencyAmount: CurrencyAmount<Currency> | null
  outputCurrencyAmount: CurrencyAmount<Currency> | null
  feeAmount: CurrencyAmount<Currency> | null
  marketRate: Fraction | null
  orderKind: OrderKind
}

/**
 * Since tokens might have different decimals
 * For some cases we need to convert amount from one currency into another
 * For example, we have an amount to sell and price, and we want to get buying amount
 * 10 ETH (sell amount) * 2.5 = X USDC
 */
export function convertAmountToCurrency(
  amount: CurrencyAmount<Currency>,
  targetCurrency: Currency,
): CurrencyAmount<Currency> {
  const { numerator, denominator } = amount

  const inputDecimals = amount.currency.decimals
  const outputDecimals = targetCurrency.decimals

  if (inputDecimals === outputDecimals) {
    return CurrencyAmount.fromFractionalAmount(targetCurrency, numerator, denominator)
  }

  const decimalsDiff = Math.abs(inputDecimals - outputDecimals)
  const decimalsDiffAmount = rawToTokenAmount(1, decimalsDiff)

  const fixedNumerator =
    inputDecimals < outputDecimals
      ? JSBI.multiply(numerator, decimalsDiffAmount)
      : JSBI.divide(numerator, decimalsDiffAmount)

  return CurrencyAmount.fromFractionalAmount(targetCurrency, fixedNumerator, denominator)
}

export function calculateExecutionPrice(params: ExecutionPriceParams): Price<Currency, Currency> | null {
  const { inputCurrencyAmount, outputCurrencyAmount, feeAmount, marketRate } = params

  if (!inputCurrencyAmount || !outputCurrencyAmount || !feeAmount || !marketRate || inputCurrencyAmount.equalTo(0))
    return null

  if (inputCurrencyAmount.currency !== feeAmount.currency) return null

  const isInverted = marketRate.lessThan(1)
  const marketRateFixed = isInverted ? marketRate.invert() : marketRate
  /**
   * Since a user can specify an arbitrary price
   * And the specified price can be less than the market price
   * It doesn't make sense to display an execution price less than current market price
   * Because an order will always be filled by at least the current market price
   */
  const marketPriceRaw = new Price({
    baseAmount: inputCurrencyAmount,
    quoteAmount: convertAmountToCurrency(
      inputCurrencyAmount.subtract(feeAmount).multiply(marketRateFixed),
      outputCurrencyAmount.currency,
    ),
  })
  const marketPrice = isInverted ? marketPriceRaw.invert() : marketPriceRaw

  const currentPrice = new Price({
    baseAmount: inputCurrencyAmount.subtract(feeAmount),
    quoteAmount: outputCurrencyAmount,
  })

  return currentPrice.lessThan(marketPrice) ? marketPrice : currentPrice
}
