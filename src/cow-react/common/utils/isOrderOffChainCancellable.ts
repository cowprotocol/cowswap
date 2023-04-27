import { getIsEthFlowOrder } from '@cow/modules/swap/containers/EthFlowStepper'
import { isOrderCancellable } from '@cow/common/utils/isOrderCancellable'
import { Order } from 'state/orders/actions'

export function isOrderOffChainCancellable(order: Order): boolean {
  return !getIsEthFlowOrder(order) && isOrderCancellable(order)
}
