import { onlyResolvesLast } from '@cowprotocol/common-utils'
import { jotaiStore } from '@cowprotocol/core'
import { SwapAdvancedSettings, QuoteAndPost, isSolanaChain } from '@cowprotocol/cow-sdk'
import {
  BridgeProviderQuoteError,
  BridgeQuoteErrors,
  CrossChainQuoteAndPost,
  MultiQuoteRequest,
  MultiQuoteResult,
  QuoteBridgeRequest,
} from '@cowprotocol/sdk-bridging'

import { t } from '@lingui/core/macro'
import {
  getCaptchaToken,
  isQuoteRateLimited,
  pauseQuotesOnRateLimit,
  quoteRateLimitedUntilAtom,
} from 'entities/captcha/state/quoteRateLimitedUntilAtom'
import { bridgingSdk } from 'tradingSdk/bridgingSdk'

import { AppDataInfo } from 'modules/appData'

import { QuoteApiError, QuoteApiErrorCodes } from 'api/cowProtocol/errors/QuoteError'
import { getIsQuoteApiTypedError } from 'api/cowProtocol/getIsOrderBookTypedError'
import { coWBFFClient } from 'common/services/bff'

import { getSolanaQuote } from './getSolanaQuote.service'

import { TradeQuoteManager } from '../hooks/useTradeQuoteManager'
import { SolanaQuoteAndPost, TradeQuoteFetchParams, TradeQuotePollingParameters } from '../types'
import { getBridgeQuoteSigner } from '../utils/getBridgeQuoteSigner'
import { getIsFinalQuote } from '../utils/getIsFastQuote'

const getQuote = bridgingSdk.getQuote.bind(bridgingSdk)
const getFastQuote = onlyResolvesLast<CrossChainQuoteAndPost>(getQuote)
const getFinalQuote = onlyResolvesLast<CrossChainQuoteAndPost>(getQuote)
const getBestQuote = onlyResolvesLast<MultiQuoteResult | null>(bridgingSdk.getBestQuote.bind(bridgingSdk))
// Same per-tier "only the latest call wins" protection the EVM path gets above — without it, a slow
// FAST Solana quote resolving after a newer OPTIMAL one (or an earlier poll's request resolving after
// a later one) could overwrite it in TradeQuoteManager.
const getFastSolanaQuote = onlyResolvesLast<SolanaQuoteAndPost>(getSolanaQuote)
const getOptimalSolanaQuote = onlyResolvesLast<SolanaQuoteAndPost>(getSolanaQuote)

export async function fetchAndProcessQuote(
  fetchParams: TradeQuoteFetchParams,
  quoteParams: QuoteBridgeRequest,
  { useSuggestedSlippageApi }: TradeQuotePollingParameters,
  appData: AppDataInfo['doc'] | undefined,
  tradeQuoteManager: TradeQuoteManager,
  isSolanaAvailable = false,
  getCorrelatedTokens?: SwapAdvancedSettings['getCorrelatedTokens'],
): Promise<void> {
  const { priceQuality } = fetchParams

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
    allowIntermediateEqSellToken: true,
  }

  const captchaToken = getCaptchaToken()

  const processQuoteError = (errorLocation: string, error: unknown): void => {
    const parsedError = pauseQuotesOnRateLimit(error, captchaToken)
      ? getTooManyRequestsError()
      : parseError(errorLocation, error)

    console.error(`[fetchAndProcessQuote]:: ${errorLocation} error`, parsedError)

    tradeQuoteManager.onError(parsedError, chainId, quoteParams, fetchParams)
  }

  tradeQuoteManager.setLoading(fetchParams, quoteParams)

  try {
    // Answer like the order book would, without a request. Skipping the fetch would leave an edited amount on the old quote.
    if (isQuoteRateLimited(jotaiStore.get(quoteRateLimitedUntilAtom))) {
      tradeQuoteManager.onError(getTooManyRequestsError(), chainId, quoteParams, fetchParams)
    } else if (isBridge) {
      await fetchBridgingQuote(fetchParams, quoteParams, advancedSettings, tradeQuoteManager, processQuoteError)
    } else {
      await fetchSwapQuote(
        fetchParams,
        quoteParams,
        advancedSettings,
        tradeQuoteManager,
        processQuoteError,
        isSolanaAvailable,
      )
    }
  } finally {
    tradeQuoteManager.onSettled(fetchParams)
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

async function fetchSwapQuote(
  fetchParams: TradeQuoteFetchParams,
  quoteParams: QuoteBridgeRequest,
  advancedSettings: SwapAdvancedSettings,
  tradeQuoteManager: TradeQuoteManager,
  processQuoteError: (errorLocation: string, error: unknown) => void,
  isSolanaAvailable: boolean,
): Promise<void> {
  const isFinalQuote = getIsFinalQuote(fetchParams)

  if (isSolanaAvailable && isSolanaChain(quoteParams.sellTokenChainId)) {
    const solanaRequest = isFinalQuote
      ? getOptimalSolanaQuote(quoteParams, advancedSettings)
      : getFastSolanaQuote(quoteParams, advancedSettings)

    try {
      const { cancelled, data } = await solanaRequest

      if (cancelled) {
        return
      }

      tradeQuoteManager.onResponse(data, null, fetchParams, quoteParams)
    } catch (error) {
      processQuoteError('fetchSwapQuote', error)
    }

    return
  }

  const request = isFinalQuote
    ? getFinalQuote(quoteParams, advancedSettings)
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

function getTooManyRequestsError(): QuoteApiError {
  return new QuoteApiError({
    errorType: QuoteApiErrorCodes.TooManyRequests,
    description: t`Too many price requests from your browser or network. Prices will refresh automatically.`,
  })
}

function parseError(errorLocation: string, error: unknown): QuoteApiError | BridgeProviderQuoteError {
  if (error instanceof QuoteApiError || error instanceof BridgeProviderQuoteError) {
    return error
  }

  if (error instanceof Error) {
    if (getIsQuoteApiTypedError(error)) {
      return new QuoteApiError(error.body)
    }
  }

  return errorLocation === 'fetchSwapQuote'
    ? new QuoteApiError(String(error))
    : new BridgeProviderQuoteError(BridgeQuoteErrors.API_ERROR, { context: error })
}
