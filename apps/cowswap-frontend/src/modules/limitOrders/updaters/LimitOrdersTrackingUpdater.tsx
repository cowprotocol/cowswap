import { useEffect, useRef } from 'react'

import { TradeType, useTradeTracking, trackOrderStatusChanges } from '@cowprotocol/analytics'
import { UiOrderType } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useMultipleActivityDescriptors } from 'legacy/hooks/useRecentActivity'
import { useOrders } from 'legacy/state/orders/hooks'

import { useCategorizeRecentActivity } from 'common/hooks/useCategorizeRecentActivity'

/**
 * This component is responsible for tracking limit orders analytics.
 * It tracks order execution and failure events through GTM.
 */
export function LimitOrdersTrackingUpdater() {
  const { account, chainId } = useWalletInfo()
  const tradeTracking = useTradeTracking()

  // Get all orders and activity data for tracking
  const orders = useOrders(chainId, account, UiOrderType.LIMIT)
  const { pendingActivity, confirmedActivity } = useCategorizeRecentActivity()
  const allActivityIds = [...pendingActivity, ...confirmedActivity]
  const activityDescriptors = useMultipleActivityDescriptors({ chainId, ids: allActivityIds })

  // Map ActivityDescriptors to ActivityItemForTracking
  const activityItems = activityDescriptors.map((item) => ({
    id: item.id,
    status: item.status,
    type: item.type,
    orderType: UiOrderType.LIMIT,
  }))

  // Create a record of orders by ID for tracking
  const ordersById = orders.reduce((acc: Record<string, any>, order: any) => {
    acc[order.id] = order
    return acc
  }, {})

  // Track page view when component mounts or account changes
  useEffect(() => {
    if (account) {
      // Track page view
      tradeTracking.onPageView('limit_orders_page_view')

      // Track wallet connection
      tradeTracking.onWalletConnected(account)
    }
  }, [account, tradeTracking])

  // Track order execution and failures using refs to avoid duplicates
  const executedOrdersRef = useRef<Set<string>>(new Set())
  const failedOrdersRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    trackOrderStatusChanges(
      account,
      ordersById,
      activityItems,
      UiOrderType.LIMIT,
      TradeType.LIMIT,
      tradeTracking,
      executedOrdersRef,
      failedOrdersRef,
      'Limit order execution failed',
    )
  }, [account, activityItems, ordersById, tradeTracking])

  return null
}
