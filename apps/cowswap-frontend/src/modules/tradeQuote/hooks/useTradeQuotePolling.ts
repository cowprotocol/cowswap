import { useAtomValue } from 'jotai'
import { useLayoutEffect, useRef } from 'react'

import { useIsOnline, useIsWindowVisible } from '@cowprotocol/common-hooks'
import { PriceQuality } from '@cowprotocol/cow-sdk'
import { useAreUnsupportedTokens } from '@cowprotocol/tokens'

import ms from 'ms.macro'

import { useUpdateCurrencyAmount } from 'modules/trade'

import { useProcessUnsupportedTokenError } from './useProcessUnsupportedTokenError'
import { useQuoteParams } from './useQuoteParams'
import { useTradeQuote } from './useTradeQuote'
import { useTradeQuoteManager } from './useTradeQuoteManager'

import { fetchAndProcessQuote, TradeQuoteFetchParams } from '../services/fetchAndProcessQuote'
import { tradeQuoteInputAtom } from '../state/tradeQuoteInputAtom'
import { isQuoteExpired } from '../utils/quoteDeadline'
import { quoteUsingSameParameters } from '../utils/quoteUsingSameParameters'

export const PRICE_UPDATE_INTERVAL = ms`30s`
const QUOTE_EXPIRATION_CHECK_INTERVAL = ms`2s`

export function useTradeQuotePolling() {
  const { amount, fastQuote } = useAtomValue(tradeQuoteInputAtom)
  const tradeQuote = useTradeQuote()
  const tradeQuoteRef = useRef(tradeQuote)
  tradeQuoteRef.current = tradeQuote

  const quoteParams = useQuoteParams(amount?.quotient.toString())
  const sellToken = quoteParams?.sellToken

  const tradeQuoteManager = useTradeQuoteManager(sellToken)
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
    if (!tradeQuoteManager) {
      return
    }

    if (!quoteParams || quoteParams.amount === '0') {
      tradeQuoteManager.reset()
      return
    }

    // Don't fetch quote if token is not supported
    if (getIsUnsupportedTokens(quoteParams)) {
      return
    }

    const currentQuote = tradeQuoteRef.current
    const currentQuoteParams = currentQuote.quoteParams

    const fetchQuote = (fetchParams: TradeQuoteFetchParams) =>
      fetchAndProcessQuote(fetchParams, quoteParams, tradeQuoteManager)

    function fetchAndUpdateQuote(hasParamsChanged: boolean) {
      // Don't fetch quote if the parameters are the same
      // Also avoid quote refresh when only appData.quote (contains slippage) is changed
      // Important! We should skip quote updateing only if there is no quote response
      if (
        currentQuote.response &&
        quoteParams &&
        currentQuoteParams &&
        quoteUsingSameParameters(currentQuoteParams, quoteParams)
      ) {
        return
      }

      // When browser is offline or the tab is not active do no fetch
      if (!isOnlineRef.current || !isWindowVisibleRef.current) {
        return
      }

      const fetchStartTimestamp = Date.now()
      if (fastQuote) fetchQuote({ hasParamsChanged, priceQuality: PriceQuality.FAST, fetchStartTimestamp })
      fetchQuote({ hasParamsChanged, priceQuality: PriceQuality.OPTIMAL, fetchStartTimestamp })
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
        tradeQuoteManager.reset()
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
    tradeQuoteManager,
    updateCurrencyAmount,
    processUnsupportedTokenError,
    getIsUnsupportedTokens,
  ])

  return null
}
