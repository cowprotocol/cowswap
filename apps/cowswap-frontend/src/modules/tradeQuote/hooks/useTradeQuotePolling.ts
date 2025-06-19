import { useAtomValue } from 'jotai'
import { useEffect, useLayoutEffect, useRef } from 'react'

import { useIsOnline, useIsWindowVisible } from '@cowprotocol/common-hooks'
import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { PriceQuality } from '@cowprotocol/cow-sdk'
import { useAreUnsupportedTokens } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'

import ms from 'ms.macro'

import { useQuoteParams } from './useQuoteParams'
import { useTradeQuote } from './useTradeQuote'
import { useTradeQuoteManager } from './useTradeQuoteManager'

import { doQuotePolling, QuoteUpdateContext } from '../services/doQuotePolling'
import { fetchAndProcessQuote } from '../services/fetchAndProcessQuote'
import { tradeQuoteInputAtom } from '../state/tradeQuoteInputAtom'
import { TradeQuoteFetchParams } from '../types'
import { isQuoteExpired } from '../utils/quoteDeadline'

export const PRICE_UPDATE_INTERVAL = ms`30s`
const QUOTE_EXPIRATION_CHECK_INTERVAL = ms`2s`

export function useTradeQuotePolling(isConfirmOpen = false): null {
  const { amount, fastQuote, partiallyFillable } = useAtomValue(tradeQuoteInputAtom)
  const tradeQuote = useTradeQuote()
  const tradeQuoteRef = useRef(tradeQuote)
  tradeQuoteRef.current = tradeQuote

  const amountStr = amount?.quotient.toString()
  const { chainId } = useWalletInfo()
  const { quoteParams, appData, inputCurrency } = useQuoteParams(amountStr, partiallyFillable) || {}

  const tradeQuoteManager = useTradeQuoteManager(inputCurrency && getCurrencyAddress(inputCurrency))
  const getIsUnsupportedTokens = useAreUnsupportedTokens()

  const isWindowVisible = useIsWindowVisible()
  const isOnline = useIsOnline()
  const isOnlineRef = useRef(isOnline)
  isOnlineRef.current = isOnline

  useEffect(() => {
    // Do not reset the quote if the confirm modal is open
    // Because we already have a quote and don't want to reset it
    if (isConfirmOpen) return
    if (!tradeQuoteManager) return

    if (!isWindowVisible || !amountStr) {
      tradeQuoteManager.reset()
    }
  }, [isWindowVisible, tradeQuoteManager, isConfirmOpen, amountStr])

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

    const fetchQuote = (fetchParams: TradeQuoteFetchParams): Promise<void> =>
      fetchAndProcessQuote(chainId, fetchParams, quoteParams, appData, tradeQuoteManager)

    function getQuoteUpdateContext(hasParamsChanged: boolean, forceUpdate = false): QuoteUpdateContext {
      return {
        currentQuote: tradeQuoteRef.current,
        quoteParams,
        appData,
        fetchQuote,
        hasParamsChanged,
        forceUpdate,
        isBrowserOnline: isOnlineRef.current && isWindowVisible,
        isConfirmOpen,
        fastQuote,
      }
    }

    /**
     * Fetch the quote instantly once the quote params are changed
     */
    doQuotePolling(getQuoteUpdateContext(true))

    /**
     * Start polling for the quote
     */
    const pollingIntervalId = setInterval(() => {
      doQuotePolling(getQuoteUpdateContext(false))
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
        doQuotePolling(getQuoteUpdateContext(false, true))
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
    getIsUnsupportedTokens,
    isWindowVisible,
    isConfirmOpen,
  ])

  return null
}
