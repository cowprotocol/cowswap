import { useMemo } from 'react'

import { LONG_LOAD_THRESHOLD, SHORT_LOAD_THRESHOLD } from '@cowswap/common-const'
import { useLoadingWithTimeout } from '@cowswap/common-hooks'
import { useWalletInfo } from '@cowswap/wallet'

import { useGetQuoteAndStatus, useIsBestQuoteLoading, useIsQuoteLoading } from 'legacy/state/price/hooks'

import { useSwapState } from './useSwapState'

export function useTradePricesUpdate(): boolean {
  const isRefreshingQuote = useIsQuoteRefreshing()
  const isBestQuoteLoading = useIsBestQuoteLoading()
  const isQuoteLoading = useIsQuoteLoading()

  const showCowLoader = useLoadingWithTimeout(isRefreshingQuote, LONG_LOAD_THRESHOLD)
  const showQuoteLoader = useLoadingWithTimeout(isBestQuoteLoading || isQuoteLoading, SHORT_LOAD_THRESHOLD)

  return useMemo(() => showCowLoader || showQuoteLoader, [showCowLoader, showQuoteLoader])
}

function useIsQuoteRefreshing(): boolean {
  const { chainId } = useWalletInfo()
  const {
    INPUT: { currencyId },
  } = useSwapState()
  const { isRefreshingQuote } = useGetQuoteAndStatus({ token: currencyId, chainId })
  return isRefreshingQuote
}
