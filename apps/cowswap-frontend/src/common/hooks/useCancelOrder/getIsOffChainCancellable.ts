import { getIsNativeToken } from '@cowprotocol/common-utils'

import { Order, OrderStatus } from 'legacy/state/orders/actions'

import { getIsComposableTwapCancellationOrder } from 'common/utils/getIsComposableTwapCancellationOrder'

interface GetIsOffChainCancellableParams {
  allowsOffchainSigning: boolean
  order: OffChainCancellableOrder
}

type OffChainCancellableOrder = Pick<Order, 'composableCowInfo' | 'id' | 'inputToken' | 'status'>

export function getIsOffChainCancellable({ allowsOffchainSigning, order }: GetIsOffChainCancellableParams): boolean {
  // 1. EthFlow orders will never be able to be cancelled offchain
  if (getIsNativeToken(order.inputToken)) {
    return false
  }

  // 2. Composable/TWAP parent cancellations must stay on the onchain path
  //    so real TWAPs and prototype TWAPs resolve through the same branch.
  if (getIsComposableTwapCancellationOrder(order)) {
    return false
  }

  // 3. The wallet must support offchain signing
  // 4. The order must still be pending
  return allowsOffchainSigning && order.status === OrderStatus.PENDING
}
