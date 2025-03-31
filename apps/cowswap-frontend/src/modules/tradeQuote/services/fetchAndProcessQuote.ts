import { onlyResolvesLast } from '@cowprotocol/common-utils'
import { PriceQuality, QuoteAndPost, SupportedChainId, TradeParameters } from '@cowprotocol/cow-sdk'

import { tradingSdk } from 'tradingSdk/tradingSdk'

import { AppDataInfo } from 'modules/appData'

import QuoteApiError, { mapOperatorErrorToQuoteError } from 'api/cowProtocol/errors/QuoteError'
import { getIsOrderBookTypedError } from 'api/cowProtocol/getIsOrderBookTypedError'

import { TradeQuoteManager } from '../hooks/useTradeQuoteManager'
import { TradeQuoteFetchParams } from '../types'

const getQuote = tradingSdk.getQuote.bind(tradingSdk)
const getFastQuote = onlyResolvesLast<QuoteAndPost>(getQuote)
const getOptimalQuote = onlyResolvesLast<QuoteAndPost>(getQuote)

export async function fetchAndProcessQuote(
  chainId: SupportedChainId,
  fetchParams: TradeQuoteFetchParams,
  quoteParams: TradeParameters,
  appData: AppDataInfo['doc'] | undefined,
  tradeQuoteManager: TradeQuoteManager,
) {
  const { hasParamsChanged, priceQuality } = fetchParams
  const isOptimalQuote = priceQuality === PriceQuality.OPTIMAL
  const advancedSettings = {
    quoteRequest: {
      priceQuality,
    },
    appData: appData,
  }

  tradeQuoteManager.setLoading(hasParamsChanged)
  const request = isOptimalQuote
    ? getOptimalQuote(quoteParams, advancedSettings)
    : getFastQuote(quoteParams, advancedSettings)

  try {
    const { cancelled, data } = await request

    if (cancelled) {
      return
    }

    tradeQuoteManager.onResponse(data, fetchParams)
  } catch (error) {
    const parsedError = parseError(error)

    console.log('[useGetQuote]:: fetchQuote error', parsedError)

    if (parsedError instanceof QuoteApiError) {
      tradeQuoteManager.onError(parsedError, chainId, quoteParams, fetchParams)
    }
  }
}

function parseError(error: Error): QuoteApiError | Error {
  if (getIsOrderBookTypedError(error)) {
    const errorObject = mapOperatorErrorToQuoteError(error.body)

    return errorObject ? new QuoteApiError(errorObject) : error
  }

  return error
}
