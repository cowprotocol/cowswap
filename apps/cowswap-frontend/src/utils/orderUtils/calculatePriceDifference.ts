import { ZERO_FRACTION } from '@cowprotocol/common-const'
import { FractionUtils } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount, Fraction, Percent, Price } from '@uniswap/sdk-core'

import invariant from 'tiny-invariant'
import { Nullish } from 'types'

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
  const difference = FractionUtils.adjustDecimalsAtoms(differenceInUnits, 0, referencePrice.quoteCurrency.decimals)
  const differenceInQuoteToken = CurrencyAmount.fromFractionalAmount(
    referencePrice.quoteCurrency,
    difference.numerator,
    difference.denominator
  )

  return { percentage, amount: differenceInQuoteToken }
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function assertSameMarket(price1: Price<Currency, Currency>, price2: Price<Currency, Currency>) {
  // Assert I'm comparing apples with apples (prices should refer to market)
  invariant(
    price1.baseCurrency.equals(price2.baseCurrency) && price1.quoteCurrency.equals(price2.quoteCurrency),
    'Prices are not from the same market'
  )
}
