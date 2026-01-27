/* eslint-disable max-lines-per-function */
import { useAtom, useAtomValue } from 'jotai'
import { useLayoutEffect, useRef } from 'react'

import { useIsOnline, useIsWindowVisible, usePrevious } from '@cowprotocol/common-hooks'
import { getCurrencyAddress } from '@cowprotocol/common-utils'

import ms from 'ms.macro'

import { useRecipientRequirement } from 'modules/trade'

import { usePollQuoteCallback } from './usePollQuoteCallback'
import { useQuoteParams } from './useQuoteParams'
import { useTradeQuote } from './useTradeQuote'
import { useResetQuoteCounter } from './useTradeQuoteCounter'
import { useTradeQuoteManager } from './useTradeQuoteManager'

import { QUOTE_POLLING_INTERVAL } from '../consts'
import { tradeQuoteCounterAtom } from '../state/tradeQuoteCounterAtom'
import { tradeQuoteInputAtom } from '../state/tradeQuoteInputAtom'
import { TradeQuotePollingParameters } from '../types'
import { isQuoteExpired } from '../utils/quoteDeadline'

const ONE_SEC = 1000
const QUOTE_VALIDATION_INTERVAL = ms`2s`

export function useTradeQuotePolling(quotePollingParams: TradeQuotePollingParameters): null {
  const { isConfirmOpen, isQuoteUpdatePossible } = quotePollingParams

  const { amount, partiallyFillable } = useAtomValue(tradeQuoteInputAtom)
  const [tradeQuotePolling, setTradeQuotePolling] = useAtom(tradeQuoteCounterAtom)
  const resetQuoteCounter = useResetQuoteCounter()
  const tradeQuote = useTradeQuote()
  const prevIsConfirmOpen = usePrevious(isConfirmOpen)
  const tradeQuoteRef = useRef(tradeQuote)
  // eslint-disable-next-line react-hooks/refs
  tradeQuoteRef.current = tradeQuote

  const amountStr = amount?.quotient.toString()
  const quoteParamsState = useQuoteParams(amountStr, partiallyFillable)
  const { quoteParams, inputCurrency } = quoteParamsState || {}
  const recipientRequirement = useRecipientRequirement()
  const isRecipientBlocked = recipientRequirement.isRecipientRequired && recipientRequirement.isRecipientBlocked

  const tradeQuoteManager = useTradeQuoteManager(inputCurrency && getCurrencyAddress(inputCurrency))

  const isWindowVisible = useIsWindowVisible()
  const isOnline = useIsOnline()
  const isOnlineRef = useRef(isOnline)
  // eslint-disable-next-line react-hooks/refs
  isOnlineRef.current = isOnline

  const pollQuote = usePollQuoteCallback(quotePollingParams, quoteParamsState)
  const pollQuoteRef = useRef(pollQuote)
  // eslint-disable-next-line react-hooks/refs
  pollQuoteRef.current = pollQuote

  /**
   * Reset quote when window is not visible or sell amount has been cleared
   */
  useLayoutEffect(() => {
    // Do not reset the quote if the confirm modal is open
    // Because we already have a quote and don't want to reset it
    if (isConfirmOpen) return
    if (!tradeQuoteManager) return

    if (!isWindowVisible || !document.hasFocus() || !amountStr) {
      tradeQuoteManager.reset()
      setTradeQuotePolling(0)
    }
  }, [isWindowVisible, tradeQuoteManager, isConfirmOpen, amountStr, setTradeQuotePolling])

  /**
   * Reset stale quotes when recipient becomes blocked for non-EVM destinations.
   */
  useLayoutEffect(() => {
    if (isConfirmOpen) return
    if (!tradeQuoteManager) return

    if (isRecipientBlocked) {
      tradeQuoteManager.reset()
      setTradeQuotePolling(0)
    }
  }, [isConfirmOpen, isRecipientBlocked, tradeQuoteManager, setTradeQuotePolling])

  /**
   * Fetch the quote instantly once the quote params are changed
   */
  useLayoutEffect(() => {
    /**
     * Quote params are not supposed to be changed once confirm screen is open
     * So, we should not refetch quote
     */
    if (isConfirmOpen) return

    if (pollQuoteRef.current(true)) {
      resetQuoteCounter()
    }
  }, [isConfirmOpen, isQuoteUpdatePossible, quoteParams, resetQuoteCounter])

  /**
   * Update quote once a QUOTE_POLLING_INTERVAL
   */
  useLayoutEffect(() => {
    if (tradeQuotePolling !== 0) return

    pollQuoteRef.current(false, true)
  }, [tradeQuotePolling])

  /**
   * Reset counter and update quote each time when confirmation modal is closed
   */
  useLayoutEffect(() => {
    if (prevIsConfirmOpen === isConfirmOpen) return

    if (!isConfirmOpen) {
      setTradeQuotePolling(0)
    }
  }, [setTradeQuotePolling, prevIsConfirmOpen, isConfirmOpen])

  /**
   * Tick quote polling counter
   */
  useLayoutEffect(() => {
    const interval = setInterval(() => {
      // Do not tick while quote is loading
      if (tradeQuoteRef.current.isLoading) return

      setTradeQuotePolling((state) => {
        const newState = state - ONE_SEC

        if (newState < 0) {
          return QUOTE_POLLING_INTERVAL
        }

        return newState
      })
    }, ONE_SEC)

    return () => {
      clearInterval(interval)
    }
  }, [setTradeQuotePolling])

  /**
   * Once quote is expired - update quote
   */
  useLayoutEffect(() => {
    function revalidateQuoteIfExpired(): void {
      if (isQuoteExpired(tradeQuote)) {
        setTradeQuotePolling(0)
      }
    }

    revalidateQuoteIfExpired()

    const interval = setInterval(revalidateQuoteIfExpired, QUOTE_VALIDATION_INTERVAL)

    return () => {
      clearInterval(interval)
    }
  }, [tradeQuote, setTradeQuotePolling])

  return null
}
