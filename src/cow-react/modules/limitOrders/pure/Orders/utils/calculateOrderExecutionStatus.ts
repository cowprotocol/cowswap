import { Fraction, Percent } from '@uniswap/sdk-core'
import { OrderRowProps } from '@cow/modules/limitOrders/pure/Orders/OrderRow'

const HALF_PERCENT = new Percent(5, 1000)
const FIVE_PERCENT = new Percent(5, 100)
const ZERO = new Fraction(0)
const ONE = new Fraction(1)
const MINUS_ONE = new Fraction(-1)

export type OrderExecutionStatus = 'notClose' | 'close' | 'veryClose'

export function calculateOrderExecutionStatus(prices: OrderRowProps['prices']): OrderExecutionStatus | undefined {
  if (!prices) {
    return undefined
  }

  const { marketPrice, executionPrice } = prices

  const percentageDifference = executionPrice.divide(marketPrice).subtract(ONE)
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
