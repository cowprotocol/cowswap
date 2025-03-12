import { useCallback } from 'react'

import { Currency } from '@uniswap/sdk-core'

import {
  SafaryEventAction,
  SafaryTradeParams,
  SafaryTradeType,
  hasSafary,
  trackSafaryEvent,
  trackSafaryTradeEvent,
} from './SafaryAnalytics'

/**
 * Hook for using Safary analytics in React components
 *
 * Note: Account must be provided from components using this hook to avoid circular dependencies
 */
export function useSafaryAnalytics() {
  /**
   * Track page view event
   * @param pageView - Custom page view name
   */
  const trackPageView = useCallback((pageView: string) => {
    if (!hasSafary()) return

    trackSafaryEvent(SafaryEventAction.PAGE_VIEW, pageView)
  }, [])

  /**
   * Track wallet connection event
   */
  const trackWalletConnected = useCallback((account: string | undefined, walletName?: string) => {
    if (!hasSafary() || !account) return

    trackSafaryEvent(SafaryEventAction.WALLET_CONNECTED, 'wallet_connected', {
      walletAddress: account,
      walletType: walletName || 'unknown',
    })
  }, [])

  /**
   * Track token selection event
   */
  const trackTokenSelected = useCallback(
    (account: string | undefined, field: string, currency: Currency | null | undefined) => {
      if (!hasSafary() || !account || !currency) return

      trackSafaryEvent(SafaryEventAction.TOKEN_SELECTED, 'token_selected', {
        walletAddress: account,
        tokenAddress: currency.isToken ? currency.address : 'NATIVE',
        tokenSymbol: currency.symbol || 'unknown',
        field,
      })
    },
    [],
  )

  /**
   * Track order submission event
   * @param account - User's wallet address
   * @param tradeType - Type of trade (swap, limit_order, twap_order)
   * @param params - Trade parameters
   */
  const trackOrderSubmitted = useCallback(
    (
      account: string | undefined,
      tradeType: string = SafaryTradeType.SWAP_ORDER,
      params: Omit<Partial<SafaryTradeParams>, 'walletAddress'>,
    ) => {
      if (!hasSafary() || !account) return

      trackSafaryTradeEvent(tradeType, SafaryEventAction.ORDER_SUBMITTED, {
        walletAddress: account,
        tradeType,
        ...params,
      })
    },
    [],
  )

  /**
   * Track order execution event
   * @param account - User's wallet address
   * @param tradeType - Type of trade (swap, limit_order, twap_order)
   * @param params - Trade parameters
   */
  const trackOrderExecuted = useCallback(
    (
      account: string | undefined,
      tradeType: string = SafaryTradeType.SWAP_ORDER,
      params: Omit<Partial<SafaryTradeParams>, 'walletAddress'>,
    ) => {
      if (!hasSafary() || !account) return

      trackSafaryTradeEvent(tradeType, SafaryEventAction.ORDER_EXECUTED, {
        walletAddress: account,
        tradeType,
        ...params,
      })
    },
    [],
  )

  /**
   * Track order failure event
   * @param account - User's wallet address
   * @param tradeType - Type of trade (swap, limit_order, twap_order)
   * @param params - Trade parameters
   * @param error - Optional error message
   */
  const trackOrderFailed = useCallback(
    (
      account: string | undefined,
      tradeType: string = SafaryTradeType.SWAP_ORDER,
      params: Omit<Partial<SafaryTradeParams>, 'walletAddress'>,
      error?: string,
    ) => {
      if (!hasSafary() || !account) return

      trackSafaryTradeEvent(tradeType, SafaryEventAction.ORDER_FAILED, {
        walletAddress: account,
        tradeType,
        ...params,
        // Add error to parameters object which will be safely handled by trackSafaryTradeEvent
        ...(error ? { error } : {}),
      } as Partial<SafaryTradeParams>)
    },
    [],
  )

  return {
    trackPageView,
    trackWalletConnected,
    trackTokenSelected,
    trackOrderSubmitted,
    trackOrderExecuted,
    trackOrderFailed,
    hasSafary: hasSafary(),
  }
}
