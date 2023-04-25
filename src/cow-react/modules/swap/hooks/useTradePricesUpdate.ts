import { useIsBestQuoteLoading, useIsQuoteLoading, useIsQuoteRefreshing } from 'state/price/hooks'
import useLoadingWithTimeout from 'hooks/useLoadingWithTimeout'
import { LONG_LOAD_THRESHOLD, SHORT_LOAD_THRESHOLD } from 'constants/index'
import { useMemo } from 'react'

export function useTradePricesUpdate(): boolean {
  const isRefreshingQuote = useIsQuoteRefreshing()
  const isBestQuoteLoading = useIsBestQuoteLoading()
  const isQuoteLoading = useIsQuoteLoading()

  const showCowLoader = useLoadingWithTimeout(isRefreshingQuote, LONG_LOAD_THRESHOLD)
  const showQuoteLoader = useLoadingWithTimeout(isBestQuoteLoading || isQuoteLoading, SHORT_LOAD_THRESHOLD)

  return useMemo(() => showCowLoader || showQuoteLoader, [showCowLoader, showQuoteLoader])
}
