import { useSetAtom } from 'jotai'
import { useLayoutEffect } from 'react'

import { OrderQuoteResponse } from '@cowprotocol/cow-sdk'

import { onlyResolvesLast } from 'legacy/utils/async'

import { useUpdateCurrencyAmount } from 'modules/trade/hooks/useUpdateCurrencyAmount'
import { updateTradeQuoteAtom } from 'modules/tradeQuote/state/tradeQuoteAtom'

import { getQuote } from 'api/gnosisProtocol'
import GpQuoteError from 'api/gnosisProtocol/errors/QuoteError'

import { useQuoteParams } from './useQuoteParams'

// Every 10s
const PRICE_UPDATE_INTERVAL = 10_000

// Solves the problem of multiple requests
const getQuoteOnlyResolveLast = onlyResolvesLast<OrderQuoteResponse>(getQuote)

export function useTradeQuotePolling() {
  // TODO: add throttling
  const quoteParams = useQuoteParams()

  const updateQuoteState = useSetAtom(updateTradeQuoteAtom)
  const updateCurrencyAmount = useUpdateCurrencyAmount()

  useLayoutEffect(() => {
    if (!quoteParams) {
      updateQuoteState({ response: null, isLoading: false })
      return
    }

    const fetchQuote = () => {
      updateQuoteState({ isLoading: true })

      getQuoteOnlyResolveLast(quoteParams)
        .then((response) => {
          const { cancelled, data } = response

          if (cancelled) {
            return
          }

          updateQuoteState({ response: data, isLoading: false, error: null })
        })
        .catch((error: GpQuoteError) => {
          console.log('[useGetQuote]:: fetchQuote error', error)
          updateQuoteState({ isLoading: false, error })
        })
    }

    fetchQuote()

    const intervalId = setInterval(fetchQuote, PRICE_UPDATE_INTERVAL)

    return () => clearInterval(intervalId)
  }, [quoteParams, updateQuoteState, updateCurrencyAmount])

  return null
}
