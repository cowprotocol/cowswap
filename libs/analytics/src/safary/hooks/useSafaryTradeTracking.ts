import { useMemo, useCallback } from 'react'

import { SafaryTradeType } from '../SafaryAnalytics'
import { useSafaryAnalytics } from '../useSafaryAnalytics'

/**
 * Input parameters for the trade tracking hook
 */
export interface TradeTrackingParams {
  /** User's account address */
  account?: string

  /** Input currency information */
  inputCurrencyInfo: {
    /** Currency symbol */
    symbol?: string
    /** Amount as a string or object with toString() method */
    amount?: { toString(): string } | string | null
    /** Amount in USD */
    fiatAmount?: number | null
  }

  /** Output currency information */
  outputCurrencyInfo: {
    /** Currency symbol */
    symbol?: string
    /** Amount as a string or object with toString() method */
    amount?: { toString(): string } | string | null
    /** Amount in USD */
    fiatAmount?: number | null
  }

  /** Original trade function to enhance with tracking */
  tradeFn: (...args: any[]) => Promise<any>

  /** Optional contract address (like the input token address) */
  contractAddress?: string

  /** Type of trade (swap, limit_order, twap_order) */
  tradeType?: string

  /** Optional label for the trade (for logging) */
  label?: string
}

/**
 * Hook that enhances a trade function with Safary analytics tracking
 *
 * @param params Parameters for tracking the trade
 * @returns Enhanced trade function that includes analytics tracking
 *
 * @example
 * ```
 * // In SwapConfirmModal
 * const doTrade = useSafaryTradeTracking({
 *   account,
 *   inputCurrencyInfo: {
 *     symbol: inputCurrency?.symbol,
 *     amount: inputCurrencyAmount,
 *     fiatAmount: inputCurrencyInfo.fiatAmount
 *   },
 *   outputCurrencyInfo: {
 *     symbol: outputCurrency?.symbol,
 *     amount: outputCurrencyAmount,
 *     fiatAmount: outputCurrencyInfo.fiatAmount
 *   },
 *   tradeFn: originalDoTrade,
 *   tradeType: SafaryTradeType.SWAP_ORDER
 * })
 * ```
 */
export function useSafaryTradeTracking({
  account,
  inputCurrencyInfo,
  outputCurrencyInfo,
  tradeFn,
  contractAddress,
  tradeType = SafaryTradeType.SWAP_ORDER,
  label,
}: TradeTrackingParams) {
  const safaryAnalytics = useSafaryAnalytics()

  // Use the label or derive it from the trade type
  const effectiveLabel = useMemo(() => {
    if (label) return label

    switch (tradeType) {
      case SafaryTradeType.LIMIT_ORDER:
        return 'limit order'
      case SafaryTradeType.TWAP_ORDER:
        return 'TWAP order'
      case SafaryTradeType.SWAP_ORDER:
      default:
        return 'swap'
    }
  }, [label, tradeType])

  // Safely extract currency symbols
  const fromCurrency = useMemo(() => inputCurrencyInfo.symbol || '', [inputCurrencyInfo.symbol])

  const toCurrency = useMemo(() => outputCurrencyInfo.symbol || '', [outputCurrencyInfo.symbol])

  // Safely convert amounts to numbers for tracking
  const safeParse = useCallback(
    (amount: any): number | undefined => {
      if (amount === undefined || amount === null) return undefined

      try {
        if (typeof amount === 'number') return amount
        if (typeof amount === 'string') return parseFloat(amount)
        if (typeof amount.toString === 'function') return parseFloat(amount.toString())
        return undefined
      } catch (error) {
        console.error(`[Safary] Error parsing amount for ${effectiveLabel}:`, error)
        return undefined
      }
    },
    [effectiveLabel],
  )

  // Enhanced trade function with analytics tracking
  return useCallback(
    async (...args: any[]) => {
      try {
        // Track the order submission before executing the trade
        if (safaryAnalytics.hasSafary && account) {
          const params = {
            fromCurrency,
            toCurrency,
            fromAmount: safeParse(inputCurrencyInfo.amount),
            toAmount: safeParse(outputCurrencyInfo.amount),
            fromAmountUSD: inputCurrencyInfo.fiatAmount || undefined,
            toAmountUSD: outputCurrencyInfo.fiatAmount || undefined,
            contractAddress: contractAddress || '',
          }

          safaryAnalytics.trackOrderSubmitted(account, tradeType, params)
          console.info(`[Safary] Tracked ${effectiveLabel} order submission`)
        }

        // Execute the original trade function
        return await tradeFn(...args)
      } catch (error) {
        // If there's an error, track the failure
        if (safaryAnalytics.hasSafary && account) {
          safaryAnalytics.trackOrderFailed(
            account,
            tradeType,
            {
              fromCurrency,
              toCurrency,
              contractAddress: contractAddress || '',
            },
            `${effectiveLabel} submission failed`,
          )
          console.error(`[Safary] Tracked ${effectiveLabel} failure:`, error)
        }

        // Re-throw the error to maintain the original behavior
        throw error
      }
    },
    [
      account,
      safaryAnalytics,
      fromCurrency,
      toCurrency,
      inputCurrencyInfo.amount,
      outputCurrencyInfo.amount,
      inputCurrencyInfo.fiatAmount,
      outputCurrencyInfo.fiatAmount,
      contractAddress,
      effectiveLabel,
      tradeType,
      tradeFn,
      safeParse,
    ],
  )
}
