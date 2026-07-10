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
      const prevQuoteParams = lastQuoteParamsRef.current
      lastQuoteParamsRef.current = quoteParams

      // Drop a stale error only when the trade subject itself (token pair / amount / kind)
      // changes, e.g. after the user switches the buy token. We deliberately ignore
      // slippage-only param changes: clearing the error there would let smart slippage
      // recompute (it returns null while an error is shown), flip the quote params back,
      // and re-trigger this branch — flickering the form between error and loading.
      const tradeSubjectChanged = didTradeSubjectChange(prevQuoteParams, quoteParams)

      update(sellTokenAddress, {
        isLoading: true,
        hasParamsChanged,
        ...(tradeSubjectChanged ? { error: null } : null),
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

// Whether the actual trade subject changed: the token pair, amount or order kind.
// Slippage and other tangential params are intentionally excluded so that a slippage
// recompute (which happens when an error is cleared) does not look like a new trade.
function didTradeSubjectChange(prevQuoteParams: QuoteBridgeRequest | null, quoteParams: QuoteBridgeRequest): boolean {
  if (!prevQuoteParams) return false

  return (
    prevQuoteParams.kind !== quoteParams.kind ||
    prevQuoteParams.amount !== quoteParams.amount ||
    prevQuoteParams.sellTokenAddress !== quoteParams.sellTokenAddress ||
    prevQuoteParams.sellTokenChainId !== quoteParams.sellTokenChainId ||
    prevQuoteParams.buyTokenAddress !== quoteParams.buyTokenAddress ||
    prevQuoteParams.buyTokenChainId !== quoteParams.buyTokenChainId
  )
}

function isStaleQuote(lastQuoteParams: QuoteBridgeRequest | null, quoteParams: QuoteBridgeRequest): boolean {
  // lastQuoteParams is set from setLoading, so onError/onResponse should always find a matching value there. If they
  // don't, then that's because reset was called, so we ignore all quotes until setLoading re-sets lastQuoteParams.
  if (!lastQuoteParams) return true

  // Typically, amount will be the param that changes most often, so we check that first. Otherwise, we check all the other ones:
  return (
    lastQuoteParams.amount !== quoteParams.amount ||
    Object.entries(lastQuoteParams).some(([key, value]) => value !== quoteParams[key as keyof QuoteBridgeRequest])
  )
}
