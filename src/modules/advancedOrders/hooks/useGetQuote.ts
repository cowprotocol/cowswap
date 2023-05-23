import { useLayoutEffect } from 'react'
import { useSetAtom } from 'jotai'
import { onlyResolvesLast } from 'legacy/utils/async'

import { getQuote } from 'api/gnosisProtocol'
import { OrderQuoteResponse } from '@cowprotocol/cow-sdk'
import GpQuoteError from 'api/gnosisProtocol/errors/QuoteError'
import { useQuoteParams } from './useQuoteParams'
import { advancedOrdersQuoteAtom } from '../state/advancedOrdersQuoteAtom'
import { useAdvancedOrdersDerivedState } from './useAdvancedOrdersDerivedState'
import { useUpdateCurrencyAmount } from './useUpdateCurrencyAmount'
import { Field } from 'legacy/state/swap/actions'

// Every 10s
const PRICE_UPDATE_INTERVAL = 10_000

// Solves the problem of multiple requests
const getQuoteOnlyResolveLast = onlyResolvesLast<OrderQuoteResponse>(getQuote)

// TODO: this also should be unified for each trade widget
export function useGetQuote() {
  const quoteParams = useQuoteParams()
  const { outputCurrency } = useAdvancedOrdersDerivedState()
  const setAdvancedOrderQuote = useSetAtom(advancedOrdersQuoteAtom)
  const updateCurrencyAmount = useUpdateCurrencyAmount()

  useLayoutEffect(() => {
    if (!quoteParams) return

    const fetchQuote = () => {
      setAdvancedOrderQuote({ isLoading: true })

      getQuoteOnlyResolveLast(quoteParams)
        .then((response) => {
          const { cancelled, data } = response

          if (cancelled || !outputCurrency) {
            return
          }

          setAdvancedOrderQuote({
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
          setAdvancedOrderQuote({ isLoading: false })
        })
    }

    fetchQuote()

    const intervalId = setInterval(fetchQuote, PRICE_UPDATE_INTERVAL)

    return () => clearInterval(intervalId)
  }, [quoteParams, outputCurrency, setAdvancedOrderQuote, updateCurrencyAmount])

  return null
}
