import { onlyResolvesLast } from '@cowprotocol/common-utils'
import { PriceQuality, SwapAdvancedSettings } from '@cowprotocol/cow-sdk'
import {
  BridgeProviderQuoteError,
  CrossChainQuoteAndPost,
  MultiQuoteRequest,
  MultiQuoteResult,
  QuoteBridgeRequest,
} from '@cowprotocol/sdk-bridging'
import { QuoteAndPost } from '@cowprotocol/sdk-trading'

import { bridgingSdk } from 'tradingSdk/bridgingSdk'

import { AppDataInfo } from 'modules/appData'

import { mapOperatorErrorToQuoteError, QuoteApiError } from 'api/cowProtocol/errors/QuoteError'
import { getIsOrderBookTypedError } from 'api/cowProtocol/getIsOrderBookTypedError'

import { TradeQuoteManager } from '../hooks/useTradeQuoteManager'
import { TradeQuoteFetchParams } from '../types'
import { getBridgeQuoteSigner } from '../utils/getBridgeQuoteSigner'

const getQuote = bridgingSdk.getQuote.bind(bridgingSdk)
const getFastQuote = onlyResolvesLast<CrossChainQuoteAndPost>(getQuote)
const getOptimalQuote = onlyResolvesLast<CrossChainQuoteAndPost>(getQuote)

export async function fetchAndProcessQuote(
  fetchParams: TradeQuoteFetchParams,
  quoteParams: QuoteBridgeRequest,
  appData: AppDataInfo['doc'] | undefined,
  tradeQuoteManager: TradeQuoteManager,
): Promise<void> {
  const { hasParamsChanged, priceQuality } = fetchParams

  const chainId = quoteParams.sellTokenChainId
  const isBridge = quoteParams.sellTokenChainId !== quoteParams.buyTokenChainId

  const advancedSettings: SwapAdvancedSettings = {
    quoteRequest: {
      priceQuality,
    },
    appData,
    quoteSigner: isBridge ? getBridgeQuoteSigner(chainId) : undefined,
  }

  const processQuoteError = (error: Error): void => {
    const parsedError = parseError(error)

    console.error('[fetchAndProcessQuote]:: fetchQuote error', parsedError)

    if (parsedError instanceof QuoteApiError) {
      tradeQuoteManager.onError(parsedError, chainId, quoteParams, fetchParams)
    }
  }

  tradeQuoteManager.setLoading(hasParamsChanged)

  if (isBridge) {
    await fetchBridgingQuote(fetchParams, quoteParams, advancedSettings, tradeQuoteManager, processQuoteError)
  } else {
    await fetchSwapQuote(fetchParams, quoteParams, advancedSettings, tradeQuoteManager, processQuoteError)
  }
}

async function fetchSwapQuote(
  fetchParams: TradeQuoteFetchParams,
  quoteParams: QuoteBridgeRequest,
  advancedSettings: SwapAdvancedSettings,
  tradeQuoteManager: TradeQuoteManager,
  processQuoteError: (error: Error) => void,
): Promise<void> {
  const { priceQuality } = fetchParams
  const isOptimalQuote = priceQuality === PriceQuality.OPTIMAL

  const request = isOptimalQuote
    ? getOptimalQuote(quoteParams, advancedSettings)
    : getFastQuote(quoteParams, advancedSettings)

  try {
    const { cancelled, data } = await request

    if (cancelled) {
      return
    }

    const quoteAndPost = data as QuoteAndPost

    tradeQuoteManager.onResponse(quoteAndPost, null, fetchParams)
  } catch (error) {
    processQuoteError(error)
  }
}

async function fetchBridgingQuote(
  fetchParams: TradeQuoteFetchParams,
  quoteParams: QuoteBridgeRequest,
  advancedSettings: SwapAdvancedSettings,
  tradeQuoteManager: TradeQuoteManager,
  processQuoteError: (error: Error) => void,
): Promise<void> {
  const multiQuoteRequest: MultiQuoteRequest = {
    quoteBridgeRequest: quoteParams,
    advancedSettings,
    options: {
      onQuoteResult(result: MultiQuoteResult) {
        if (result.quote) {
          const { swap, bridge, postSwapOrderFromQuote } = result.quote
          const quoteAndPost = { quoteResults: swap, postSwapOrderFromQuote: postSwapOrderFromQuote }

          tradeQuoteManager.onResponse(quoteAndPost, bridge, fetchParams)
        }
      },
    },
  }

  try {
    const result = await bridgingSdk.getBestQuote(multiQuoteRequest)
    const error = result?.error

    if (error instanceof BridgeProviderQuoteError) {
      tradeQuoteManager.onError(error, quoteParams.sellTokenChainId, quoteParams, fetchParams)
      return
    }

    if (error) {
      processQuoteError(error)
    }
    // bridgingSdk.getBestQuote() is not supposed to throw any error
    // we only expect error to be returned as promise result
  } catch (error) {
    console.error('[fetchAndProcessQuote]:: unexpected bridge error', error)
  }
}

function parseError(error: Error): QuoteApiError | Error {
  if (getIsOrderBookTypedError(error)) {
    const errorObject = mapOperatorErrorToQuoteError(error.body)

    return errorObject ? new QuoteApiError(errorObject) : error
  }

  return error
}
