import { useAtomValue } from 'jotai'
import { useEffect, useLayoutEffect, useRef } from 'react'

import { useIsOnline, useIsWindowVisible } from '@cowprotocol/common-hooks'
import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { PriceQuality } from '@cowprotocol/cow-sdk'
import { useAreUnsupportedTokens } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'

import ms from 'ms.macro'

import { useUpdateCurrencyAmount } from 'modules/trade'

import { useProcessUnsupportedTokenError } from './useProcessUnsupportedTokenError'
import { useQuoteParams } from './useQuoteParams'
import { useTradeQuote } from './useTradeQuote'
import { useTradeQuoteManager } from './useTradeQuoteManager'

import { fetchAndProcessQuote } from '../services/fetchAndProcessQuote'
import { tradeQuoteInputAtom } from '../state/tradeQuoteInputAtom'
import { TradeQuoteFetchParams } from '../types'
import { isQuoteExpired } from '../utils/quoteDeadline'
import { quoteUsingSameParameters } from '../utils/quoteUsingSameParameters'

export const PRICE_UPDATE_INTERVAL = ms`30s`
const QUOTE_EXPIRATION_CHECK_INTERVAL = ms`2s`

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function useTradeQuotePolling(isConfirmOpen = false) {
  const { amount, fastQuote, partiallyFillable } = useAtomValue(tradeQuoteInputAtom)
  const tradeQuote = useTradeQuote()
  const tradeQuoteRef = useRef(tradeQuote)
  tradeQuoteRef.current = tradeQuote

  const amountStr = amount?.quotient.toString()
  const { chainId } = useWalletInfo()
  const { quoteParams, appData, inputCurrency } = useQuoteParams(amountStr, partiallyFillable) || {}

  const tradeQuoteManager = useTradeQuoteManager(
    inputCurrency && getCurrencyAddress(inputCurrency)
  )
  const updateCurrencyAmount = useUpdateCurrencyAmount()
  const getIsUnsupportedTokens = useAreUnsupportedTokens()
  const processUnsupportedTokenError = useProcessUnsupportedTokenError()

  const isWindowVisible = useIsWindowVisible()

  const isOnline = useIsOnline()
  const isOnlineRef = useRef(isOnline)
  isOnlineRef.current = isOnline

  useEffect(() => {
    // Do not reset the quote if the confirm modal is open
    // Because we already have a quote and don't want to reset it
    if (isConfirmOpen) return

    if ((!isWindowVisible || !amountStr) && tradeQuoteManager) {
      tradeQuoteManager.reset()
    }
  }, [isWindowVisible, tradeQuoteManager, isConfirmOpen, amountStr])

  // TODO: Break down this large function into smaller functions

  useLayoutEffect(() => {
    if (!tradeQuoteManager) {
      return
    }

    if (!quoteParams || quoteParams.amount.toString() === '0') {
      tradeQuoteManager.reset()
      return
    }

    // Don't fetch quote if token is not supported
    if (getIsUnsupportedTokens(quoteParams)) {
      return
    }

    // TODO: Add proper return type annotation
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const fetchQuote = (fetchParams: TradeQuoteFetchParams) =>
      fetchAndProcessQuote(chainId, fetchParams, quoteParams, appData, tradeQuoteManager)

    // TODO: Add proper return type annotation
    // TODO: Reduce function complexity by extracting logic
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type, complexity
    function fetchAndUpdateQuote(hasParamsChanged: boolean, forceUpdate = false) {
      const currentQuote = tradeQuoteRef.current
      const currentQuoteAppDataDoc = currentQuote.quote?.quoteResults.appDataInfo.doc
      const hasCachedResponse = !!currentQuote.quote
      const hasCachedError = !!currentQuote.error

      if (!forceUpdate) {
        // Don't fetch quote if the parameters are the same
        // Also avoid quote refresh when only appData.quote (contains slippage) is changed
        // Important! We should skip quote updateing only if there is no quote response
        if (
          (hasCachedResponse || hasCachedError) &&
          quoteUsingSameParameters(currentQuote, quoteParams, currentQuoteAppDataDoc, appData)
        ) {
          return
        }

        // When browser is offline or the tab is not active do no fetch
        if (!isOnlineRef.current || !isWindowVisible) {
          return
        }
      }

      const fetchStartTimestamp = Date.now()
      // Don't fetch fast quote in confirm screen
      if (fastQuote && !isConfirmOpen) {
        fetchQuote({ hasParamsChanged, priceQuality: PriceQuality.FAST, fetchStartTimestamp })
      }
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
        currentQuote.quote &&
        currentQuote.fetchParams?.priceQuality === PriceQuality.OPTIMAL &&
        isQuoteExpired(currentQuote)
      ) {
        /**
         * Reset the quote state in order to not trigger the quote expiration check again
         */
        fetchAndUpdateQuote(false, true)
      }
    }, QUOTE_EXPIRATION_CHECK_INTERVAL)

    return () => {
      clearInterval(pollingIntervalId)
      clearInterval(quoteExpirationInterval)
    }
  }, [
    chainId,
    fastQuote,
    quoteParams,
    appData,
    tradeQuoteManager,
    updateCurrencyAmount,
    processUnsupportedTokenError,
    getIsUnsupportedTokens,
    isWindowVisible,
    isConfirmOpen,
  ])

  return null
}
