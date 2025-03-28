import { onlyResolvesLast } from '@cowprotocol/common-utils'
import { PriceQuality, CrossChainQuoteAndPost, SupportedChainId, QuoteBridgeRequest } from '@cowprotocol/cow-sdk'

import { bridgingSdk } from 'tradingSdk/bridgingSdk'

import { AppDataInfo } from 'modules/appData'

import { TradeQuoteManager } from '../hooks/useTradeQuoteManager'
import { TradeQuoteFetchParams } from '../types'

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

    tradeQuoteManager.onResponse(
      {
        quoteResults: (data as any).swap || (data as any).quoteResults, // TODO fix types
        postSwapOrderFromQuote: data.postSwapOrderFromQuote,
      },
      fetchParams,
    )
  } catch (error) {
    console.log('[useGetQuote]:: fetchQuote error', error)
    tradeQuoteManager.onError(error, chainId, quoteParams, fetchParams)
  }
}
