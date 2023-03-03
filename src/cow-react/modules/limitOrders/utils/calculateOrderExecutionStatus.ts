import { Currency, Fraction, Percent, Price } from '@uniswap/sdk-core'
import { Nullish } from '@cow/types'

const HALF_PERCENT = new Percent(5, 1000)
const FIVE_PERCENT = new Percent(5, 100)
const ZERO = new Fraction(0)
const ONE = new Fraction(1)
const MINUS_ONE = new Fraction(-1)

export type OrderExecutionStatus = 'notClose' | 'close' | 'veryClose'

export type CalculateOrderExecutionStatusParams = {
  limitPrice: Nullish<Price<Currency, Currency>>
  marketPrice: Nullish<Price<Currency, Currency>>
  executionPrice: Nullish<Price<Currency, Currency>>
}

export function calculateOrderExecutionStatus({
  limitPrice,
  marketPrice,
  executionPrice,
}: CalculateOrderExecutionStatusParams): OrderExecutionStatus | undefined {
  if (!limitPrice || !marketPrice || !executionPrice) {
    return undefined
  }

  const referencePrice = limitPrice.greaterThan(marketPrice) ? limitPrice : marketPrice

  const percentageDifference = executionPrice.divide(referencePrice).subtract(ONE)
  const absolutePercentageDifference = percentageDifference.lessThan(ZERO)
    ? percentageDifference.multiply(MINUS_ONE)
    : percentageDifference

  if (absolutePercentageDifference.lessThan(HALF_PERCENT)) {
    return 'veryClose'
  } else if (absolutePercentageDifference.greaterThan(FIVE_PERCENT)) {
    return 'notClose'
  } else {
    return 'close'
  }
}
