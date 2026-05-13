import { onlyResolvesLast } from '@cowprotocol/common-utils'
import { PriceQuality, SwapAdvancedSettings, QuoteAndPost } from '@cowprotocol/cow-sdk'
import {
  BridgeProviderQuoteError,
  BridgeQuoteErrors,
  CrossChainQuoteAndPost,
  MultiQuoteRequest,
  MultiQuoteResult,
  QuoteBridgeRequest,
} from '@cowprotocol/sdk-bridging'

import { bridgingSdk } from 'tradingSdk/bridgingSdk'

import { AppDataInfo } from 'modules/appData'

import { mapOperatorErrorToQuoteError, QuoteApiError, QuoteApiErrorCodes } from 'api/cowProtocol/errors/QuoteError'
import { getIsOrderBookTypedError } from 'api/cowProtocol/getIsOrderBookTypedError'
import { coWBFFClient } from 'common/services/bff'

import { TradeQuoteManager } from '../hooks/useTradeQuoteManager'
import { TradeQuoteFetchParams, TradeQuotePollingParameters } from '../types'
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

  const processQuoteError = (errorLocation: string, error: unknown): void => {
    const parsedError = parseError(errorLocation, error)

    console.error(`[fetchAndProcessQuote]:: ${errorLocation} error`, parsedError)

    tradeQuoteManager.onError(parsedError, chainId, quoteParams, fetchParams)
  }

  tradeQuoteManager.setLoading(hasParamsChanged, quoteParams)

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
  processQuoteError: (errorLocation: string, error: unknown) => void,
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

    tradeQuoteManager.onResponse(quoteAndPost, null, fetchParams, quoteParams)
  } catch (error) {
    processQuoteError('fetchSwapQuote', error)
  }
}

async function fetchBridgingQuote(
  fetchParams: TradeQuoteFetchParams,
  quoteParams: QuoteBridgeRequest,
  advancedSettings: SwapAdvancedSettings,
  tradeQuoteManager: TradeQuoteManager,
  processQuoteError: (errorLocation: string, error: unknown) => void,
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

          tradeQuoteManager.onResponse(quoteAndPost, bridge, fetchParams, quoteParams)
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

    const error = data?.error

    if (error) {
      throw error
    }
    // bridgingSdk.getBestQuote() is not supposed to throw any error
    // we only expect error to be returned as promise result
  } catch (error) {
    processQuoteError('fetchBridgingQuote', error)
  }
}

function parseError(errorLocation: string, error: unknown): QuoteApiError | BridgeProviderQuoteError {
  if (error instanceof QuoteApiError || error instanceof BridgeProviderQuoteError) {
    return error
  }

  if (error instanceof Error) {
    if (getIsOrderBookTypedError(error)) {
      const errorObject = mapOperatorErrorToQuoteError(error.body)

      if (errorObject) return new QuoteApiError(errorObject)
    }
  }

  return errorLocation === 'fetchSwapQuote'
    ? new QuoteApiError({
        errorType: QuoteApiErrorCodes.UNHANDLED_ERROR,
        description: String(error),
      })
    : new BridgeProviderQuoteError(BridgeQuoteErrors.API_ERROR, { context: error })
}
