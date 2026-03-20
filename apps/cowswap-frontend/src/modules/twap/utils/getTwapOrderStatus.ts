import { isTwapOrderFulfilled } from './isTwapOrderFulfilled'

import { TwapOrdersExecution, TwapOrderStatus, TWAPOrderStruct } from '../types'

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

  // Safe tx may already be gone from the pending queue while the composable order is not yet
  // reflected in our snapshot; `singleOrders` (auth) is the on-chain source of truth.
  if (!isTransactionExecuted && auth !== true) return TwapOrderStatus.WaitSigning

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
