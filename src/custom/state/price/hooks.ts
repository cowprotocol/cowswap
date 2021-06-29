import { useActiveWeb3React } from '@src/hooks'
import { useSwapState } from '@src/state/swap/hooks'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { AppDispatch, AppState } from 'state'
import {
  updateQuote,
  UpdateQuoteParams,
  ClearQuoteParams,
  getNewQuoteStart,
  GetQuoteParams as GetQuoteStartParams,
  refreshQuoteStart,
  SetQuoteErrorParams,
  setQuoteError
} from './actions'
import { QuoteInformationObject, QuotesMap } from './reducer'

type GetNewQuoteStartCallback = (quoteLoadingParams: GetQuoteStartParams) => void
type RefreshQuoteStartCallback = () => void
type AddPriceCallback = (addFeeParams: UpdateQuoteParams) => void
type SetQuoteErrorCallback = (setQuoteErrorParams: SetQuoteErrorParams) => void

export const useAllQuotes = ({
  chainId
}: Partial<Pick<ClearQuoteParams, 'chainId'>>): Partial<QuotesMap> | undefined => {
  return useSelector<AppState, Partial<QuotesMap> | undefined>(state => {
    const quotes = chainId && state.price.quotes[chainId]

    if (!quotes) return {}

    return quotes
  })
}

export const useQuote = ({ token, chainId }: Partial<ClearQuoteParams>): QuoteInformationObject | undefined => {
  return useSelector<AppState, QuoteInformationObject | undefined>(state => {
    const fees = chainId && state.price.quotes[chainId]

    if (!fees) return undefined

    return token ? fees[token] : undefined
  })
}

export const useIsQuoteLoading = () =>
  useSelector<AppState, boolean>(state => {
    return state.price.loading
  })

interface UseGetQuoteAndStatus {
  quote?: QuoteInformationObject
  isGettingNewQuote: boolean
  isRefreshingQuote: boolean
}

export const useGetQuoteAndStatus = (params: Partial<ClearQuoteParams>): UseGetQuoteAndStatus => {
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
    INPUT: { currencyId }
  } = useSwapState()
  const { isRefreshingQuote } = useGetQuoteAndStatus({ token: currencyId, chainId })
  return isRefreshingQuote
}

export const useGetNewQuoteStart = (): GetNewQuoteStartCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback((quoteLoadingParams: GetQuoteStartParams) => dispatch(getNewQuoteStart(quoteLoadingParams)), [
    dispatch
  ])
}

export const useRefreshQuoteStart = (): RefreshQuoteStartCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback(() => dispatch(refreshQuoteStart()), [dispatch])
}

export const useUpdateQuote = (): AddPriceCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback((updateQuoteParams: UpdateQuoteParams) => dispatch(updateQuote(updateQuoteParams)), [dispatch])
}

export const useSetQuoteError = (): SetQuoteErrorCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback((setQuoteErrorParams: SetQuoteErrorParams) => dispatch(setQuoteError(setQuoteErrorParams)), [
    dispatch
  ])
}

interface QuoteDispatchers {
  getNewQuoteStart: GetNewQuoteStartCallback
  refreshQuoteStart: RefreshQuoteStartCallback
  updateQuote: AddPriceCallback
  setQuoteError: SetQuoteErrorCallback
}

export const useQuoteDispatchers = (): QuoteDispatchers => {
  return {
    getNewQuoteStart: useGetNewQuoteStart(),
    refreshQuoteStart: useRefreshQuoteStart(),
    updateQuote: useUpdateQuote(),
    setQuoteError: useSetQuoteError()
  }
}
