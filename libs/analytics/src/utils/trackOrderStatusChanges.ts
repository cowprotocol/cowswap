import { UiOrderType } from '@cowprotocol/types'

import { TradeType, TradeTrackingEventType, getActivityStatusString } from '../gtm/TradeTrackingEvents'
import { useTradeTracking } from '../hooks/useTradeTracking'

/**
 * ActivityStatus enum that matches the one in the application
 * This is defined here to avoid direct dependencies on the application code
 */
enum ActivityStatus {
  PENDING = 0,
  PRESIGNATURE_PENDING = 1,
  CONFIRMED = 2,
  EXPIRED = 3,
  CANCELLING = 4,
  CANCELLED = 5,
  CREATING = 6,
  FAILED = 7,
}

/**
 * Utility function to track order status changes (execution and failures)
 *
 * @param account - User's wallet address
 * @param orders - Record of orders by ID
 * @param activityItems - Array of activity items to process
 * @param orderType - Type of order (SWAP, LIMIT, TWAP, etc.)
 * @param tradeType - Type of trade for analytics
 * @param tradeTracking - Trade tracking instance from useTradeTracking hook
 * @param executedOrdersRef - Ref to track executed orders
 * @param failedOrdersRef - Ref to track failed orders
 * @param errorMessage - Optional custom error message for failed orders
 */
export function trackOrderStatusChanges(
  account: string | undefined,
  orders: Record<string, any>,
  activityItems: Array<{
    id: string
    status: number // Using number type to match the enum values
    type: string
    orderType: string
  }>,
  orderType: UiOrderType,
  tradeType: TradeType,
  tradeTracking: ReturnType<typeof useTradeTracking>,
  executedOrdersRef: React.MutableRefObject<Set<string>>,
  failedOrdersRef: React.MutableRefObject<Set<string>>,
  errorMessage = 'Order execution failed',
) {
  if (!account || !activityItems.length || !orders) return

  // Process only activity items for the specified order type
  activityItems.forEach((item) => {
    if (item.type !== 'order') return
    if (item.orderType !== orderType) return

    const order = orders[item.id]
    if (!order) return

    // Check for executed orders
    if (
      item.status === ActivityStatus.CONFIRMED &&
      order.status === 'fulfilled' &&
      !executedOrdersRef.current.has(item.id)
    ) {
      // Get executed amounts - safely convert to numbers
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
        console.error(`[Analytics] Error calculating ${orderType} amounts:`, error)
      }

      // Track order execution
      tradeTracking.onOrderExecuted({
        walletAddress: account,
        tradeType,
        fromAmount,
        fromCurrency: order.inputToken?.symbol || '',
        toAmount,
        toCurrency: order.outputToken?.symbol || '',
        contractAddress: order.inputToken?.address || '',
        transactionHash: order.fulfilledTransactionHash || order.id,
        orderId: item.id,
        orderStatus: getActivityStatusString(item.status),
      })

      console.info(
        `[Analytics] Tracked ${TradeTrackingEventType.ORDER_EXECUTED} event for ${orderType} order ${item.id}`,
      )

      // Mark order as tracked to prevent duplicate tracking
      executedOrdersRef.current.add(item.id)
    }

    // Check for failed orders
    if (item.status === ActivityStatus.FAILED && order.status === 'failed' && !failedOrdersRef.current.has(item.id)) {
      // Track order failure
      tradeTracking.onOrderFailed(
        {
          walletAddress: account,
          tradeType,
          fromCurrency: order.inputToken?.symbol || '',
          toCurrency: order.outputToken?.symbol || '',
          contractAddress: order.inputToken?.address || '',
          orderId: item.id,
          orderStatus: getActivityStatusString(item.status),
        },
        errorMessage,
      )

      console.info(`[Analytics] Tracked ${TradeTrackingEventType.ORDER_FAILED} event for ${orderType} order ${item.id}`)

      // Mark order as failure-tracked to prevent duplicate tracking
      failedOrdersRef.current.add(item.id)
    }
  })
}
