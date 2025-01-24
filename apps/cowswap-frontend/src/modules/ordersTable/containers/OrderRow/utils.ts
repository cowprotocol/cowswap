import { getEtherscanLink } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { UI } from '@cowprotocol/ui'

import { OrderStatus } from 'legacy/state/orders/actions'

import { FAIR_PRICE_THRESHOLD_PERCENTAGE, GOOD_PRICE_THRESHOLD_PERCENTAGE } from 'common/constants/common'
import { getIsComposableCowParentOrder } from 'utils/orderUtils/getIsComposableCowParentOrder'
import { getIsFinalizedOrder } from 'utils/orderUtils/getIsFinalizedOrder'
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

export function shouldShowDashForExpiration(order: ParsedOrder): boolean {
  // Show dash for finalized orders that are not expired
  if (getIsFinalizedOrder(order) && order.status !== OrderStatus.EXPIRED) {
    return true
  }

  // For TWAP parent orders, show dash when all child orders are in a final state
  if (getIsComposableCowParentOrder(order)) {
    // If the parent order is fulfilled or cancelled, all child orders are finalized
    if (order.status === OrderStatus.FULFILLED || order.status === OrderStatus.CANCELLED) {
      return true
    }

    // For mixed states (some filled, some expired), check either condition:
    // 1. fullyFilled: true when all non-expired parts are filled
    // 2. status === EXPIRED: true when all remaining parts are expired
    // Either condition indicates all child orders are in a final state
    if (order.executionData.fullyFilled || order.status === OrderStatus.EXPIRED) {
      return true
    }
  }

  return false
}

// Helper to determine the color based on percentage
export function getDistanceColor(percentage: number): string {
  const absPercentage = Math.abs(percentage)

  if (absPercentage <= GOOD_PRICE_THRESHOLD_PERCENTAGE) {
    return `var(${UI.COLOR_SUCCESS})` // Green - good price
  } else if (absPercentage <= FAIR_PRICE_THRESHOLD_PERCENTAGE) {
    return `var(${UI.COLOR_PRIMARY})` // Blue - fair price
  }

  return 'inherit' // Default text color for larger differences
}
