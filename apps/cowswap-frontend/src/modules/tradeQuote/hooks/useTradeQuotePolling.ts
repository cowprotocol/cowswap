import { useAtomValue } from 'jotai'
import { useLayoutEffect, useMemo, useRef } from 'react'

import { useDebounce, useIsOnline, useIsWindowVisible } from '@cowprotocol/common-hooks'
import { onlyResolvesLast } from '@cowprotocol/common-utils'
import { OrderQuoteResponse, PriceQuality } from '@cowprotocol/cow-sdk'
import { useAreUnsupportedTokens } from '@cowprotocol/tokens'

import ms from 'ms.macro'

import { useUpdateCurrencyAmount } from 'modules/trade/hooks/useUpdateCurrencyAmount'

import { getQuote } from 'api/cowProtocol/api'
import QuoteApiError, { QuoteApiErrorCodes } from 'api/cowProtocol/errors/QuoteError'

import { useProcessUnsupportedTokenError } from './useProcessUnsupportedTokenError'
import { useQuoteParams } from './useQuoteParams'
import { useTradeQuote } from './useTradeQuote'
import { useUpdateTradeQuote } from './useUpdateTradeQuote'

import { tradeQuoteInputAtom } from '../state/tradeQuoteInputAtom'
import { isQuoteExpired } from '../utils/quoteDeadline'
import { quoteUsingSameParameters } from '../utils/quoteUsingSameParameters'

export const PRICE_UPDATE_INTERVAL = ms`30s`
const QUOTE_EXPIRATION_CHECK_INTERVAL = ms`2s`
const AMOUNT_CHANGE_DEBOUNCE_TIME = ms`300`

// Solves the problem of multiple requests
const getFastQuote = onlyResolvesLast<OrderQuoteResponse>(getQuote)
const getOptimalQuote = onlyResolvesLast<OrderQuoteResponse>(getQuote)

export function useTradeQuotePolling() {
  const { amount, fastQuote, orderKind } = useAtomValue(tradeQuoteInputAtom)
  const tradeQuote = useTradeQuote()
  const tradeQuoteRef = useRef(tradeQuote)
  tradeQuoteRef.current = tradeQuote

  /**
   * It's important to keep amount and orderKind together in order to have consistent quoteParams
   */
  const quoteInputDebounced = useDebounce(
    useMemo(() => ({ amount: amount?.quotient.toString() || null, orderKind }), [amount, orderKind]),
    AMOUNT_CHANGE_DEBOUNCE_TIME,
  )
  const quoteParams = useQuoteParams(quoteInputDebounced.amount, quoteInputDebounced.orderKind)

  const updateQuoteState = useUpdateTradeQuote()
  const updateCurrencyAmount = useUpdateCurrencyAmount()
  const getIsUnsupportedTokens = useAreUnsupportedTokens()
  const processUnsupportedTokenError = useProcessUnsupportedTokenError()

  const isWindowVisible = useIsWindowVisible()
  const isWindowVisibleRef = useRef(isWindowVisible)
  isWindowVisibleRef.current = isWindowVisible

  const isOnline = useIsOnline()
  const isOnlineRef = useRef(isOnline)
  isOnlineRef.current = isOnline

  useLayoutEffect(() => {
    if (!quoteParams || quoteParams.amount === '0') {
      updateQuoteState({ response: null, isLoading: false })
      return
    }

    const isUnsupportedTokens = getIsUnsupportedTokens(quoteParams)

    // Don't fetch quote if token is not supported
    if (isUnsupportedTokens) {
      return
    }

    const currentQuote = tradeQuoteRef.current
    const currentQuoteParams = currentQuote.quoteParams

    // Don't fetch quote if the parameters are the same
    // Also avoid quote refresh when only appData.quote (contains slippage) is changed
    //Important! We should skip quote updateing only if there is no quote response
    if (currentQuote.response && currentQuoteParams && quoteUsingSameParameters(currentQuoteParams, quoteParams)) {
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

    function fetchAndUpdateQuote(paramsChanged: boolean) {
      // When browser is offline or the tab is not active do no fetch
      if (!isOnlineRef.current || !isWindowVisibleRef.current) {
        return
      }

      const fetchStartTimestamp = Date.now()
      if (fastQuote) fetchQuote(paramsChanged, PriceQuality.FAST, fetchStartTimestamp)
      fetchQuote(paramsChanged, PriceQuality.OPTIMAL, fetchStartTimestamp)
    }

    /**
     * Fetch the quote instantly once the quote params are changed
     */
    fetchAndUpdateQuote(true)

    /**
     * Start polling for the quote
     */
    const pollingIntervalId = setInterval(() => {
      fetchAndUpdateQuote(false)
    }, PRICE_UPDATE_INTERVAL)

    /**
     * Periodically check if the quote has expired and refetch it
     */
    const quoteExpirationInterval = setInterval(() => {
      const currentQuote = tradeQuoteRef.current

      if (
        currentQuote.response &&
        currentQuote.quoteParams?.priceQuality === PriceQuality.OPTIMAL &&
        isQuoteExpired(currentQuote)
      ) {
        /**
         * Reset the quote state in order to not trigger the quote expiration check again
         */
        updateQuoteState({ response: null, isLoading: false })
        fetchAndUpdateQuote(false)
      }
    }, QUOTE_EXPIRATION_CHECK_INTERVAL)

    return () => {
      clearInterval(pollingIntervalId)
      clearInterval(quoteExpirationInterval)
    }
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
