import { useLayoutEffect } from 'react'
import { useSetAtom } from 'jotai'
import { onlyResolvesLast } from 'legacy/utils/async'

import { getQuote } from 'api/gnosisProtocol'
import { OrderQuoteResponse } from '@cowprotocol/cow-sdk'
import GpQuoteError from 'api/gnosisProtocol/errors/QuoteError'
import { useQuoteParams } from './useQuoteParams'
import { useUpdateCurrencyAmount } from 'modules/trade/hooks/useUpdateCurrencyAmount'
import { Field } from 'legacy/state/swap/actions'
import { tradeQuoteAtom } from 'modules/tradeQuote/state/tradeQuoteAtom'
import { useDerivedTradeState } from 'modules/trade/hooks/useDerivedTradeState'

// Every 10s
const PRICE_UPDATE_INTERVAL = 10_000

// Solves the problem of multiple requests
const getQuoteOnlyResolveLast = onlyResolvesLast<OrderQuoteResponse>(getQuote)

export function useGetQuote() {
  const quoteParams = useQuoteParams()
  const { state } = useDerivedTradeState()

  const updateQuoteState = useSetAtom(tradeQuoteAtom)
  const updateCurrencyAmount = useUpdateCurrencyAmount()

  const outputCurrency = state?.outputCurrency

  useLayoutEffect(() => {
    if (!quoteParams) return

    const fetchQuote = () => {
      updateQuoteState({ isLoading: true })

      getQuoteOnlyResolveLast(quoteParams)
        .then((response) => {
          const { cancelled, data } = response

          if (cancelled || !outputCurrency) {
            return
          }

          updateQuoteState({
            response: data,
            isLoading: false,
          })

          updateCurrencyAmount({
            amount: { isTyped: false, value: data.quote.buyAmount },
            currency: outputCurrency,
            field: Field.OUTPUT,
          })
        })
        .catch((error: GpQuoteError) => {
          console.log('[useGetQuote]:: fetchQuote error', error)
          updateQuoteState({ isLoading: false })
        })
    }

    fetchQuote()

    const intervalId = setInterval(fetchQuote, PRICE_UPDATE_INTERVAL)

    return () => clearInterval(intervalId)
  }, [quoteParams, outputCurrency, updateQuoteState, updateCurrencyAmount])

  return null
}
