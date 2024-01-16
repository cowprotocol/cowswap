import { getIsEthFlowOrder } from 'modules/swap/containers/EthFlowStepper'

import { CancellableOrder, isOrderCancellable } from 'common/utils/isOrderCancellable'

export function isOrderOffChainCancellable(order: CancellableOrder): boolean {
  return !getIsEthFlowOrder(order.inputToken.address) && isOrderCancellable(order)
}
