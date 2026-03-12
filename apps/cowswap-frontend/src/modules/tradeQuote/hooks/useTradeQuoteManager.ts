import { useSetAtom } from 'jotai'
import { useMemo, useRef } from 'react'

import { PriceQuality, QuoteAndPost, SupportedChainId } from '@cowprotocol/cow-sdk'
import { BridgeQuoteResults, QuoteBridgeRequest } from '@cowprotocol/sdk-bridging'

import { QuoteApiError, QuoteApiErrorCodes } from 'api/cowProtocol/errors/QuoteError'

import { useProcessUnsupportedTokenError } from './useProcessUnsupportedTokenError'

import { TradeQuoteState, updateTradeQuoteAtom } from '../state/tradeQuoteAtom'
import { SellTokenAddress } from '../state/tradeQuoteInputAtom'
import { TradeQuoteFetchParams } from '../types'

export interface TradeQuoteManager {
  setLoading(hasParamsChanged: boolean, quoteParams: QuoteBridgeRequest): void

  reset(): void

  onError(
    error: TradeQuoteState['error'],
    chainId: SupportedChainId,
    quoteParams: QuoteBridgeRequest,
    fetchParams: TradeQuoteFetchParams,
  ): void

  onResponse(
    data: QuoteAndPost,
    bridgeQuote: BridgeQuoteResults | null,
    fetchParams: TradeQuoteFetchParams,
    quoteParams: QuoteBridgeRequest,
  ): void
}

export function useTradeQuoteManager(sellTokenAddress: SellTokenAddress | undefined): TradeQuoteManager | null {
  const update = useSetAtom(updateTradeQuoteAtom)
  const processUnsupportedTokenError = useProcessUnsupportedTokenError()
  const lastQuoteParamsRef = useRef<QuoteBridgeRequest | null>(null)

  return useMemo((): TradeQuoteManager | null => {
    if (!sellTokenAddress) return null

    const setLoading = (hasParamsChanged: boolean, quoteParams: QuoteBridgeRequest): void => {
      lastQuoteParamsRef.current = quoteParams

      update(sellTokenAddress, {
        isLoading: true,
        hasParamsChanged,
      })
    }

    const reset = (): void => {
      lastQuoteParamsRef.current = null
      update(sellTokenAddress, { quote: null, isLoading: false })
    }

    const onError = (
      error: TradeQuoteState['error'],
      chainId: SupportedChainId,
      quoteParams: QuoteBridgeRequest,
      fetchParams: TradeQuoteFetchParams,
    ): void => {
      if (isStaleQuote(lastQuoteParamsRef.current, quoteParams)) {
        reset()
        return
      }

      update(sellTokenAddress, {
        error,
        fetchParams,
        isLoading: false,
        hasParamsChanged: false,
        isBridgeQuote: quoteParams.sellTokenChainId !== quoteParams.buyTokenChainId,
      })

      if (error instanceof QuoteApiError && error.type === QuoteApiErrorCodes.UnsupportedToken) {
        processUnsupportedTokenError(error, chainId, quoteParams)
      }
    }

    const onResponse = (
      quote: QuoteAndPost,
      bridgeQuote: BridgeQuoteResults | null,
      fetchParams: TradeQuoteFetchParams,
      quoteParams: QuoteBridgeRequest,
    ): void => {
      if (isStaleQuote(lastQuoteParamsRef.current, quoteParams)) {
        reset()
        return
      }

      const isOptimalQuote = fetchParams.priceQuality === PriceQuality.OPTIMAL

      update(sellTokenAddress, {
        quote,
        bridgeQuote,
        ...(isOptimalQuote ? { isLoading: false } : null),
        error: null,
        hasParamsChanged: false,
        fetchParams,
      })
    }

    return {
      setLoading,
      reset,
      onError,
      onResponse,
    }
  }, [update, processUnsupportedTokenError, sellTokenAddress])
}

function isStaleQuote(lastQuoteParams: QuoteBridgeRequest | null, quoteParams: QuoteBridgeRequest): boolean {
  if (!lastQuoteParams) return false

  // Typically, amount will be the param that changes most often, so we check that first. Otherwise, we check all the other ones:
  return (
    lastQuoteParams?.amount !== quoteParams.amount ||
    Object.entries(lastQuoteParams).some(([key, value]) => value !== quoteParams[key as keyof QuoteBridgeRequest])
  )
}
