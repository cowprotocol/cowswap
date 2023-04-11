import { getIsEthFlowOrder } from '@cow/modules/swap/containers/EthFlowStepper'
import { Order, OrderStatus } from 'state/orders/actions'

// 1. To be EthFlow cancellable the order must be an EthFlow order
// 2. It can be cancelled when the order is CREATING or PENDING
// 3. It cannot be cancelled if there's a cancellationHash already
export function isOrderCancellable(order: Order): boolean {
  if (order.isCancelling || order.cancellationHash) {
    return false
  }

  if (getIsEthFlowOrder(order)) {
    return [OrderStatus.CREATING, OrderStatus.PENDING].includes(order?.status)
  }

  return true
}
