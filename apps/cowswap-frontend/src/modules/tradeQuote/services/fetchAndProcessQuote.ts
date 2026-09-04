import { IS_SOLANA_ENABLED } from '@cowprotocol/common-const'
import { onlyResolvesLast } from '@cowprotocol/common-utils'
import { SwapAdvancedSettings, QuoteAndPost, isSolanaChain } from '@cowprotocol/cow-sdk'
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

import { QuoteApiError } from 'api/cowProtocol/errors/QuoteError'
import { getIsQuoteApiTypedError } from 'api/cowProtocol/getIsOrderBookTypedError'
import { coWBFFClient } from 'common/services/bff'

import { getSolanaMockQuote } from './getSolanaMockQuote'

import { TradeQuoteManager } from '../hooks/useTradeQuoteManager'
import { TradeQuoteFetchParams, TradeQuotePollingParameters } from '../types'
import { getBridgeQuoteSigner } from '../utils/getBridgeQuoteSigner'
import { getIsFinalQuote } from '../utils/getIsFastQuote'

const getQuote = bridgingSdk.getQuote.bind(bridgingSdk)
const getFastQuote = onlyResolvesLast<CrossChainQuoteAndPost>(getQuote)
const getFinalQuote = onlyResolvesLast<CrossChainQuoteAndPost>(getQuote)
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
    allowIntermediateEqSellToken: true,
  }

  const processQuoteError = (errorLocation: string, error: unknown): void => {
    const parsedError = parseError(errorLocation, error)

    console.error(`[fetchAndProcessQuote]:: ${errorLocation} error`, parsedError)

    // TODO(solana): temporary, tied to IS_SOLANA_ENABLED. There is no Solana quote backend yet, so swallow
    // Solana quote errors instead of surfacing them (`reset` just clears the loading spinner). The swap
    // path serves a mock quote (see `fetchSwapQuote`), so this mainly covers any other Solana error.
    // Remove once real Solana quotes are wired — surfaces on the IS_SOLANA_ENABLED cleanup grep.
    if (IS_SOLANA_ENABLED && isSolanaChain(chainId)) {
      console.warn('[fetchAndProcessQuote]:: Solana quote error ignored (no Solana quote backend yet)', parsedError)
      tradeQuoteManager.reset()

      return
    }

    tradeQuoteManager.onError(parsedError, chainId, quoteParams, fetchParams)
  }

  tradeQuoteManager.setLoading(hasParamsChanged, quoteParams)

  if (isBridge) {
    await fetchBridgingQuote(fetchParams, quoteParams, advancedSettings, tradeQuoteManager, processQuoteError)
  } else {
    await fetchSwapQuote(fetchParams, quoteParams, advancedSettings, tradeQuoteManager, processQuoteError)
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
): Promise<void> {
  // TODO(solana): temporary, tied to IS_SOLANA_ENABLED. There is no Solana quote backend yet — serve a
  // mock quote so the trade-widget flow can reach the Approve step. Remove once real Solana quotes are
  // wired — surfaces on the IS_SOLANA_ENABLED cleanup grep.
  if (IS_SOLANA_ENABLED && isSolanaChain(quoteParams.sellTokenChainId)) {
    tradeQuoteManager.onResponse(getSolanaMockQuote(quoteParams), null, fetchParams, quoteParams)

    return
  }

  const request = getIsFinalQuote(fetchParams)
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
