import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { AppDispatch, AppState } from 'state'
import {
  updateQuote,
  clearQuote,
  UpdateQuoteParams,
  ClearQuoteParams,
  SetQuoteErrorParams,
  setQuoteError,
  setLoadingQuote
} from './actions'
import { QuoteInformationObject, QuotesMap } from './reducer'

type SetLoadPriceCallback = (isLoading: boolean) => void
type AddPriceCallback = (addFeeParams: UpdateQuoteParams) => void
type ClearPriceCallback = (clearFeeParams: ClearQuoteParams) => void
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

export const useGetQuoteAndStatus = (
  params: Partial<ClearQuoteParams>
): [QuoteInformationObject | undefined, boolean] => {
  const quote = useQuote(params)
  const isLoading = useIsQuoteLoading()
  return [quote, isLoading]
}

export const useSetLoadingQuote = (): SetLoadPriceCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback((isLoading: boolean) => dispatch(setLoadingQuote(isLoading)), [dispatch])
}

export const useUpdateQuote = (): AddPriceCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback((updateQuoteParams: UpdateQuoteParams) => dispatch(updateQuote(updateQuoteParams)), [dispatch])
}

export const useClearQuote = (): ClearPriceCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback((clearQuoteParams: ClearQuoteParams) => dispatch(clearQuote(clearQuoteParams)), [dispatch])
}

export const useSetQuoteError = (): SetQuoteErrorCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback((setQuoteErrorParams: SetQuoteErrorParams) => dispatch(setQuoteError(setQuoteErrorParams)), [
    dispatch
  ])
}

interface QuoteDispatchers {
  setLoadingQuote: SetLoadPriceCallback
  updateQuote: AddPriceCallback
  clearQuote: ClearPriceCallback
  setQuoteError: SetQuoteErrorCallback
}

export const useQuoteDispatchers = (): QuoteDispatchers => {
  return {
    setLoadingQuote: useSetLoadingQuote(),
    updateQuote: useUpdateQuote(),
    clearQuote: useClearQuote(),
    setQuoteError: useSetQuoteError()
  }
}
