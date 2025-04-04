import { useSetAtom } from 'jotai/index'
import { useMemo } from 'react'

import { PriceQuality, SupportedChainId, TradeParameters } from '@cowprotocol/cow-sdk'
import { QuoteAndPost } from '@cowprotocol/cow-sdk'

import QuoteApiError, { QuoteApiErrorCodes } from 'api/cowProtocol/errors/QuoteError'

import { useProcessUnsupportedTokenError } from './useProcessUnsupportedTokenError'

import { updateTradeQuoteAtom } from '../state/tradeQuoteAtom'
import { SellTokenAddress } from '../state/tradeQuoteInputAtom'
import { TradeQuoteFetchParams } from '../types'

export interface TradeQuoteManager {
  setLoading(hasParamsChanged: boolean): void
  reset(): void
  onError(
    error: QuoteApiError,
    chainId: SupportedChainId,
    quoteParams: TradeParameters,
    fetchParams: TradeQuoteFetchParams,
  ): void
  onResponse(data: QuoteAndPost, fetchParams: TradeQuoteFetchParams): void
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
              error: QuoteApiError,
              chainId: SupportedChainId,
              quoteParams: TradeParameters,
              fetchParams: TradeQuoteFetchParams,
            ) {
              update(sellTokenAddress, { error, fetchParams, isLoading: false, hasParamsChanged: false })

              if (error.type === QuoteApiErrorCodes.UnsupportedToken) {
                processUnsupportedTokenError(error, chainId, quoteParams)
              }
            },
            onResponse(quote: QuoteAndPost, fetchParams: TradeQuoteFetchParams) {
              const isOptimalQuote = fetchParams.priceQuality === PriceQuality.OPTIMAL

              update(sellTokenAddress, {
                quote,
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
