import { Token } from '@cowprotocol/currency'

import { OrderStatus } from 'legacy/state/orders/actions'

import { ComposableCowInfo } from 'common/types'

export interface CancellableOrder {
  id: string
  inputToken: Token
  isCancelling?: boolean
  cancellationHash?: string
  status: OrderStatus
  composableCowInfo?: ComposableCowInfo
}

// 1. An order can be cancelled when the order is CREATING or PENDING
// 2. It cannot be cancelled if there's a cancellationHash already or a cancellation in progress
export function isOrderCancellable(order: CancellableOrder): boolean {
  if (order.isCancelling || order.cancellationHash) {
    return false
  }

  return [OrderStatus.CREATING, OrderStatus.PENDING].includes(order.status)
}
