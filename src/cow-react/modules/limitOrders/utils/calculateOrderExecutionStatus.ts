import { Percent } from '@uniswap/sdk-core'

const LOWER_PERCENTAGE_DIFFERENCE = new Percent(5, 1000) // 0.5%
const UPPER_PERCENTAGE_DIFFERENCE = new Percent(5, 100) // 5%

export type OrderExecutionStatus = 'notClose' | 'close' | 'veryClose'

export function calculateOrderExecutionStatus(difference: Percent | undefined): OrderExecutionStatus | undefined {
  if (!difference) {
    return undefined
  }

  if (difference.lessThan(LOWER_PERCENTAGE_DIFFERENCE)) {
    return 'veryClose'
  } else if (difference.greaterThan(UPPER_PERCENTAGE_DIFFERENCE)) {
    return 'notClose'
  } else {
    return 'close'
  }
}
