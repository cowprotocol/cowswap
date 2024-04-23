import { useAtomValue, useSetAtom } from 'jotai'
import { useLayoutEffect, useMemo } from 'react'

import { useDebounce } from '@cowprotocol/common-hooks'
import { onlyResolvesLast } from '@cowprotocol/common-utils'
import { OrderQuoteResponse } from '@cowprotocol/cow-sdk'
import { useAreUnsupportedTokens } from '@cowprotocol/tokens'

import ms from 'ms.macro'

import { useUpdateCurrencyAmount } from 'modules/trade/hooks/useUpdateCurrencyAmount'
import { updateTradeQuoteAtom } from 'modules/tradeQuote/state/tradeQuoteAtom'

import { getQuote } from 'api/gnosisProtocol/api'
import GpQuoteError, { GpQuoteErrorCodes } from 'api/gnosisProtocol/errors/QuoteError'

import { useProcessUnsupportedTokenError } from './useProcessUnsupportedTokenError'
import { useQuoteParams } from './useQuoteParams'

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

  const updateQuoteState = useSetAtom(updateTradeQuoteAtom)
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

    const fetchQuote = () => {
      updateQuoteState({ isLoading: true })

      getQuoteOnlyResolveLast(quoteParams)
        .then((response) => {
          const { cancelled, data } = response

          if (cancelled) {
            return
          }

          updateQuoteState({ response: data, quoteParams, isLoading: false, error: null })
        })
        .catch((error: GpQuoteError) => {
          console.log('[useGetQuote]:: fetchQuote error', error)
          updateQuoteState({ isLoading: false, error })

          if (error.type === GpQuoteErrorCodes.UnsupportedToken) {
            processUnsupportedTokenError(error, quoteParams)
          }
        })
    }

    fetchQuote()

    const intervalId = setInterval(fetchQuote, PRICE_UPDATE_INTERVAL)

    return () => clearInterval(intervalId)
  }, [quoteParams, updateQuoteState, updateCurrencyAmount, processUnsupportedTokenError, getIsUnsupportedTokens])

  return null
}
