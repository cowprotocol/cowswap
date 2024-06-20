import { useAtomValue } from 'jotai'
import { useLayoutEffect, useMemo } from 'react'

import { useDebounce } from '@cowprotocol/common-hooks'
import { onlyResolvesLast } from '@cowprotocol/common-utils'
import { OrderQuoteResponse } from '@cowprotocol/cow-sdk'
import { useAreUnsupportedTokens } from '@cowprotocol/tokens'

import ms from 'ms.macro'

import { useUpdateCurrencyAmount } from 'modules/trade/hooks/useUpdateCurrencyAmount'

import { getQuote } from 'api/cowProtocol/api'
import QuoteApiError, { QuoteApiErrorCodes } from 'api/cowProtocol/errors/QuoteError'

import { useProcessUnsupportedTokenError } from './useProcessUnsupportedTokenError'
import { useQuoteParams } from './useQuoteParams'
import { useUpdateTradeQuote } from './useUpdateTradeQuote'

import { tradeQuoteParamsAtom } from '../state/tradeQuoteParamsAtom'

export const PRICE_UPDATE_INTERVAL = ms`30s`
const AMOUNT_CHANGE_DEBOUNCE_TIME = ms`300`

// Solves the problem of multiple requests
const getQuoteOnlyResolveLast = onlyResolvesLast<OrderQuoteResponse>(getQuote)

export function useTradeQuotePolling() {
  const { amount } = useAtomValue(tradeQuoteParamsAtom)
  const amountStr = useDebounce(
    useMemo(() => amount?.quotient.toString() || null, [amount]),
    AMOUNT_CHANGE_DEBOUNCE_TIME
  )
  const quoteParams = useQuoteParams(amountStr)

  const updateQuoteState = useUpdateTradeQuote()
  const updateCurrencyAmount = useUpdateCurrencyAmount()
  const getIsUnsupportedTokens = useAreUnsupportedTokens()
  const processUnsupportedTokenError = useProcessUnsupportedTokenError()

  useLayoutEffect(() => {
    if (!quoteParams) {
      updateQuoteState({ response: null, isLoading: false })
      return
    }

    const isUnsupportedTokens = getIsUnsupportedTokens(quoteParams)

    // Don't fetch quote if token is not supported
    if (isUnsupportedTokens) {
      return
    }

    const fetchQuote = (hasParamsChanged: boolean) => {
      updateQuoteState({ isLoading: true, hasParamsChanged })

      getQuoteOnlyResolveLast(quoteParams)
        .then((response) => {
          const { cancelled, data } = response

          if (cancelled) {
            return
          }

          updateQuoteState({ response: data, quoteParams, isLoading: false, error: null, hasParamsChanged: false })
        })
        .catch((error: QuoteApiError) => {
          console.log('[useGetQuote]:: fetchQuote error', error)
          updateQuoteState({ isLoading: false, error, hasParamsChanged: false })

          if (error.type === QuoteApiErrorCodes.UnsupportedToken) {
            processUnsupportedTokenError(error, quoteParams)
          }
        })
    }

    fetchQuote(true)

    const intervalId = setInterval(() => fetchQuote(false), PRICE_UPDATE_INTERVAL)

    return () => clearInterval(intervalId)
  }, [quoteParams, updateQuoteState, updateCurrencyAmount, processUnsupportedTokenError, getIsUnsupportedTokens])

  return null
}
