import { useSetAtom } from 'jotai/index'
import { useMemo } from 'react'

import { OrderQuoteResponse, PriceQuality } from '@cowprotocol/cow-sdk'

import QuoteApiError from 'api/cowProtocol/errors/QuoteError'
import { FeeQuoteParams } from 'common/types'

import { updateTradeQuoteAtom } from '../state/tradeQuoteAtom'
import { SellTokenAddress } from '../state/tradeQuoteInputAtom'

export interface TradeQuoteManager {
  setLoading(hasParamsChanged: boolean): void
  reset(): void
  onError(error: QuoteApiError): void
  onResponse(data: OrderQuoteResponse, requestParams: FeeQuoteParams, fetchStartTimestamp: number): void
}

export function useTradeQuoteManager(sellTokenAddress: SellTokenAddress | null): TradeQuoteManager | null {
  const update = useSetAtom(updateTradeQuoteAtom)

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
            onError(error: QuoteApiError) {
              update(sellTokenAddress, { isLoading: false, error, hasParamsChanged: false })
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
    [update, sellTokenAddress],
  )
}
