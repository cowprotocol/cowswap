import { Currency, Fraction, Percent, Price } from '@uniswap/sdk-core'
import { Nullish } from '@cow/types'

const HALF_PERCENT = new Percent(5, 1000)
const FIVE_PERCENT = new Percent(5, 100)
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

  const [referencePrice, multiplier] = limitPrice.greaterThan(marketPrice)
    ? // When limit price is > market price:
      // Use it for comparing with execution price
      // It'll be likely bigger than execution price, so we invert it
      // by multiplying by -1
      // Thus, everything < 0 is very close
      [limitPrice, MINUS_ONE]
    : // When market price is >= limit price
      // Use it for comparing with execution price
      // It'll likely be smaller than execution price, so we keep it as is
      // by multiplying by 1
      // Thus, everything < 0 is very close
      [marketPrice, ONE]

  const percentageDifference = executionPrice.divide(referencePrice).subtract(ONE).multiply(multiplier)

  // TODO: remove debug logs
  console.debug(`calculateOrderExecutionStatus`, {
    pair: `${marketPrice.baseCurrency.symbol}/${marketPrice.quoteCurrency.symbol}`,
    limitPrice: limitPrice.toFixed(7),
    marketPrice: marketPrice.toFixed(7),
    referencePrice: referencePrice.toFixed(7),
    executionPrice: executionPrice.toFixed(7),
    percentageDifference: percentageDifference.multiply(new Fraction(100)).toFixed(2) + '%',
  })

  if (percentageDifference.lessThan(HALF_PERCENT)) {
    return 'veryClose'
  } else if (percentageDifference.greaterThan(FIVE_PERCENT)) {
    return 'notClose'
  } else {
    return 'close'
  }
}
