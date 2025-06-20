import { useAtom, useAtomValue } from 'jotai'
import { useEffect, useLayoutEffect, useRef } from 'react'

import { useIsOnline, useIsWindowVisible } from '@cowprotocol/common-hooks'
import { getCurrencyAddress } from '@cowprotocol/common-utils'

import { usePollQuoteCallback } from './usePollQuoteCallback'
import { useQuoteParams } from './useQuoteParams'
import { useTradeQuote } from './useTradeQuote'
import { useResetQuoteCounter } from './useTradeQuoteCounter'
import { useTradeQuoteManager } from './useTradeQuoteManager'

import { QUOTE_POLLING_INTERVAL } from '../consts'
import { tradeQuoteCounterAtom } from '../state/tradeQuoteCounterAtom'
import { tradeQuoteInputAtom } from '../state/tradeQuoteInputAtom'

const ONE_SEC = 1000

export function useTradeQuotePolling(isConfirmOpen = false): null {
  const { amount, partiallyFillable } = useAtomValue(tradeQuoteInputAtom)
  const [tradeQuotePolling, setTradeQuotePolling] = useAtom(tradeQuoteCounterAtom)
  const resetQuoteCounter = useResetQuoteCounter()
  const tradeQuote = useTradeQuote()
  const tradeQuoteRef = useRef(tradeQuote)
  tradeQuoteRef.current = tradeQuote

  const amountStr = amount?.quotient.toString()
  const quoteParamsState = useQuoteParams(amountStr, partiallyFillable)
  const { quoteParams, inputCurrency } = quoteParamsState || {}

  const tradeQuoteManager = useTradeQuoteManager(inputCurrency && getCurrencyAddress(inputCurrency))

  const isWindowVisible = useIsWindowVisible()
  const isOnline = useIsOnline()
  const isOnlineRef = useRef(isOnline)
  isOnlineRef.current = isOnline

  const pollQuote = usePollQuoteCallback(isConfirmOpen, quoteParamsState)

  /**
   * Reset quote when window is not visible or sell amount has been cleared
   */
  useEffect(() => {
    // Do not reset the quote if the confirm modal is open
    // Because we already have a quote and don't want to reset it
    if (isConfirmOpen) return
    if (!tradeQuoteManager) return

    if (!isWindowVisible || !amountStr) {
      tradeQuoteManager.reset()
    }
  }, [isWindowVisible, tradeQuoteManager, isConfirmOpen, amountStr])

  /**
   * Fetch the quote instantly once the quote params are changed
   */
  useLayoutEffect(() => {
    if (pollQuote(true)) {
      resetQuoteCounter()
    }
  }, [pollQuote, quoteParams, resetQuoteCounter])

  /**
   * Update quote once a QUOTE_POLLING_INTERVAL
   */
  useLayoutEffect(() => {
    if (tradeQuotePolling !== 0) return

    pollQuote(false, true)
  }, [pollQuote, tradeQuotePolling])

  /**
   * Tick quote polling counter
   */
  useEffect(() => {
    if (isConfirmOpen) {
      resetQuoteCounter()
    }

    const interval = setInterval(() => {
      setTradeQuotePolling((state) => {
        const newState = state - 1000

        if (newState < 0) {
          return QUOTE_POLLING_INTERVAL
        }

        return newState
      })
    }, ONE_SEC)

    return () => clearInterval(interval)
  }, [setTradeQuotePolling, resetQuoteCounter, isConfirmOpen])

  return null
}
