import { Order, PENDING_STATES } from 'legacy/state/orders/actions'

import { TwapOrderStatus, TWAPOrderStruct } from '../types'

export function getTwapOrderStatus(
  order: TWAPOrderStruct,
  isExecuted: boolean,
  auth: boolean,
  discreteOrder: Order | undefined
): TwapOrderStatus {
  if (isTwapOrderExpired(order)) return TwapOrderStatus.Expired

  if (!isExecuted) return TwapOrderStatus.WaitSigning

  if (!auth) return TwapOrderStatus.Cancelled

  if (discreteOrder && PENDING_STATES.includes(discreteOrder.status)) return TwapOrderStatus.Pending

  return TwapOrderStatus.Scheduled
}

export function isTwapOrderExpired(order: TWAPOrderStruct): boolean {
  const { t0: startTime, n: numOfParts, t: timeInterval } = order
  const endTime = startTime + timeInterval * numOfParts
  const nowTimestamp = Math.ceil(Date.now() / 1000)

  return nowTimestamp > endTime
}
