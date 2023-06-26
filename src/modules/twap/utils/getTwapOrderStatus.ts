import ms from 'ms.macro'

import { Order, PENDING_STATES } from 'legacy/state/orders/actions'

import { TwapOrderStatus, TWAPOrderStruct } from '../types'

const AUTH_THRESHOLD = ms`1m`

export function getTwapOrderStatus(
  order: TWAPOrderStruct,
  isExecuted: boolean,
  executionDate: Date,
  auth: boolean | undefined,
  discreteOrder: Order | undefined
): TwapOrderStatus {
  if (isTwapOrderExpired(order)) return TwapOrderStatus.Expired

  if (!isExecuted) return TwapOrderStatus.WaitSigning

  if (shouldCheckAuth(executionDate) && auth === false) return TwapOrderStatus.Cancelled

  if (discreteOrder && PENDING_STATES.includes(discreteOrder.status)) return TwapOrderStatus.Pending

  return TwapOrderStatus.Scheduled
}

export function isTwapOrderExpired(order: TWAPOrderStruct): boolean {
  const { t0: startTime, n: numOfParts, t: timeInterval } = order
  const endTime = startTime + timeInterval * numOfParts
  const nowTimestamp = Math.ceil(Date.now() / 1000)

  return nowTimestamp > endTime
}

/**
 * ComposableCow.singleOrders returns false by default
 * To avoid false-positive values, we should not check authorized flag within first minute after execution time
 */
function shouldCheckAuth(executionDate: Date): boolean {
  const executionTimestamp = executionDate.getTime()
  const nowTimestamp = Date.now()

  return nowTimestamp > executionTimestamp + AUTH_THRESHOLD
}
