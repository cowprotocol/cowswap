import { Currency, Fraction, Percent, Price } from '@uniswap/sdk-core'
import { Nullish } from '@cow/types'

const HALF_PERCENT = new Percent(5, 1000)
const FIVE_PERCENT = new Percent(5, 100)
const ONE = new Fraction(1)

export type OrderExecutionStatus = 'notClose' | 'close' | 'veryClose'

export type CalculateOrderExecutionStatusParams = {
  limitPrice: Nullish<Price<Currency, Currency>>
  spotPrice: Nullish<Price<Currency, Currency>>
  estimatedExecutionPrice: Nullish<Price<Currency, Currency>>
}

export function calculateOrderExecutionStatus({
  limitPrice,
  spotPrice,
  estimatedExecutionPrice,
}: CalculateOrderExecutionStatusParams): OrderExecutionStatus | undefined {
  if (!limitPrice || !spotPrice || !estimatedExecutionPrice) {
    return undefined
  }

  const percentageDifference = estimatedExecutionPrice.divide(spotPrice).subtract(ONE)

  // TODO: remove debug logs
  console.debug(`calculateOrderExecutionStatus`, {
    pair: `${spotPrice.quoteCurrency.symbol}/${spotPrice.baseCurrency.symbol}`,
    limitPrice: `${limitPrice.toFixed(7)} ${limitPrice.baseCurrency.symbol} per ${limitPrice.quoteCurrency.symbol}`,
    marketPrice: `${spotPrice.toFixed(7)} ${spotPrice.baseCurrency.symbol} per ${spotPrice.quoteCurrency.symbol}`,
    executionPrice: `${estimatedExecutionPrice.toFixed(7)} ${estimatedExecutionPrice.baseCurrency.symbol} per ${
      estimatedExecutionPrice.quoteCurrency.symbol
    }`,
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
