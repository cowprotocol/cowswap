import { useAtomValue } from 'jotai/index'
import { useCallback, useRef } from 'react'

import { useIsOnline, useIsWindowVisible } from '@cowprotocol/common-hooks'
import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { useAreUnsupportedTokens } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'

import { QuoteParams } from './useQuoteParams'
import { useTradeQuote } from './useTradeQuote'
import { useTradeQuoteManager } from './useTradeQuoteManager'

import { doQuotePolling, QuoteUpdateContext } from '../services/doQuotePolling'
import { fetchAndProcessQuote } from '../services/fetchAndProcessQuote'
import { tradeQuoteInputAtom } from '../state/tradeQuoteInputAtom'
import { TradeQuoteFetchParams } from '../types'

export function usePollQuoteCallback(
  isConfirmOpen: boolean,
  isQuoteUpdatePossible: boolean,
  quoteParamsState: QuoteParams | undefined,
): (hasParamsChanged: boolean, forceUpdate?: boolean) => boolean {
  const { fastQuote } = useAtomValue(tradeQuoteInputAtom)
  const tradeQuote = useTradeQuote()
  const tradeQuoteRef = useRef(tradeQuote)
  tradeQuoteRef.current = tradeQuote

  const { chainId } = useWalletInfo()
  const { quoteParams, appData, inputCurrency } = quoteParamsState || {}

  const tradeQuoteManager = useTradeQuoteManager(inputCurrency && getCurrencyAddress(inputCurrency))
  const getIsUnsupportedTokens = useAreUnsupportedTokens()

  const isWindowVisible = useIsWindowVisible()
  const isOnline = useIsOnline()
  const isOnlineRef = useRef(isOnline)
  isOnlineRef.current = isOnline

  return useCallback(
    (hasParamsChanged: boolean, forceUpdate = false): boolean => {
      if (!isQuoteUpdatePossible || !tradeQuoteManager || !quoteParams || getIsUnsupportedTokens(quoteParams)) {
        return false
      }

      if (quoteParams.amount.toString() === '0') {
        tradeQuoteManager.reset()
        return false
      }

      const fetchQuote = (fetchParams: TradeQuoteFetchParams): Promise<void> =>
        fetchAndProcessQuote(chainId, fetchParams, quoteParams, appData, tradeQuoteManager)

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
    [
      chainId,
      quoteParams,
      appData,
      tradeQuoteManager,
      isWindowVisible,
      fastQuote,
      getIsUnsupportedTokens,
      isConfirmOpen,
      isQuoteUpdatePossible,
    ],
  )
}
