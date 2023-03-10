import { Currency, CurrencyAmount, Fraction, Percent, Price } from '@uniswap/sdk-core'
import { Nullish } from '@cow/types'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'

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

  // as Fraction
  const amountDifference = isInverted
    ? // If it's inverted in the UI, invert here as well to get the amounts in the new quote token
      reference.invert().subtract(delta.invert())
    : reference.subtract(delta)
  const amount = tryParseCurrencyAmount(amountDifference.toFixed(18), delta.quoteCurrency) // as CurrencyAmount

  // TODO: remove debug logs
  console.debug(`calculatePriceDifference`, {
    pair: `${delta.quoteCurrency.symbol}/${delta.baseCurrency.symbol}`,
    marketPrice: `${delta.toFixed(7)} ${delta.baseCurrency.symbol} per ${delta.quoteCurrency.symbol}`,
    executionPrice: `${reference.toFixed(7)} ${reference.baseCurrency.symbol} per ${reference.quoteCurrency.symbol}`,
    difference: percentageDifference.toFixed(6),
    percentage: percentage.toFixed(6) + '%',
    amount: amount?.toFixed(amount.currency.decimals),
  })

  return { percentage, amount }
}
