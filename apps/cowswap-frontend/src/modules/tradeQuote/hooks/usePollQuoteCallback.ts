import { useAtomValue } from 'jotai'
import { useCallback, RefObject, useRef } from 'react'

import { useIsOnline, useIsWindowVisible, usePrevious } from '@cowprotocol/common-hooks'
import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { useAreUnsupportedTokens } from '@cowprotocol/tokens'

import { useGetCorrelatedTokensByChainId } from 'entities/correlatedTokens'

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
  currentAmountRef: RefObject<string | null>,
): (hasParamsChanged: boolean, forceUpdate?: boolean) => boolean {
  const { fastQuote } = useAtomValue(tradeQuoteInputAtom)
  const getCorrelatedTokensByChainId = useGetCorrelatedTokensByChainId()
  const tradeQuote = useTradeQuote()
  const tradeQuoteRef = useRef(tradeQuote)
  // eslint-disable-next-line react-hooks/refs
  tradeQuoteRef.current = tradeQuote

  const { quoteParams, appData, inputCurrency, hasSmartSlippage } = quoteParamsState || {}
  const hasSmartSlippagePrev = usePrevious(hasSmartSlippage)

  const tradeQuoteManager = useTradeQuoteManager(inputCurrency && getCurrencyAddress(inputCurrency))
  const getIsUnsupportedTokens = useAreUnsupportedTokens()

  const isWindowVisible = useIsWindowVisible()
  const isOnline = useIsOnline()
  const isOnlineRef = useRef(isOnline)
  // eslint-disable-next-line react-hooks/refs
  isOnlineRef.current = isOnline

  return useCallback(
    // eslint-disable-next-line complexity
    (hasParamsChanged: boolean, forceUpdate = false): boolean => {
      const { isQuoteUpdatePossible, isConfirmOpen } = quotePollingParams

      if (!isQuoteUpdatePossible || !tradeQuoteManager || !quoteParams || getIsUnsupportedTokens(quoteParams)) {
        return false
      }

      if (quoteParams.amount.toString() === '0' || quoteParams.amount.toString() !== currentAmountRef.current) {
        tradeQuoteManager.reset()
        return false
      }

      const fetchQuote = (fetchParams: TradeQuoteFetchParams): Promise<void> => {
        return fetchAndProcessQuote(
          fetchParams,
          quoteParams,
          quotePollingParams,
          appData,
          tradeQuoteManager,
          getCorrelatedTokensByChainId,
        )
      }

      const isBridge = quoteParams.sellTokenChainId !== quoteParams.buyTokenChainId
      /**
       * In bridging mode, bridge deposit amount (input amount) is the swap min receive amount
       * Because of that, we cannot change slippage without refetching the quote
       */
      const smartSlippageModeChanged = isBridge && hasSmartSlippagePrev !== hasSmartSlippage

      const context: QuoteUpdateContext = {
        currentQuote: tradeQuoteRef.current,
        quoteParams,
        appData,
        fetchQuote,
        hasParamsChanged,
        forceUpdate: smartSlippageModeChanged || forceUpdate,
        isBrowserOnline: isOnlineRef.current && isWindowVisible,
        isConfirmOpen,
        fastQuote,
        hasSmartSlippage,
      }

      /**
       * Fetch the quote instantly once the quote params are changed
       */
      return doQuotePolling(context)
    },
    [
      quoteParams,
      appData,
      tradeQuoteManager,
      isWindowVisible,
      fastQuote,
      getIsUnsupportedTokens,
      quotePollingParams,
      getCorrelatedTokensByChainId,
      hasSmartSlippage,
      hasSmartSlippagePrev,
      currentAmountRef,
    ],
  )
}
