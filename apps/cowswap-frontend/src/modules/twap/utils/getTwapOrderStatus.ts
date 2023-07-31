import { isTwapOrderFulfilled } from './isTwapOrderFulfilled'

import { TwapOrdersExecution } from '../hooks/useTwapOrdersExecutions'
import { TwapOrderStatus, TWAPOrderStruct } from '../types'

export function getTwapOrderStatus(
  order: TWAPOrderStruct,
  isTransactionExecuted: boolean,
  executionDate: Date | null,
  auth: boolean | undefined,
  { confirmedPartsCount, info: executionInfo }: TwapOrdersExecution
): TwapOrderStatus {
  const isFulfilled = isTwapOrderFulfilled(order, executionInfo.executedSellAmount)

  if (isFulfilled) return TwapOrderStatus.Fulfilled

  if (auth === false) return TwapOrderStatus.Cancelled

  if (confirmedPartsCount === order.n) {
    if (+executionInfo.executedSellAmount > 0) return TwapOrderStatus.Fulfilled

    return TwapOrderStatus.Expired
  }

  if (isTwapOrderExpired(order, executionDate)) return TwapOrderStatus.Expired

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
