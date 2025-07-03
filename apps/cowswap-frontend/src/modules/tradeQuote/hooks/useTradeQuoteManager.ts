import { useSetAtom } from 'jotai'
import { useMemo } from 'react'

import { BridgeQuoteResults, PriceQuality, QuoteBridgeRequest, SupportedChainId } from '@cowprotocol/cow-sdk'
import { QuoteAndPost } from '@cowprotocol/cow-sdk'

import { QuoteApiError, QuoteApiErrorCodes } from 'api/cowProtocol/errors/QuoteError'

import { useProcessUnsupportedTokenError } from './useProcessUnsupportedTokenError'

import { TradeQuoteState, updateTradeQuoteAtom } from '../state/tradeQuoteAtom'
import { SellTokenAddress } from '../state/tradeQuoteInputAtom'
import { TradeQuoteFetchParams } from '../types'

export interface TradeQuoteManager {
  setLoading(hasParamsChanged: boolean): void
  reset(): void
  onError(
    error: TradeQuoteState['error'],
    chainId: SupportedChainId,
    quoteParams: QuoteBridgeRequest,
    fetchParams: TradeQuoteFetchParams,
  ): void
  onResponse(data: QuoteAndPost, bridgeQuote: BridgeQuoteResults | null, fetchParams: TradeQuoteFetchParams): void
}

/**
 * Validates quote response for edge cases that API doesn't properly handle
 * Returns QuoteApiError if quote should be treated as an error, null otherwise
 */
function validateQuoteResponse(quote: QuoteAndPost): QuoteApiError | null {
  // API sometimes returns successful response with buyAmount=0
  // instead of proper FeeExceedsFrom error, causing incorrect UI state
  const quoteData = quote.quoteResults.quoteResponse?.quote
  const buyAmount = quoteData?.buyAmount
  const sellAmount = quoteData?.sellAmount
  const feeAmount = quoteData?.feeAmount

  // Check if quote represents an impossible trade (zero output)
  const isZeroBuyAmount = buyAmount === '0' || buyAmount === '0n'

  if (isZeroBuyAmount && sellAmount && feeAmount) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Quote validation: Converting zero-output quote to FeeExceedsFrom error', {
        buyAmount,
        sellAmount,
        feeAmount,
        reason: 'Fees exceed sellAmount, resulting in zero buyAmount',
      })
    }

    return new QuoteApiError({
      errorType: QuoteApiErrorCodes.FeeExceedsFrom,
      description: 'Sell amount is too small',
      data: {
        fee_amount: feeAmount,
        sell_amount: sellAmount,
      },
    })
  }

  return null
}

export function useTradeQuoteManager(sellTokenAddress: SellTokenAddress | undefined): TradeQuoteManager | null {
  const update = useSetAtom(updateTradeQuoteAtom)
  const processUnsupportedTokenError = useProcessUnsupportedTokenError()

  return useMemo(
    () =>
      sellTokenAddress
        ? {
            setLoading(hasParamsChanged: boolean) {
              update(sellTokenAddress, {
                isLoading: true,
                hasParamsChanged,
                ...(hasParamsChanged ? { quote: null } : null),
              })
            },
            reset() {
              update(sellTokenAddress, { quote: null, isLoading: false })
            },
            onError(
              error: TradeQuoteState['error'],
              chainId: SupportedChainId,
              quoteParams: QuoteBridgeRequest,
              fetchParams: TradeQuoteFetchParams,
            ) {
              update(sellTokenAddress, { error, fetchParams, isLoading: false, hasParamsChanged: false })

              if (error instanceof QuoteApiError && error.type === QuoteApiErrorCodes.UnsupportedToken) {
                processUnsupportedTokenError(error, chainId, quoteParams)
              }
            },
            onResponse(
              quote: QuoteAndPost,
              bridgeQuote: BridgeQuoteResults | null,
              fetchParams: TradeQuoteFetchParams,
            ) {
              const isOptimalQuote = fetchParams.priceQuality === PriceQuality.OPTIMAL

              // Validate quote for edge cases that API doesn't handle properly
              const validationError = validateQuoteResponse(quote)
              if (validationError) {
                update(sellTokenAddress, {
                  error: validationError,
                  fetchParams,
                  isLoading: false,
                  hasParamsChanged: false,
                })
                return
              }

              update(sellTokenAddress, {
                quote,
                bridgeQuote,
                ...(isOptimalQuote ? { isLoading: false } : null),
                error: null,
                hasParamsChanged: false,
                fetchParams,
              })
            },
          }
        : null,
    [update, processUnsupportedTokenError, sellTokenAddress],
  )
}
