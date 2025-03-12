import { SafaryTradeType, TradeFlowTrackingUpdater } from '@cowprotocol/analytics'
import { UiOrderType } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { ActivityStatus, useMultipleActivityDescriptors } from 'legacy/hooks/useRecentActivity'
import { useOrders } from 'legacy/state/orders/hooks'

import { useCategorizeRecentActivity } from 'common/hooks/useCategorizeRecentActivity'

/**
 * This component is responsible for tracking limit orders analytics using Safary.
 * It works by providing a TradeFlowTrackingUpdater with all the necessary order data
 * and also tracks page visits with fiat amounts.
 *
 * This is a standalone component to minimize changes to the existing code structure
 */
export function LimitOrdersTrackingUpdater() {
  const { account, chainId } = useWalletInfo()

  // Get all orders and activity data for tracking
  const orders = useOrders(chainId, account, UiOrderType.LIMIT)
  const { pendingActivity, confirmedActivity } = useCategorizeRecentActivity()
  const allActivityIds = [...pendingActivity, ...confirmedActivity]
  const activityDescriptors = useMultipleActivityDescriptors({ chainId, ids: allActivityIds })

  // Map ActivityDescriptors to ActivityItemForTracking
  const activityItems = activityDescriptors.map((item) => ({
    id: item.id,
    status: String(item.status), // Convert ActivityStatus enum to string
    type: item.type,
    orderType: UiOrderType.LIMIT, // All items are LIMIT type in this context
  }))

  // Create a record of orders by ID for the TradeFlowTrackingUpdater
  const ordersById = orders.reduce((acc: Record<string, any>, order: any) => {
    acc[order.id] = order
    return acc
  }, {})

  return (
    <TradeFlowTrackingUpdater
      account={account}
      pageView="limit_orders_page_view"
      orderType={UiOrderType.LIMIT}
      tradeType={SafaryTradeType.LIMIT_ORDER}
      ordersById={ordersById}
      activityItems={activityItems}
      statusConstants={{
        activityTypeName: 'order',
        fulfilledStatus: String(ActivityStatus.CONFIRMED),
        failedStatus: String(ActivityStatus.FAILED),
        orderFulfilledStatus: 'fulfilled',
        orderFailedStatus: 'failed',
      }}
      label="limit order"
    />
  )
}
