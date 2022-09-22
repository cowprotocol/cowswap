import { useIsBestQuoteLoading, useIsQuoteRefreshing } from 'state/price/hooks'
import useLoadingWithTimeout from 'hooks/useLoadingWithTimeout'
import { LONG_LOAD_THRESHOLD, SHORT_LOAD_THRESHOLD } from 'constants/index'
import { useMemo } from 'react'
import loadingCowWebp from 'assets/cow-swap/cow-load.webp'

export function useTradePricesUpdate(): boolean {
  const isRefreshingQuote = useIsQuoteRefreshing()
  const isBestQuoteLoading = useIsBestQuoteLoading()

  const showCowLoader = useLoadingWithTimeout(isRefreshingQuote, LONG_LOAD_THRESHOLD)
  const showQuoteLoader = useLoadingWithTimeout(isBestQuoteLoading, SHORT_LOAD_THRESHOLD)

  return useMemo(() => Boolean(loadingCowWebp) && (showCowLoader || showQuoteLoader), [showCowLoader, showQuoteLoader])
}
