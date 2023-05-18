import { getIsEthFlowOrder } from 'modules/swap/containers/EthFlowStepper'
import { isOrderCancellable } from 'common/utils/isOrderCancellable'
import { Order } from 'state/orders/actions'

export function isOrderOffChainCancellable(order: Order): boolean {
  return !getIsEthFlowOrder(order) && isOrderCancellable(order)
}
