import { useActiveWeb3React } from 'hooks/web3'
import { useSwapState } from '@src/state/swap/hooks'
import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { LONG_LOAD_THRESHOLD, SHORT_LOAD_THRESHOLD } from 'constants/index'
import useLoadingWithTimeout from 'hooks/useLoadingWithTimeout'

import { AppDispatch, AppState } from 'state'
import {
  updateQuote,
  UpdateQuoteParams,
  ClearQuoteParams,
  getNewQuote,
  GetQuoteParams,
  refreshQuote,
  SetQuoteErrorParams,
  setQuoteError,
  RefreshQuoteParams,
} from './actions'
import { QuoteInformationObject, QuotesMap } from './reducer'
import { SupportedChainId as ChainId } from 'constants/chains'

type GetNewQuoteCallback = (params: GetQuoteParams) => void
type RefreshQuoteCallback = (params: RefreshQuoteParams) => void
type AddPriceCallback = (params: UpdateQuoteParams) => void
type SetQuoteErrorCallback = (params: SetQuoteErrorParams) => void

type QuoteParams = { chainId?: ChainId; token?: string | null }

export const useAllQuotes = ({
  chainId,
}: Partial<Pick<ClearQuoteParams, 'chainId'>>): Partial<QuotesMap> | undefined => {
  return useSelector<AppState, Partial<QuotesMap> | undefined>((state) => {
    const quotes = chainId && state.price.quotes[chainId]

    if (!quotes) return {}

    return quotes
  })
}

export const useQuote = ({ token, chainId }: QuoteParams): QuoteInformationObject | undefined => {
  return useSelector<AppState, QuoteInformationObject | undefined>((state) => {
    const fees = chainId && state.price.quotes[chainId]

    if (!fees) return undefined

    return token ? fees[token] : undefined
  })
}

export const useIsQuoteLoading = () =>
  useSelector<AppState, boolean>((state) => {
    return state.price.loading
  })

export const useIsBestQuoteLoading = () =>
  useSelector<AppState, boolean>((state) => {
    return state.price.loadingBestQuote
  })

interface UseGetQuoteAndStatus {
  quote?: QuoteInformationObject
  isGettingNewQuote: boolean
  isRefreshingQuote: boolean
}

export const useGetQuoteAndStatus = (params: QuoteParams): UseGetQuoteAndStatus => {
  const quote = useQuote(params)
  const isLoading = useIsQuoteLoading()

  const isGettingNewQuote = Boolean(isLoading && !quote?.price?.amount)
  const isRefreshingQuote = Boolean(isLoading && quote?.price?.amount)

  return { quote, isGettingNewQuote, isRefreshingQuote }
}

// syntactic sugar for not needing to pass swapstate
export function useIsQuoteRefreshing() {
  const { chainId } = useActiveWeb3React()
  const {
    INPUT: { currencyId },
  } = useSwapState()
  const { isRefreshingQuote } = useGetQuoteAndStatus({ token: currencyId, chainId })
  return isRefreshingQuote
}

export const useShowQuoteLoader = () => {
  const isRefreshingQuote = useIsQuoteRefreshing()
  const isBestQuoteLoading = useIsBestQuoteLoading()

  const showCowLoader = useLoadingWithTimeout(isRefreshingQuote, LONG_LOAD_THRESHOLD)
  const showQuoteLoader = useLoadingWithTimeout(isBestQuoteLoading, SHORT_LOAD_THRESHOLD)

  return useMemo(() => showCowLoader || showQuoteLoader, [showCowLoader, showQuoteLoader])
}

export const useGetNewQuote = (): GetNewQuoteCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback((params: GetQuoteParams) => dispatch(getNewQuote(params)), [dispatch])
}

export const useRefreshQuote = (): RefreshQuoteCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback((params: RefreshQuoteParams) => dispatch(refreshQuote(params)), [dispatch])
}

export const useUpdateQuote = (): AddPriceCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback((params: UpdateQuoteParams) => dispatch(updateQuote(params)), [dispatch])
}

export const useSetQuoteError = (): SetQuoteErrorCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback((params: SetQuoteErrorParams) => dispatch(setQuoteError(params)), [dispatch])
}

interface QuoteDispatchers {
  getNewQuote: GetNewQuoteCallback
  refreshQuote: RefreshQuoteCallback
  updateQuote: AddPriceCallback
  setQuoteError: SetQuoteErrorCallback
}

export const useQuoteDispatchers = (): QuoteDispatchers => {
  return {
    getNewQuote: useGetNewQuote(),
    refreshQuote: useRefreshQuote(),
    updateQuote: useUpdateQuote(),
    setQuoteError: useSetQuoteError(),
  }
}
