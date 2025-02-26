import { isTwapOrderFulfilled } from './isTwapOrderFulfilled'

import { TwapOrdersExecution } from '../hooks/useTwapOrdersExecutions'
import { TwapOrderStatus, TWAPOrderStruct } from '../types'

export function getTwapOrderStatus(
  order: TWAPOrderStruct,
  isTransactionExecuted: boolean,
  executionDate: Date | null,
  auth: boolean | undefined,
  { confirmedPartsCount, info: executionInfo }: TwapOrdersExecution,
): TwapOrderStatus {
  const isFulfilled = isTwapOrderFulfilled(order, executionInfo.executedSellAmount)
  const isCancelled = auth === false
  const isExpired = confirmedPartsCount === order.n || isTwapOrderExpired(order, executionDate)

  if (isFulfilled) return TwapOrderStatus.Fulfilled

  if (isCancelled) return TwapOrderStatus.Cancelled

  if (isExpired) {
    return TwapOrderStatus.Expired
  }

  if (!isTransactionExecuted) return TwapOrderStatus.WaitSigning

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
