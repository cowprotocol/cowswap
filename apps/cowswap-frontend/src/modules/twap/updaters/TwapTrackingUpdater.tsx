import { useEffect, useRef } from 'react'

import { TradeType, useTradeTracking, trackOrderStatusChanges } from '@cowprotocol/analytics'
import { UiOrderType } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useMultipleActivityDescriptors } from 'legacy/hooks/useRecentActivity'
import { useOrders } from 'legacy/state/orders/hooks'

import { useCategorizeRecentActivity } from 'common/hooks/useCategorizeRecentActivity'

/**
 * Dedicated component for tracking TWAP order-related events for analytics
 */
export function TwapTrackingUpdater() {
  const { account, chainId } = useWalletInfo()
  const tradeTracking = useTradeTracking()

  // References to track which orders we've already processed for analytics
  const executedOrdersRef = useRef<Set<string>>(new Set())
  const failedOrdersRef = useRef<Set<string>>(new Set())

  // Reset tracked orders when account or chainId changes
  useEffect(() => {
    executedOrdersRef.current.clear()
    failedOrdersRef.current.clear()
  }, [account, chainId])

  // Gather order data for tracking order execution and failures
  const allOrders = useOrders(chainId, account, UiOrderType.TWAP)
  const { pendingActivity, confirmedActivity } = useCategorizeRecentActivity()
  const allActivityIds = [...pendingActivity, ...confirmedActivity]
  const activityDescriptors = useMultipleActivityDescriptors({ chainId, ids: allActivityIds })

  // Map ActivityDescriptors to ActivityItemForTracking
  const activityItems = activityDescriptors.map((item) => ({
    id: item.id,
    status: item.status,
    type: item.type,
    orderType: UiOrderType.TWAP,
  }))

  // Create a record of orders by ID for tracking
  const ordersById = allOrders.reduce((acc: Record<string, any>, order: any) => {
    acc[order.id] = order
    return acc
  }, {})

  // Track page view when component mounts or account changes
  useEffect(() => {
    if (account) {
      // Track page view
      tradeTracking.onPageView('twap_page_view')

      // Track wallet connection
      tradeTracking.onWalletConnected(account)
    }
  }, [account, tradeTracking])

  // Track order execution and failures
  useEffect(() => {
    trackOrderStatusChanges(
      account,
      ordersById,
      activityItems,
      UiOrderType.TWAP,
      TradeType.TWAP,
      tradeTracking,
      executedOrdersRef,
      failedOrdersRef,
      'TWAP execution failed',
    )
  }, [account, activityItems, ordersById, tradeTracking])

  return null
}
