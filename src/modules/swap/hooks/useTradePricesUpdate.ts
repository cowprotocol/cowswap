import { useIsBestQuoteLoading, useIsQuoteLoading, useIsQuoteRefreshing } from 'legacy/state/price/hooks'
import useLoadingWithTimeout from 'legacy/hooks/useLoadingWithTimeout'
import { LONG_LOAD_THRESHOLD, SHORT_LOAD_THRESHOLD } from 'legacy/constants'
import { useMemo } from 'react'

export function useTradePricesUpdate(): boolean {
  const isRefreshingQuote = useIsQuoteRefreshing()
  const isBestQuoteLoading = useIsBestQuoteLoading()
  const isQuoteLoading = useIsQuoteLoading()

  const showCowLoader = useLoadingWithTimeout(isRefreshingQuote, LONG_LOAD_THRESHOLD)
  const showQuoteLoader = useLoadingWithTimeout(isBestQuoteLoading || isQuoteLoading, SHORT_LOAD_THRESHOLD)

  return useMemo(() => showCowLoader || showQuoteLoader, [showCowLoader, showQuoteLoader])
}
