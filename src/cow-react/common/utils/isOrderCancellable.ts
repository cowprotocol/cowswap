import { getIsEthFlowOrder } from '@cow/modules/swap/containers/EthFlowStepper'
import { Order, OrderStatus } from 'state/orders/actions'

export function isOrderCancellable(order: Order): boolean {
  const isEthFlowOrder = getIsEthFlowOrder(order)

  // 1. To be EthFlow cancellable the order must be an EthFlow order
  // 2. It can be cancelled when the order is CREATING or PENDING
  // 3. It cannot be cancelled if there's a cancellationHash already
  const isEthFlowCancellable =
    isEthFlowOrder &&
    (order?.status === OrderStatus.CREATING || order?.status === OrderStatus.PENDING) &&
    !order.cancellationHash

  return !order.isCancelling || isEthFlowCancellable
}
