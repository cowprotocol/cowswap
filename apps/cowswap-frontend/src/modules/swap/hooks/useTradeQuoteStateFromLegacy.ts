import { useMemo } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { useGetQuoteAndStatus } from 'legacy/state/price/hooks'

import { TradeQuoteState } from 'modules/tradeQuote'

import { useDerivedSwapInfo } from './useSwapState'

export function useTradeQuoteStateFromLegacy(): TradeQuoteState | null {
  const { chainId } = useWalletInfo()
  const { currenciesIds } = useDerivedSwapInfo()
  const { quote, isGettingNewQuote, isRefreshingQuote } = useGetQuoteAndStatus({
    token: currenciesIds.INPUT,
    chainId,
  })

  const isLoading = isGettingNewQuote || isRefreshingQuote

  return useMemo(
    () => ({
      response: quote?.response || null,
      error: quote?.originalError || null,
      isLoading,
      quoteParams: quote || null,
      localQuoteTimestamp: quote?.localQuoteTimestamp || null,
      hasParamsChanged: isGettingNewQuote,
    }),
    [quote, isLoading, isGettingNewQuote]
  )
}
