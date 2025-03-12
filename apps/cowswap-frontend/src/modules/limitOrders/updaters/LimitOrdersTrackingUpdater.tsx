import { useEffect, useRef } from 'react'

import { TradeType, useTradeTracking, getActivityStatusString } from '@cowprotocol/analytics'
import { UiOrderType } from '@cowprotocol/types'
import { useWalletInfo } from '@cowprotocol/wallet'

import { ActivityStatus, useMultipleActivityDescriptors } from 'legacy/hooks/useRecentActivity'
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
    if (!account || !activityItems.length || !ordersById) return

    activityItems.forEach((item) => {
      if (item.type !== 'order' || item.orderType !== UiOrderType.LIMIT) return

      const order = ordersById[item.id]
      if (!order) return

      // Process executed orders
      if (
        item.status === ActivityStatus.CONFIRMED &&
        order.status === 'fulfilled' &&
        !executedOrdersRef.current.has(item.id)
      ) {
        // Calculate amounts for tracking
        let fromAmount: number | undefined = undefined
        let toAmount: number | undefined = undefined

        try {
          if (order.sellAmount) {
            fromAmount = parseFloat(order.sellAmount.toString()) / 10 ** (order.inputToken?.decimals || 18)
          }

          if (order.buyAmount) {
            toAmount = parseFloat(order.buyAmount.toString()) / 10 ** (order.outputToken?.decimals || 18)
          }
        } catch (error) {
          console.error(`[GTM] Error calculating limit order amounts:`, error)
        }

        // Track the execution via GTM
        tradeTracking.onOrderExecuted({
          walletAddress: account,
          tradeType: TradeType.LIMIT,
          fromAmount,
          fromCurrency: order.inputToken?.symbol || '',
          toAmount,
          toCurrency: order.outputToken?.symbol || '',
          contractAddress: order.inputToken?.address || '',
          transactionHash: order.fulfilledTransactionHash || order.id,
          orderId: item.id,
          orderStatus: getActivityStatusString(item.status),
        })

        // Mark as tracked to prevent duplicate events
        executedOrdersRef.current.add(item.id)
      }

      // Process failed orders
      if (item.status === ActivityStatus.FAILED && order.status === 'failed' && !failedOrdersRef.current.has(item.id)) {
        // Track the failure via GTM
        tradeTracking.onOrderFailed(
          {
            walletAddress: account,
            tradeType: TradeType.LIMIT,
            fromCurrency: order.inputToken?.symbol || '',
            toCurrency: order.outputToken?.symbol || '',
            contractAddress: order.inputToken?.address || '',
            orderId: item.id,
            orderStatus: getActivityStatusString(item.status),
          },
          'Order execution failed',
        )

        // Mark as tracked to prevent duplicate events
        failedOrdersRef.current.add(item.id)
      }
    })
  }, [account, activityItems, ordersById, tradeTracking])

  return null
}
