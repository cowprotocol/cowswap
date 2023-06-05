import { EnrichedOrder, OrderStatus } from '@cowprotocol/cow-sdk'

import { TWAPOrderStatus, TWAPOrderStruct } from '../types'

export function getTwapOrderStatus(
  order: TWAPOrderStruct,
  isExecuted: boolean,
  auth: boolean,
  discreteOrder: EnrichedOrder | undefined
): TWAPOrderStatus {
  if (isTwapOrderExpired(order)) return TWAPOrderStatus.Expired

  if (!isExecuted) return TWAPOrderStatus.WaitSigning

  if (!auth) return TWAPOrderStatus.Cancelled

  if (discreteOrder?.status === OrderStatus.OPEN) return TWAPOrderStatus.Pending

  return TWAPOrderStatus.Scheduled
}

export function isTwapOrderExpired(order: TWAPOrderStruct): boolean {
  const { t0: startTime, n: numOfParts, t: timeInterval } = order
  const endTime = startTime + timeInterval * numOfParts
  const nowTimestamp = Math.ceil(Date.now() / 1000)

  return nowTimestamp > endTime
}
