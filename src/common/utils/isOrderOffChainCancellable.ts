import { getIsEthFlowOrder } from 'modules/swap/containers/EthFlowStepper'
import { isOrderCancellable } from 'common/utils/isOrderCancellable'
import { Order } from 'legacy/state/orders/actions'

export function isOrderOffChainCancellable(order: Order): boolean {
  return !getIsEthFlowOrder(order) && isOrderCancellable(order)
}
