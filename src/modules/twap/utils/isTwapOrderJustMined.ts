import ms from 'ms.macro'

const ORDER_CREATING_THRESHOLD = ms`30s`

/**
 * For some reason, composableCowContract.singleOrders result from multicall might return falsy value
 * It happens, when a TWAP order transits from Signing to Open state
 * To fix this problem, we don't check singleOrders for orders that were mined recently (<30s)
 * @see useTwapOrdersAuthMulticall
 */
export function isTwapOrderJustMined(_executionDate: string | null): boolean {
  const executionDate = _executionDate ? new Date(_executionDate) : null

  if (!executionDate) return true

  const currentTimestamp = Date.now()

  return Math.ceil(currentTimestamp - executionDate.getDate() / 1000) < ORDER_CREATING_THRESHOLD
}
