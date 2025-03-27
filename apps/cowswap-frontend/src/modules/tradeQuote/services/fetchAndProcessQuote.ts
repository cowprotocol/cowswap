import { TradeParameters } from '@cowprotocol/cow-sdk'

import { tradingSdk } from 'tradingSdk/tradingSdk'

import { AppDataInfo } from 'modules/appData'

import { TradeQuoteManager } from '../hooks/useTradeQuoteManager'
import { TradeQuoteFetchParams } from '../types'

export async function fetchAndProcessQuote(
  fetchParams: TradeQuoteFetchParams,
  quoteParams: TradeParameters,
  appData: AppDataInfo['doc'] | undefined,
  tradeQuoteManager: TradeQuoteManager,
) {
  const { hasParamsChanged, priceQuality } = fetchParams

  tradeQuoteManager.setLoading(hasParamsChanged)

  try {
    // TODO: add cancelling of the previous request
    const quote = await tradingSdk.getQuote(quoteParams, {
      quoteRequest: {
        priceQuality,
      },
      appData: appData,
    })

    tradeQuoteManager.onResponse(quote, fetchParams)
  } catch (error) {
    console.log('[useGetQuote]:: fetchQuote error', error)
    tradeQuoteManager.onError(error, tradingSdk.traderParams.chainId, quoteParams, fetchParams)
  }
}
