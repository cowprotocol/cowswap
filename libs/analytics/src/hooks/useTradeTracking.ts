import { useCallback } from 'react'

import { Currency } from '@uniswap/sdk-core'

import {
  trackPageView,
  trackWalletConnected,
  trackTokenSelected,
  trackOrderSubmitted,
  trackOrderExecuted,
  trackOrderFailed,
} from '../gtm/TradeTrackingEvents'

export type TradeType = 'swap' | 'limit_order' | 'twap_order'

/**
 * Hook for tracking trade-related events through GTM
 */
export function useTradeTracking() {
  /**
   * Track page view
   */
  const onPageView = useCallback((pageView: string) => {
    trackPageView(pageView)
  }, [])

  /**
   * Track wallet connection
   */
  const onWalletConnected = useCallback((account: string, walletName?: string) => {
    trackWalletConnected(account, walletName)
  }, [])

  /**
   * Track token selection
   */
  const onTokenSelected = useCallback((account: string, field: string, currency: Currency | null | undefined) => {
    trackTokenSelected(account, field, currency)
  }, [])

  /**
   * Track order submission
   */
  const onOrderSubmitted = useCallback(
    (params: {
      walletAddress: string
      tradeType: TradeType
      fromAmount?: number
      fromCurrency?: string
      fromAmountUSD?: number
      toAmount?: number
      toCurrency?: string
      toAmountUSD?: number
      contractAddress?: string
      orderId?: string
    }) => {
      trackOrderSubmitted(params)
    },
    [],
  )

  /**
   * Track order execution (successful trade)
   */
  const onOrderExecuted = useCallback(
    (params: {
      walletAddress: string
      tradeType: TradeType
      fromAmount?: number
      fromCurrency?: string
      fromAmountUSD?: number
      toAmount?: number
      toCurrency?: string
      toAmountUSD?: number
      contractAddress?: string
      transactionHash?: string
      orderId?: string
    }) => {
      trackOrderExecuted(params)
    },
    [],
  )

  /**
   * Track order failure
   */
  const onOrderFailed = useCallback(
    (
      params: {
        walletAddress: string
        tradeType: TradeType
        fromCurrency?: string
        toCurrency?: string
        contractAddress?: string
        orderId?: string
      },
      error?: string,
    ) => {
      trackOrderFailed(params, error)
    },
    [],
  )

  /**
   * Check if window and dataLayer are available
   */
  const isTrackingAvailable = typeof window !== 'undefined' && !!window.dataLayer

  return {
    onPageView,
    onWalletConnected,
    onTokenSelected,
    onOrderSubmitted,
    onOrderExecuted,
    onOrderFailed,
    isTrackingAvailable,
  }
}
