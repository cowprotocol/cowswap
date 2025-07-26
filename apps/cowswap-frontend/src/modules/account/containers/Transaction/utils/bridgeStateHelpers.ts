import { BridgeStatus } from '@cowprotocol/cow-sdk'

import { BRIDGING_FINAL_STATUSES } from 'entities/bridgeOrders'

import { isPending } from 'common/hooks/useCategorizeRecentActivity'
import { ActivityDerivedState } from 'common/types/activity'
import { getIsBridgeOrder } from 'common/utils/getIsBridgeOrder'

export function computeBridgeState(
  order: ActivityDerivedState['order'],
  isExpired: boolean,
  isCancelled: boolean,
  isFailed: boolean,
  isCancelling: boolean
): boolean {
  const skipBridgingDisplay = isExpired || isCancelled || isFailed || isCancelling
  return getIsBridgeOrder(order) && !skipBridgingDisplay
}

export function computeOrderPendingState(
  isBridgeOrder: boolean,
  swapAndBridgeContext: { statusResult?: { status: BridgeStatus } } | undefined,
  bridgeOrderData: unknown,
  order: ActivityDerivedState['order']
): boolean {
  if (isBridgeOrder) {
    const bridgingStatus = swapAndBridgeContext?.statusResult?.status
    return bridgingStatus && bridgingStatus !== BridgeStatus.UNKNOWN
      ? !BRIDGING_FINAL_STATUSES.includes(bridgingStatus)
      : !!bridgeOrderData
  }
  return order ? isPending(order) : false
}