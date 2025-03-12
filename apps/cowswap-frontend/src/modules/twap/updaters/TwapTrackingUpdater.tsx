import { TradeFlowTrackingUpdater, SafaryTradeType } from '@cowprotocol/analytics'
import { UiOrderType } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { ActivityStatus, useMultipleActivityDescriptors } from 'legacy/hooks/useRecentActivity'
import { useOrders } from 'legacy/state/orders/hooks'

import { useCategorizeRecentActivity } from 'common/hooks/useCategorizeRecentActivity'

/**
 * TwapTrackingUpdater Component
 *
 * Dedicated component for tracking TWAP order-related events for marketing analytics
 * This is a standalone component to minimize changes to the existing code structure
 */
export function TwapTrackingUpdater() {
  const { account, chainId } = useWalletInfo()

  // Gather order data for tracking order execution and failures
  const allOrders = useOrders(chainId, account, UiOrderType.TWAP)
  const { pendingActivity, confirmedActivity } = useCategorizeRecentActivity()
  const allActivityIds = [...pendingActivity, ...confirmedActivity]
  const activityDescriptors = useMultipleActivityDescriptors({ chainId, ids: allActivityIds })

  // Map ActivityDescriptors to ActivityItemForTracking
  const activityItems = activityDescriptors.map((item) => ({
    id: item.id,
    status: String(item.status), // Convert ActivityStatus enum to string
    type: item.type,
    orderType: UiOrderType.TWAP, // All items are TWAP type in this context
  }))

  // Create a record of orders by ID for the TradeFlowTrackingUpdater
  const ordersById = allOrders.reduce((acc: Record<string, any>, order: any) => {
    acc[order.id] = order
    return acc
  }, {})

  return (
    <TradeFlowTrackingUpdater
      account={account}
      pageView="twap_page_view"
      orderType={UiOrderType.TWAP}
      tradeType={SafaryTradeType.TWAP_ORDER}
      ordersById={ordersById}
      activityItems={activityItems}
      statusConstants={{
        activityTypeName: 'order',
        fulfilledStatus: String(ActivityStatus.CONFIRMED),
        failedStatus: String(ActivityStatus.FAILED),
        orderFulfilledStatus: 'fulfilled',
        orderFailedStatus: 'failed',
      }}
      label="TWAP order"
    />
  )
}
