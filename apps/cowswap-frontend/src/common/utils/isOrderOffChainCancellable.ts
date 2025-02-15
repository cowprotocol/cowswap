import { getIsNativeToken } from '@cowprotocol/common-utils'

import { CancellableOrder, isOrderCancellable } from 'common/utils/isOrderCancellable'

export function isOrderOffChainCancellable(order: CancellableOrder): boolean {
  return !getIsNativeToken(order.inputToken) && isOrderCancellable(order)
}
