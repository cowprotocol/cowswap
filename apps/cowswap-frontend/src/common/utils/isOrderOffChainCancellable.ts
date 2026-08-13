import { getIsNativeToken } from '@cowprotocol/common-utils'

import { isOffchainOrder } from 'common/utils/isOffchainOrder'
import { CancellableOrder, isOrderCancellable } from 'common/utils/isOrderCancellable'

export function isOrderOffChainCancellable(order: CancellableOrder): boolean {
  // 1. EthFlow orders cannot be cancelled off-chain
  // 2. The order must be cancellable
  // 3. The order must use the EIP-712 signing scheme
  return !getIsNativeToken(order.inputToken) && isOrderCancellable(order) && isOffchainOrder(order)
}
