import { OrderStatus } from 'legacy/state/orders/actions'

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

export function getTwapParentStatusFromChildren(
  childrenOrders: { status: OrderStatus; isCancelling?: boolean }[],
): TwapOrderStatus {
  if (!childrenOrders.length) return TwapOrderStatus.Pending

  const hasOpen = childrenOrders.some((order) => order.status === OrderStatus.PENDING)
  const hasCancelling = childrenOrders.some((order) => order.isCancelling)
  const hasFilled = childrenOrders.some((order) => order.status === OrderStatus.FULFILLED)
  const hasCancelled = childrenOrders.some((order) => order.status === OrderStatus.CANCELLED)
  const hasExpired = childrenOrders.some((order) => order.status === OrderStatus.EXPIRED)

  // All parts filled
  if (childrenOrders.every((order) => order.status === OrderStatus.FULFILLED)) {
    return TwapOrderStatus.Fulfilled
  }

  // All parts cancelled
  if (childrenOrders.every((order) => order.status === OrderStatus.CANCELLED)) {
    return TwapOrderStatus.Cancelled
  }

  // All parts expired
  if (childrenOrders.every((order) => order.status === OrderStatus.EXPIRED)) {
    return TwapOrderStatus.Expired
  }

  // At least one part is open
  if (hasOpen) {
    return TwapOrderStatus.Pending
  }

  // One part is cancelling
  if (hasCancelling) {
    return TwapOrderStatus.Cancelling
  }

  // Some filled + some expired/cancelled
  if (hasFilled && (hasExpired || hasCancelled)) {
    return TwapOrderStatus.Fulfilled // Partially filled is considered Fulfilled for display
  }

  // Mixed cancelled & expired only (no fills)
  if (hasCancelled && hasExpired && !hasFilled) {
    return TwapOrderStatus.Cancelled
  }

  // Default to pending if no other conditions met
  return TwapOrderStatus.Pending
}
