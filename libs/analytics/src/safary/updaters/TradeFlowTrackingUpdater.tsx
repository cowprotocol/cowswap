import { useEffect, useRef, ReactNode } from 'react'

import { SafaryTradeType } from '../SafaryAnalytics'
import { useSafaryAnalytics } from '../useSafaryAnalytics'

/**
 * The minimum interface required for orders
 */
export interface OrderForTracking {
  id: string
  status: string
  inputToken?: {
    symbol?: string
    address?: string
    decimals?: number
  }
  outputToken?: {
    symbol?: string
    decimals?: number
  }
  sellAmount?: { toString(): string }
  buyAmount?: { toString(): string }
  fulfilledTransactionHash?: string
}

/**
 * The minimum interface required for activity items
 */
export interface ActivityItemForTracking {
  id: string
  status: string
  type: string
  orderType?: string
}

/**
 * Order status constants
 */
export interface OrderStatusConstants {
  activityTypeName: string
  fulfilledStatus: string
  failedStatus: string
  orderFulfilledStatus: string
  orderFailedStatus: string
}

/**
 * Props for the TradeFlowTrackingUpdater component
 */
export interface TradeFlowTrackingUpdaterProps {
  /**
   * Account address from wallet
   */
  account?: string

  /**
   * Optional custom page view name (defaults to 'page_view')
   */
  pageView?: string

  /**
   * Type of orders to track (e.g., "SWAP", "LIMIT", "TWAP")
   */
  orderType: string

  /**
   * Type of trade for Safary tracking
   * Uses SafaryTradeType enum values (e.g., "swap", "limit_order", "twap_order")
   */
  tradeType?: string

  /**
   * Orders by ID mapping
   */
  ordersById: Record<string, OrderForTracking>

  /**
   * Activity items to track
   */
  activityItems: ActivityItemForTracking[]

  /**
   * Status constants for tracking fulfilled and failed orders
   */
  statusConstants: OrderStatusConstants

  /**
   * Label for logging (e.g., "swap", "limit order", "TWAP order")
   */
  label?: string

  /**
   * Optional children
   */
  children?: ReactNode
}

/**
 * Universal updater component that tracks all aspects of a trade flow for Safary analytics
 *
 * This component tracks:
 * 1. Page views
 * 2. Wallet connections
 * 3. Order execution events
 * 4. Order failure events
 *
 * It can be included in any trading mode (swap, advanced orders, TWAP, etc.)
 *
 * Usage example:
 * ```tsx
 * <TradeFlowTrackingUpdater
 *   account={account}
 *   pageView="swap_page_view"
 *   orderType={UiOrderType.SWAP}
 *   tradeType={SafaryTradeType.SWAP_ORDER}
 *   ordersById={ordersById}
 *   activityItems={activityItems}
 *   statusConstants={{
 *     activityTypeName: 'order',
 *     fulfilledStatus: 'fulfilled',
 *     failedStatus: 'failed',
 *     orderFulfilledStatus: 'fulfilled',
 *     orderFailedStatus: 'failed',
 *   }}
 *   label="swap"
 * />
 * ```
 */
export function TradeFlowTrackingUpdater({
  account,
  pageView = 'page_view',
  orderType,
  tradeType = SafaryTradeType.SWAP_ORDER,
  ordersById,
  activityItems,
  statusConstants,
  label = 'order',
  children,
}: TradeFlowTrackingUpdaterProps): JSX.Element | null {
  const safaryAnalytics = useSafaryAnalytics()

  // Keep track of processed order IDs using refs
  const executedOrdersRef = useRef<Set<string>>(new Set())
  const failedOrdersRef = useRef<Set<string>>(new Set())

  // Track page view when component mounts
  useEffect(() => {
    if (safaryAnalytics.hasSafary) {
      // Track page view
      safaryAnalytics.trackPageView(pageView)
      console.info(`[Safary] Tracking page view: ${pageView}`) // Info logging for verification
    }
  }, [safaryAnalytics, pageView])

  // Track wallet connection when account changes
  useEffect(() => {
    if (safaryAnalytics.hasSafary && account) {
      // When wallet gets connected, track the connection
      safaryAnalytics.trackWalletConnected(account)
    }
  }, [safaryAnalytics, account])

  const { activityTypeName, fulfilledStatus, failedStatus, orderFulfilledStatus, orderFailedStatus } = statusConstants

  // Track order execution and failures
  useEffect(() => {
    if (!account || !safaryAnalytics.hasSafary || !activityItems.length || !ordersById) return

    // Process only activity items for the specified order type
    activityItems.forEach((item) => {
      if (item.type !== activityTypeName) return
      if (item.orderType !== orderType) return

      const order = ordersById[item.id]
      if (!order) return

      // Check for executed orders
      if (
        item.status === fulfilledStatus &&
        order.status === orderFulfilledStatus &&
        !executedOrdersRef.current.has(item.id) // Prevent duplicate tracking
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
          console.error(`[Safary] Error calculating ${label} amounts:`, error)
        }

        // Track order execution
        safaryAnalytics.trackOrderExecuted(account, tradeType, {
          fromAmount,
          fromCurrency: order.inputToken?.symbol || '',
          toAmount,
          toCurrency: order.outputToken?.symbol || '',
          contractAddress: order.inputToken?.address || '',
          transactionHash: order.fulfilledTransactionHash || order.id,
        })

        console.info(`[Safary] Tracked ${label} execution for order ${item.id}`)

        // Mark order as tracked to prevent duplicate tracking
        executedOrdersRef.current.add(item.id)
      }

      // Check for failed orders
      if (
        item.status === failedStatus &&
        order.status === orderFailedStatus &&
        !failedOrdersRef.current.has(item.id) // Prevent duplicate tracking
      ) {
        // Track order failure
        safaryAnalytics.trackOrderFailed(
          account,
          tradeType,
          {
            fromCurrency: order.inputToken?.symbol || '',
            toCurrency: order.outputToken?.symbol || '',
            contractAddress: order.inputToken?.address || '',
          },
          `${label} execution failed`,
        )

        console.info(`[Safary] Tracked ${label} failure for order ${item.id}`)

        // Mark order as failure-tracked to prevent duplicate tracking
        failedOrdersRef.current.add(item.id)
      }
    })
  }, [
    account,
    activityItems,
    ordersById,
    safaryAnalytics,
    orderType,
    tradeType,
    label,
    activityTypeName,
    fulfilledStatus,
    failedStatus,
    orderFulfilledStatus,
    orderFailedStatus,
  ])

  return children ? <>{children}</> : null
}
