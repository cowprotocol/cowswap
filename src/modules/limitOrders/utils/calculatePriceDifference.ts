import { Currency, CurrencyAmount, Fraction, Percent, Price } from '@uniswap/sdk-core'
import { Nullish } from 'types'
import { assertSameMarket } from 'common/utils/markets'
import { FractionUtils } from 'utils/fractionUtils'
import { adjustDecimalsAtoms } from './calculateAmountForRate'
import { ZERO_FRACTION } from 'legacy/constants'

const ONE = new Fraction(1)

export type CalculatePriceDifferenceParams = {
  referencePrice: Nullish<Price<Currency, Currency>>
  targetPrice: Nullish<Price<Currency, Currency>>
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
 * @param referencePrice
 * @param targetPrice
 * @param isInverted
 */
export function calculatePriceDifference({
  referencePrice,
  targetPrice,
  isInverted,
}: CalculatePriceDifferenceParams): PriceDifference {
  if (!targetPrice || !referencePrice) {
    return null
  }

  // Make sure we are comparing apples with apples (prices should refer to market)
  assertSameMarket(referencePrice, targetPrice)

  if (
    referencePrice.equalTo(ZERO_FRACTION) || // The reference cannot be zero (infinite relative difference)
    referencePrice.lessThan(ZERO_FRACTION) || // The prices can't be negative
    targetPrice.lessThan(ZERO_FRACTION) || // The prices can't be negative
    targetPrice.equalTo(ZERO_FRACTION) // We can't calculate a difference if target is zero
  ) {
    return null
  }

  if (isInverted) {
    return calculatePriceDifferenceAux({
      referencePrice: referencePrice.invert(),
      targetPrice: targetPrice.invert(),
    })
  } else {
    return calculatePriceDifferenceAux({
      referencePrice,
      targetPrice,
    })
  }
}

function calculatePriceDifferenceAux({
  referencePrice,
  targetPrice,
}: {
  referencePrice: Price<Currency, Currency>
  targetPrice: Price<Currency, Currency>
}): PriceDifference {
  // TODO: Do i need to use "isInverted" in the calculation?? (i would think this is only for representation)
  const percentageDifference = targetPrice.divide(referencePrice).subtract(ONE) // as Fraction
  const percentage = new Percent(percentageDifference.numerator, percentageDifference.denominator) // as Percent

  // Calculate difference in units (no atoms)

  // Convert difference in token amount
  const differenceInUnits = FractionUtils.fromPrice(targetPrice).subtract(FractionUtils.fromPrice(referencePrice))
  const difference = adjustDecimalsAtoms(differenceInUnits, 0, referencePrice.quoteCurrency.decimals)
  const differenceInQuoteToken = CurrencyAmount.fromFractionalAmount(
    referencePrice.quoteCurrency,
    difference.numerator,
    difference.denominator
  )

  const priceUnits = `${referencePrice.quoteCurrency.symbol} per ${referencePrice.baseCurrency.symbol}`
  console.debug(`calculatePriceDifference`, {
    market: `${targetPrice.baseCurrency.symbol}-${targetPrice.quoteCurrency.symbol}`,
    targetPrice: `${targetPrice.toFixed(18)} ${priceUnits}`,
    referencePrice: `${referencePrice.toFixed(18)} ${priceUnits}`,
    differenceCurrency: `${differenceInQuoteToken.toSignificant(18)} ${differenceInQuoteToken.currency.symbol}`,
  })

  return { percentage, amount: differenceInQuoteToken }
}
