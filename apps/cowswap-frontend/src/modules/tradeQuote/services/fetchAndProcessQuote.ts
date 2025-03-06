import { onlyResolvesLast } from '@cowprotocol/common-utils'
import { OrderQuoteResponse, PriceQuality } from '@cowprotocol/cow-sdk'

import { getQuote } from 'api/cowProtocol/api'
import { FeeQuoteParams } from 'common/types'

import { TradeQuoteManager } from '../hooks/useTradeQuoteManager'

// Solves the problem of multiple requests
const getFastQuote = onlyResolvesLast<OrderQuoteResponse>(getQuote)
const getOptimalQuote = onlyResolvesLast<OrderQuoteResponse>(getQuote)

export interface TradeQuoteFetchParams {
  hasParamsChanged: boolean
  priceQuality: PriceQuality
  fetchStartTimestamp: number
}

export async function fetchAndProcessQuote(
  { hasParamsChanged, priceQuality, fetchStartTimestamp }: TradeQuoteFetchParams,
  quoteParams: FeeQuoteParams,
  tradeQuoteManager: TradeQuoteManager,
) {
  tradeQuoteManager.setLoading(hasParamsChanged)

  const isOptimalQuote = priceQuality === PriceQuality.OPTIMAL
  const requestParams = { ...quoteParams, priceQuality }
  const request = isOptimalQuote ? getOptimalQuote(requestParams) : getFastQuote(requestParams)

  try {
    const { cancelled, data } = await request

    if (cancelled) {
      return
    }

    tradeQuoteManager.onResponse(data, requestParams, fetchStartTimestamp)
  } catch (error) {
    console.log('[useGetQuote]:: fetchQuote error', error)
    tradeQuoteManager.onError(error, requestParams)
  }
}
