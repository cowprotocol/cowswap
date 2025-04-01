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

export function useTradeQuotePolling(isConfirmOpen = false) {
  const { amount, fastQuote } = useAtomValue(tradeQuoteInputAtom)
  const tradeQuote = useTradeQuote()
  const tradeQuoteRef = useRef(tradeQuote)
  tradeQuoteRef.current = tradeQuote

  const { chainId } = useWalletInfo()
  const { quoteParams, appData, inputCurrency } = useQuoteParams(amount?.quotient.toString()) || {}

  const tradeQuoteManager = useTradeQuoteManager(inputCurrency && getCurrencyAddress(inputCurrency))
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

    if (!isWindowVisible && tradeQuoteManager) {
      tradeQuoteManager.reset()
    }
  }, [isWindowVisible, tradeQuoteManager, isConfirmOpen])

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

    const fetchQuote = (fetchParams: TradeQuoteFetchParams) =>
      fetchAndProcessQuote(chainId, fetchParams, quoteParams, appData, tradeQuoteManager)

    function fetchAndUpdateQuote(hasParamsChanged: boolean, forceUpdate = false) {
      const currentQuote = tradeQuoteRef.current
      const currentQuoteParams = currentQuote.quote?.quoteResults.tradeParameters
      const currentQuoteAppData = currentQuote.quote?.quoteResults.appDataInfo
      const hasCachedResponse = !!currentQuote.quote
      const hasCachedError = !!currentQuote.error

      if (!forceUpdate) {
        // Don't fetch quote if the parameters are the same
        // Also avoid quote refresh when only appData.quote (contains slippage) is changed
        // Important! We should skip quote updateing only if there is no quote response
        if (
          (hasCachedResponse || hasCachedError) &&
          quoteUsingSameParameters(chainId, currentQuoteParams, quoteParams, currentQuoteAppData?.doc, appData)
        ) {
          return
        }

        // When browser is offline or the tab is not active do no fetch
        if (!isOnlineRef.current || !isWindowVisible) {
          return
        }
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
  ])

  return null
}
