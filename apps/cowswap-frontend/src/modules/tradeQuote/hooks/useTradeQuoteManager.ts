import { useSetAtom } from 'jotai/index'
import { useMemo } from 'react'

import { OrderQuoteResponse, PriceQuality } from '@cowprotocol/cow-sdk'

import QuoteApiError, { QuoteApiErrorCodes } from 'api/cowProtocol/errors/QuoteError'
import { FeeQuoteParams } from 'common/types'

import { useProcessUnsupportedTokenError } from './useProcessUnsupportedTokenError'

import { updateTradeQuoteAtom } from '../state/tradeQuoteAtom'
import { SellTokenAddress } from '../state/tradeQuoteInputAtom'

export interface TradeQuoteManager {
  setLoading(hasParamsChanged: boolean): void
  reset(): void
  onError(error: QuoteApiError, requestParams: FeeQuoteParams): void
  onResponse(data: OrderQuoteResponse, requestParams: FeeQuoteParams, fetchStartTimestamp: number): void
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
                ...(hasParamsChanged ? { response: null } : null),
              })
            },
            reset() {
              update(sellTokenAddress, { response: null, isLoading: false })
            },
            onError(error: QuoteApiError, requestParams: FeeQuoteParams) {
              update(sellTokenAddress, { error, quoteParams: requestParams, isLoading: false, hasParamsChanged: false })

              if (error.type === QuoteApiErrorCodes.UnsupportedToken) {
                processUnsupportedTokenError(error, requestParams)
              }
            },
            onResponse(data: OrderQuoteResponse, requestParams: FeeQuoteParams, fetchStartTimestamp: number) {
              const isOptimalQuote = requestParams.priceQuality === PriceQuality.OPTIMAL

              update(sellTokenAddress, {
                response: data,
                quoteParams: requestParams,
                ...(isOptimalQuote ? { isLoading: false } : null),
                error: null,
                hasParamsChanged: false,
                fetchStartTimestamp,
              })
            },
          }
        : null,
    [update, processUnsupportedTokenError, sellTokenAddress],
  )
}
