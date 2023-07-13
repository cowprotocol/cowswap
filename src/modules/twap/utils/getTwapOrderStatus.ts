import { isTwapOrderFulfilled } from './isTwapOrderFulfilled'

import { TwapOrderExecutionInfo, TwapOrderStatus, TWAPOrderStruct } from '../types'

export function getTwapOrderStatus(
  order: TWAPOrderStruct,
  isExecuted: boolean,
  executionDate: Date | null,
  auth: boolean | undefined,
  executionInfo: TwapOrderExecutionInfo
): TwapOrderStatus {
  const isFulfilled = isTwapOrderFulfilled(order, executionInfo.executedSellAmount)

  if (isFulfilled) return TwapOrderStatus.Fulfilled

  if (auth === false) return TwapOrderStatus.Cancelled

  if (isTwapOrderExpired(order, executionDate)) return TwapOrderStatus.Expired

  if (!isExecuted) return TwapOrderStatus.WaitSigning

  return TwapOrderStatus.Pending
}

export function isTwapOrderExpired(order: TWAPOrderStruct, startDate: Date | null): boolean {
  if (!startDate) return false

  const startTime = Math.ceil(startDate.getTime() / 1000)
  const { n: numOfParts, t: timeInterval } = order
  const endTime = startTime + timeInterval * numOfParts
  const nowTimestamp = Math.ceil(Date.now() / 1000)

  return nowTimestamp > endTime
}
