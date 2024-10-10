import { useAtomValue } from 'jotai'
import { useLayoutEffect, useMemo } from 'react'

import { useDebounce } from '@cowprotocol/common-hooks'
import { onlyResolvesLast } from '@cowprotocol/common-utils'
import { OrderQuoteResponse, PriceQuality } from '@cowprotocol/cow-sdk'
import { useAreUnsupportedTokens } from '@cowprotocol/tokens'

import ms from 'ms.macro'

import { useUpdateCurrencyAmount } from 'modules/trade/hooks/useUpdateCurrencyAmount'

import { getQuote } from 'api/cowProtocol/api'
import QuoteApiError, { QuoteApiErrorCodes } from 'api/cowProtocol/errors/QuoteError'

import { useProcessUnsupportedTokenError } from './useProcessUnsupportedTokenError'
import { useQuoteParams } from './useQuoteParams'
import { useUpdateTradeQuote } from './useUpdateTradeQuote'

import { tradeQuoteParamsAtom } from '../state/tradeQuoteParamsAtom'

export const PRICE_UPDATE_INTERVAL = ms`30s`
const AMOUNT_CHANGE_DEBOUNCE_TIME = ms`300`

// Solves the problem of multiple requests
const getFastQuote = onlyResolvesLast<OrderQuoteResponse>(getQuote)
const getOptimalQuote = onlyResolvesLast<OrderQuoteResponse>(getQuote)

export function useTradeQuotePolling() {
  const { amount, fastQuote } = useAtomValue(tradeQuoteParamsAtom)
  const amountStr = useDebounce(
    useMemo(() => amount?.quotient.toString() || null, [amount]),
    AMOUNT_CHANGE_DEBOUNCE_TIME,
  )
  const quoteParams = useQuoteParams(amountStr)

  const updateQuoteState = useUpdateTradeQuote()
  const updateCurrencyAmount = useUpdateCurrencyAmount()
  const getIsUnsupportedTokens = useAreUnsupportedTokens()
  const processUnsupportedTokenError = useProcessUnsupportedTokenError()

  useLayoutEffect(() => {
    if (!quoteParams) {
      updateQuoteState({ response: null, isLoading: false })
      return
    }

    const isUnsupportedTokens = getIsUnsupportedTokens(quoteParams)

    // Don't fetch quote if token is not supported
    if (isUnsupportedTokens) {
      return
    }

    const fetchQuote = (hasParamsChanged: boolean, priceQuality: PriceQuality, fetchStartTimestamp: number) => {
      updateQuoteState({ isLoading: true, hasParamsChanged })

      const isOptimalQuote = priceQuality === PriceQuality.OPTIMAL
      const requestParams = { ...quoteParams, priceQuality }
      const request = isOptimalQuote ? getOptimalQuote(requestParams) : getFastQuote(requestParams)

      return request
        .then((response) => {
          const { cancelled, data } = response

          if (cancelled) {
            return
          }

          updateQuoteState({
            response: data,
            quoteParams: requestParams,
            ...(isOptimalQuote ? { isLoading: false } : null),
            error: null,
            hasParamsChanged: false,
            fetchStartTimestamp,
          })
        })
        .catch((error: QuoteApiError) => {
          console.log('[useGetQuote]:: fetchQuote error', error)
          updateQuoteState({ isLoading: false, error, hasParamsChanged: false })

          if (error.type === QuoteApiErrorCodes.UnsupportedToken) {
            processUnsupportedTokenError(error, requestParams)
          }
        })
    }

    const fetchStartTimestamp = Date.now()
    if (fastQuote) fetchQuote(true, PriceQuality.FAST, fetchStartTimestamp)
    fetchQuote(true, PriceQuality.OPTIMAL, fetchStartTimestamp)

    const intervalId = setInterval(() => {
      const fetchStartTimestamp = Date.now()
      if (fastQuote) fetchQuote(false, PriceQuality.FAST, fetchStartTimestamp)
      fetchQuote(false, PriceQuality.OPTIMAL, fetchStartTimestamp)
    }, PRICE_UPDATE_INTERVAL)

    return () => clearInterval(intervalId)
  }, [
    fastQuote,
    quoteParams,
    updateQuoteState,
    updateCurrencyAmount,
    processUnsupportedTokenError,
    getIsUnsupportedTokens,
  ])

  return null
}
