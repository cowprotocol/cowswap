import { useEffect, ReactNode } from 'react'

import { useSafaryAnalytics } from '../useSafaryAnalytics'

/**
 * Props for the BasicTradeFlowTrackingUpdater component
 */
export interface BasicTradeFlowTrackingUpdaterProps {
  /**
   * Account address from wallet
   */
  account?: string

  /**
   * Custom page view name (required)
   */
  pageView: string

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
 * Simplified trade flow tracker that only handles page views and wallet connections
 *
 * This is a simplified version of TradeFlowTrackingUpdater that doesn't require
 * order tracking props. It's useful when you want to track basic events without
 * setting up order tracking yet.
 *
 * This component tracks:
 * 1. Page views
 * 2. Wallet connections
 *
 * Usage example:
 * ```tsx
 * <BasicTradeFlowTrackingUpdater
 *   account={account}
 *   pageView="swap_page_view"
 *   label="swap"
 * />
 * ```
 */
export function BasicTradeFlowTrackingUpdater({
  account,
  pageView,
  label = 'order',
  children,
}: BasicTradeFlowTrackingUpdaterProps): JSX.Element | null {
  const safaryAnalytics = useSafaryAnalytics()

  // Track page view when component mounts
  useEffect(() => {
    if (safaryAnalytics.hasSafary) {
      // Track page view
      safaryAnalytics.trackPageView(pageView)
      console.info(`[Safary] Tracking page view: ${pageView} for ${label}`) // Info logging for verification
    }
  }, [safaryAnalytics, pageView, label])

  // Track wallet connection when account changes
  useEffect(() => {
    if (safaryAnalytics.hasSafary && account) {
      // When wallet gets connected, track the connection
      safaryAnalytics.trackWalletConnected(account)
    }
  }, [safaryAnalytics, account])

  return children ? <>{children}</> : null
}
