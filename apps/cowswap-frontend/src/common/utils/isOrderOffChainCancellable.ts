import { CancellableOrder, isOrderCancellable } from 'common/utils/isOrderCancellable'

import { getIsEthFlowOrder } from './getIsEthFlowOrder'

export function isOrderOffChainCancellable(order: CancellableOrder): boolean {
  return !getIsEthFlowOrder(order.inputToken.address) && isOrderCancellable(order)
}
