import { getEtherscanLink } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { OrderStatus } from 'legacy/state/orders/actions'

import { getIsComposableCowParentOrder } from 'utils/orderUtils/getIsComposableCowParentOrder'
import { ParsedOrder } from 'utils/orderUtils/parseOrder'

export function getActivityUrl(chainId: SupportedChainId, order: ParsedOrder): string | undefined {
  const { activityId } = order.executionData

  if (getIsComposableCowParentOrder(order)) {
    return undefined
  }

  if (order.composableCowInfo?.isVirtualPart) {
    return undefined
  }

  if (order.status === OrderStatus.SCHEDULED) {
    return undefined
  }

  return chainId && activityId ? getEtherscanLink(chainId, 'transaction', activityId) : undefined
}
