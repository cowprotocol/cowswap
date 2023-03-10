import { Currency, CurrencyAmount, Fraction, Percent, Price } from '@uniswap/sdk-core'
import { Nullish } from '@cow/types'
import tryParseCurrencyAmount from '@src/custom/lib/utils/tryParseCurrencyAmount'
import { FractionUtils } from '@cow/utils/fractionUtils'

const ONE = new Fraction(1)

export type CalculatePriceDifferenceParams = {
  reference: Nullish<Price<Currency, Currency>>
  delta: Nullish<Price<Currency, Currency>>
  isInverted: boolean
}

export type PriceDifference = {
  percentage: Percent
  amount: CurrencyAmount<Currency>
} | null

/**
 * Helper function to calculate Percent and amount difference between 2 Price instances
 *
 * Amount is the difference between prices in a CurrencyAmount instance.
 * The quote currency is used in regular cases and base currency when `isInverted` is set
 *
 * @param reference
 * @param delta
 * @param isInverted
 */
export function calculatePriceDifference({
  reference,
  delta,
  isInverted,
}: CalculatePriceDifferenceParams): PriceDifference {
  if (!delta || !reference) {
    return null
  }

  const percentageDifference = reference.divide(delta).subtract(ONE) // as Fraction
  const percentage = new Percent(percentageDifference.numerator, percentageDifference.denominator) // as Percent

  let amount
  // TODO: fix this mess
  // Why is this a mess? Long story...
  // Prices are just fancy fractions with reference to base and quote tokens
  // doing subtraction or addition on them won't work as you expect when decimals are different
  // Only way (that I could figure out so far) to get the raw price value without decimals
  // is to get their string representation
  // With that, I then convert them to numbers to get the actual price difference
  // Then convert them to a fancy CurrencyAmount instance again
  // But, if the amount is 0, tryParseCurrencyAmount returns undefined...
  // So in that case I create a instance using 0
  if (isInverted) {
    const r = +FractionUtils.fractionLikeToExactString(reference.invert())
    const d = +FractionUtils.fractionLikeToExactString(delta.invert())
    const a = String(r - d)
    amount =
      tryParseCurrencyAmount(a, reference.baseCurrency) || CurrencyAmount.fromRawAmount(reference.baseCurrency, '0')
  } else {
    const r = +FractionUtils.fractionLikeToExactString(reference)
    const d = +FractionUtils.fractionLikeToExactString(delta)
    const a = String(r - d)
    amount =
      tryParseCurrencyAmount(a, reference.quoteCurrency) || CurrencyAmount.fromRawAmount(reference.quoteCurrency, '0')
  }

  // TODO: remove debug logs
  console.debug(`calculatePriceDifference`, {
    pair: `${delta.quoteCurrency.symbol}/${delta.baseCurrency.symbol}`,
    marketPrice: `${delta.toFixed(7)} ${delta.baseCurrency.symbol} per ${delta.quoteCurrency.symbol}`,
    executionPrice: `${reference.toFixed(7)} ${reference.baseCurrency.symbol} per ${reference.quoteCurrency.symbol}`,
    difference: percentageDifference.toFixed(6),
    percentage: percentage.toFixed(6) + '%',
    regularDiff: reference.scalar.subtract(delta.scalar).toSignificant(5),
    invertedDiff: reference.invert().scalar.subtract(delta.invert().scalar).toSignificant(5),
    referenceScalar: reference.scalar.toSignificant(5),
    deltaScalar: delta.scalar.toSignificant(5),
    amount: amount?.toFixed(amount.currency.decimals),
  })

  return { percentage, amount }
}
