import { useAtomValue } from 'jotai/index'
import { useCallback, useRef } from 'react'

import { useIsOnline, useIsWindowVisible } from '@cowprotocol/common-hooks'
import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { useAreUnsupportedTokens } from '@cowprotocol/tokens'

import { QuoteParams } from './useQuoteParams'
import { useTradeQuote } from './useTradeQuote'
import { useTradeQuoteManager } from './useTradeQuoteManager'

import { doQuotePolling, QuoteUpdateContext } from '../services/doQuotePolling'
import { fetchAndProcessQuote } from '../services/fetchAndProcessQuote'
import { tradeQuoteInputAtom } from '../state/tradeQuoteInputAtom'
import { TradeQuoteFetchParams, TradeQuotePollingParameters } from '../types'

export function usePollQuoteCallback(
  quotePollingParams: TradeQuotePollingParameters,
  quoteParamsState: QuoteParams | undefined,
): (hasParamsChanged: boolean, forceUpdate?: boolean) => boolean {
  const { fastQuote } = useAtomValue(tradeQuoteInputAtom)
  const tradeQuote = useTradeQuote()
  const tradeQuoteRef = useRef(tradeQuote)
  // eslint-disable-next-line react-hooks/refs
  tradeQuoteRef.current = tradeQuote

  const { quoteParams, appData, inputCurrency } = quoteParamsState || {}

  const tradeQuoteManager = useTradeQuoteManager(inputCurrency && getCurrencyAddress(inputCurrency))
  const getIsUnsupportedTokens = useAreUnsupportedTokens()

  const isWindowVisible = useIsWindowVisible()
  const isOnline = useIsOnline()
  const isOnlineRef = useRef(isOnline)
  // eslint-disable-next-line react-hooks/refs
  isOnlineRef.current = isOnline

  return useCallback(
    (hasParamsChanged: boolean, forceUpdate = false): boolean => {
      const { isQuoteUpdatePossible, isConfirmOpen } = quotePollingParams

      if (!isQuoteUpdatePossible || !tradeQuoteManager || !quoteParams || getIsUnsupportedTokens(quoteParams)) {
        return false
      }

      if (quoteParams.amount.toString() === '0') {
        tradeQuoteManager.reset()
        return false
      }

      const fetchQuote = (fetchParams: TradeQuoteFetchParams): Promise<void> =>
        fetchAndProcessQuote(fetchParams, quoteParams, quotePollingParams, appData, tradeQuoteManager)

      const context: QuoteUpdateContext = {
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

      /**
       * Fetch the quote instantly once the quote params are changed
       */
      return doQuotePolling(context)
    },
    [quoteParams, appData, tradeQuoteManager, isWindowVisible, fastQuote, getIsUnsupportedTokens, quotePollingParams],
  )
}
