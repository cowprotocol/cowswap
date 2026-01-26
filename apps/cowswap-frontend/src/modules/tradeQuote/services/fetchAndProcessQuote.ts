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

import { mapOperatorErrorToQuoteError, QuoteApiError, QuoteApiErrorCodes } from 'api/cowProtocol/errors/QuoteError'
import { getIsOrderBookTypedError } from 'api/cowProtocol/getIsOrderBookTypedError'
import { coWBFFClient } from 'common/services/bff'

import { TradeQuoteManager } from '../hooks/useTradeQuoteManager'
import { QuotePollingUpdateTimings, TradeQuoteFetchParams, TradeQuotePollingParameters } from '../types'
import { getBridgeQuoteSigner } from '../utils/getBridgeQuoteSigner'

const getQuote = bridgingSdk.getQuote.bind(bridgingSdk)

const getFastQuote = onlyResolvesLast<CrossChainQuoteAndPost>(getQuote)
const getOptimalQuote = onlyResolvesLast<CrossChainQuoteAndPost>(getQuote)
const getBestQuote = onlyResolvesLast<MultiQuoteResult | null>(bridgingSdk.getBestQuote.bind(bridgingSdk))

export async function fetchAndProcessQuote(
  fetchParams: TradeQuoteFetchParams,
  quoteParams: QuoteBridgeRequest,
  { useSuggestedSlippageApi }: TradeQuotePollingParameters,
  appData: AppDataInfo['doc'] | undefined,
  tradeQuoteManager: TradeQuoteManager,
  timings: QuotePollingUpdateTimings,
  getCorrelatedTokens?: SwapAdvancedSettings['getCorrelatedTokens'],
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
    getSlippageSuggestion: useSuggestedSlippageApi ? coWBFFClient.getSlippageTolerance.bind(coWBFFClient) : undefined,
    getCorrelatedTokens,
    // TODO: sell=buy feature. Set allowIntermediateEqSellToken: true once the feature is ready
    // allowIntermediateEqSellToken: true
  }

  const processQuoteError = (error: Error): void => {
    // Skip state update when another quote already started
    if (timings.ref.current && timings.now !== timings.ref.current) return

    const parsedError = parseError(error)

    console.error('[fetchAndProcessQuote]:: fetchQuote error', parsedError)

    if (parsedError instanceof QuoteApiError) {
      tradeQuoteManager.onError(parsedError, chainId, quoteParams, fetchParams)
    } else {
      tradeQuoteManager.onError(
        new QuoteApiError({
          errorType: QuoteApiErrorCodes.UNHANDLED_ERROR,
          description: String(error),
        }),
        chainId,
        quoteParams,
        fetchParams,
      )
    }
  }

  tradeQuoteManager.setLoading(hasParamsChanged)

  if (isBridge) {
    await fetchBridgingQuote(fetchParams, quoteParams, advancedSettings, tradeQuoteManager, processQuoteError, timings)
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
  timings: QuotePollingUpdateTimings,
): Promise<void> {
  let isRequestCancelled = false

  const multiQuoteRequest: MultiQuoteRequest = {
    quoteBridgeRequest: quoteParams,
    advancedSettings,
    options: {
      onQuoteResult(result: MultiQuoteResult) {
        if (isRequestCancelled) return

        if (result.quote) {
          const { swap, bridge, postSwapOrderFromQuote } = result.quote
          const quoteAndPost = { quoteResults: swap, postSwapOrderFromQuote: postSwapOrderFromQuote }

          tradeQuoteManager.onResponse(quoteAndPost, bridge, fetchParams)
        }
      },
    },
  }

  try {
    const { cancelled, data } = await getBestQuote(multiQuoteRequest)

    if (cancelled) {
      isRequestCancelled = true
      return
    }

    // TODO: remove after resting
    const error = localStorage.getItem('EMULATE_QUOTE_ERROR') ? new Error('QUOTE ERROR') : data?.error

    if (error) {
      // Skip state update when another quote already started
      if (timings.ref.current && timings.now !== timings.ref.current) return

      if (error instanceof BridgeProviderQuoteError) {
        tradeQuoteManager.onError(error, quoteParams.sellTokenChainId, quoteParams, fetchParams)
        return
      }

      processQuoteError(error)
    }
    // bridgingSdk.getBestQuote() is not supposed to throw any error
    // we only expect error to be returned as promise result
  } catch (error) {
    console.error('[fetchAndProcessQuote]:: unexpected bridge error', error)
    const unexpectedError = error instanceof Error ? error : new Error(String(error))
    processQuoteError(unexpectedError)
  }
}

function parseError(error: Error): QuoteApiError | Error {
  if (getIsOrderBookTypedError(error)) {
    const errorObject = mapOperatorErrorToQuoteError(error.body)

    return errorObject ? new QuoteApiError(errorObject) : error
  }

  return error
}
