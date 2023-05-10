import { useLayoutEffect } from 'react'
import { useSetAtom } from 'jotai'
import { onlyResolvesLast } from 'utils/async'

import { getQuote } from '@cow/api/gnosisProtocol'
import { OrderQuoteResponse } from '@cowprotocol/cow-sdk'
import GpQuoteError from '@cow/api/gnosisProtocol/errors/QuoteError'
import { useQuoteParams } from './useQuoteParams'
import { advancedOrdersQuoteAtom } from '../state/advancedOrdersQuoteAtom'
import { useAdvancedOrdersFullState } from './useAdvancedOrdersFullState'
import { useUpdateCurrencyAmount } from './useUpdateCurrencyAmount'
import { Field } from '@src/state/swap/actions'

// Every 10s
const PRICE_UPDATE_INTERVAL = 10_000

// Solves the problem of multiple requests
const getQuoteOnlyResolveLast = onlyResolvesLast<OrderQuoteResponse>(getQuote)

// TODO: this also should be unified for each trade widget
export function useGetQuote() {
  const quoteParams = useQuoteParams()
  const { outputCurrency } = useAdvancedOrdersFullState()
  const setAdvancedOrderQuote = useSetAtom(advancedOrdersQuoteAtom)
  const updateCurrencyAmount = useUpdateCurrencyAmount()

  useLayoutEffect(() => {
    if (!quoteParams) return

    const fetchQuote = () => {
      getQuoteOnlyResolveLast(quoteParams)
        .then((response) => {
          const { cancelled, data } = response

          if (cancelled || !outputCurrency) {
            return
          }

          setAdvancedOrderQuote({ response: data })
          updateCurrencyAmount({
            amount: { isTyped: false, value: data.quote.buyAmount },
            currency: outputCurrency,
            field: Field.OUTPUT,
          })
        })
        .catch((error: GpQuoteError) => {
          console.log('[useGetQuote]:: fetchQuote error', error)
        })
    }

    fetchQuote()

    const intervalId = setInterval(fetchQuote, PRICE_UPDATE_INTERVAL)

    return () => clearInterval(intervalId)
  }, [quoteParams, outputCurrency, setAdvancedOrderQuote, updateCurrencyAmount])

  return null
}
