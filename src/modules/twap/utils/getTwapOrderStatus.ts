import { TWAPOrderStatus, TWAPOrderStruct } from '../types'

export function getTwapOrderStatus(
  order: TWAPOrderStruct,
  isExecuted: boolean,
  auth: boolean,
  hasDiscreteOrdder: boolean
): TWAPOrderStatus {
  if (isTwapOrderExpired(order)) return TWAPOrderStatus.Expired

  if (!isExecuted) return TWAPOrderStatus.WaitSigning

  if (!auth) return TWAPOrderStatus.Cancelled

  // TODO: check if a discrete order is filled
  if (!hasDiscreteOrdder) return TWAPOrderStatus.Scheduled

  return TWAPOrderStatus.Pending
}

export function isTwapOrderExpired(order: TWAPOrderStruct): boolean {
  const { t0: startTime, n: numOfParts, t: timeInterval } = order
  const endTime = startTime + timeInterval * numOfParts
  const nowTimestamp = Math.ceil(Date.now() / 1000)

  return nowTimestamp > endTime
}
