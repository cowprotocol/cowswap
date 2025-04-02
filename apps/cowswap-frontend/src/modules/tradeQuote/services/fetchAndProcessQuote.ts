import { onlyResolvesLast } from '@cowprotocol/common-utils'
import { PriceQuality, CrossChainQuoteAndPost, SupportedChainId, QuoteBridgeRequest } from '@cowprotocol/cow-sdk'

import { bridgingSdk } from 'tradingSdk/bridgingSdk'

import { AppDataInfo } from 'modules/appData'

import QuoteApiError, { mapOperatorErrorToQuoteError } from 'api/cowProtocol/errors/QuoteError'
import { getIsOrderBookTypedError } from 'api/cowProtocol/getIsOrderBookTypedError'

import { TradeQuoteManager } from '../hooks/useTradeQuoteManager'
import { TradeQuoteFetchParams } from '../types'
import { getBridgeQuoteSigner } from '../utils/getBridgeQuoteSigner'

const getQuote = bridgingSdk.getQuote.bind(bridgingSdk)
const getFastQuote = onlyResolvesLast<CrossChainQuoteAndPost>(getQuote)
const getOptimalQuote = onlyResolvesLast<CrossChainQuoteAndPost>(getQuote)

export async function fetchAndProcessQuote(
  chainId: SupportedChainId,
  fetchParams: TradeQuoteFetchParams,
  quoteParams: QuoteBridgeRequest,
  appData: AppDataInfo['doc'] | undefined,
  tradeQuoteManager: TradeQuoteManager,
) {
  const { hasParamsChanged, priceQuality } = fetchParams
  const isOptimalQuote = priceQuality === PriceQuality.OPTIMAL

  const isBridge = quoteParams.sellTokenChainId !== quoteParams.buyTokenChainId
  const advancedSettings = {
    quoteRequest: {
      priceQuality,
    },
    appData: appData,
    quoteSigner: isBridge ? getBridgeQuoteSigner(chainId) : undefined,
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

    tradeQuoteManager.onResponse(
      {
        quoteResults: (data as any).swap || (data as any).quoteResults, // TODO fix types
        postSwapOrderFromQuote: data.postSwapOrderFromQuote,
      },
      fetchParams,
    )
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
