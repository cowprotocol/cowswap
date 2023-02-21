import { Currency, CurrencyAmount, Fraction, Price } from '@uniswap/sdk-core'
import { rawToTokenAmount } from '@cow/utils/rawToTokenAmount'
import { OrderKind } from '@cowprotocol/contracts'

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
  targetCurrency: Currency
): CurrencyAmount<Currency> {
  const { numerator, denominator } = amount

  const inputDecimals = amount.currency.decimals
  const outputDecimals = targetCurrency.decimals
  const decimalsDiff = Math.abs(inputDecimals - outputDecimals) || 1
  const decimalsDiffAmount = rawToTokenAmount(1, decimalsDiff)

  const targetAmount = CurrencyAmount.fromFractionalAmount(targetCurrency, numerator, denominator)

  if (inputDecimals < outputDecimals) {
    return targetAmount.multiply(decimalsDiffAmount)
  }

  return targetAmount.divide(decimalsDiffAmount)
}

export function calculateExecutionPrice(params: ExecutionPriceParams): Price<Currency, Currency> | null {
  const { inputCurrencyAmount, outputCurrencyAmount, feeAmount, marketRate, orderKind } = params

  if (!inputCurrencyAmount || !outputCurrencyAmount || !feeAmount || !marketRate) return null

  if (inputCurrencyAmount.currency !== feeAmount.currency) return null

  const isSellOrder = orderKind === OrderKind.SELL
  /**
   * Since a user can specify an arbitrary price
   * And the specified price can be less than the market price
   * It doesn't make sense to display an execution price less than current market price
   * Because an order will always be filled by at least the current market price
   */
  const marketPrice = new Price({
    baseAmount: inputCurrencyAmount,
    quoteAmount: convertAmountToCurrency(
      isSellOrder
        ? inputCurrencyAmount.multiply(marketRate).subtract(feeAmount)
        : inputCurrencyAmount.multiply(marketRate).add(feeAmount),
      outputCurrencyAmount.currency
    ),
  })

  const currentPrice = new Price({
    baseAmount: isSellOrder ? inputCurrencyAmount.subtract(feeAmount) : inputCurrencyAmount.add(feeAmount),
    quoteAmount: outputCurrencyAmount,
  })

  return currentPrice.lessThan(marketPrice) ? marketPrice : currentPrice
}
