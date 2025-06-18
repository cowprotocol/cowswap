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

export function useTradeQuoteManager(
  sellTokenAddress: SellTokenAddress | undefined,
): TradeQuoteManager | null {
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
