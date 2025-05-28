import { onlyResolvesLast } from '@cowprotocol/common-utils'
import {
  PriceQuality,
  CrossChainQuoteAndPost,
  SupportedChainId,
  QuoteBridgeRequest,
  SwapAdvancedSettings,
  isBridgeQuoteAndPost,
  BridgeProviderQuoteError,
} from '@cowprotocol/cow-sdk'

import { bridgingSdk } from 'tradingSdk/bridgingSdk'

import { AppDataInfo } from 'modules/appData'

import { QuoteApiError, mapOperatorErrorToQuoteError } from 'api/cowProtocol/errors/QuoteError'
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

  const advancedSettings: SwapAdvancedSettings = {
    quoteRequest: {
      priceQuality,
    },
    appData: appData
      ? { appCode: appData.appCode, environment: appData.environment, metadata: appData.metadata }
      : undefined,
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

    const quoteAndPost = isBridgeQuoteAndPost(data)
      ? { quoteResults: data.swap, postSwapOrderFromQuote: data.postSwapOrderFromQuote }
      : { quoteResults: data.quoteResults, postSwapOrderFromQuote: data.postSwapOrderFromQuote }

    const bridgeQuote = isBridgeQuoteAndPost(data) ? data.bridge : null

    tradeQuoteManager.onResponse(quoteAndPost, bridgeQuote, fetchParams)
  } catch (error) {
    if (error instanceof BridgeProviderQuoteError) {
      tradeQuoteManager.onError(error, chainId, quoteParams, fetchParams)
      return
    }

    const parsedError = parseError(error)

    console.error('[fetchAndProcessQuote]:: fetchQuote error', parsedError)

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
