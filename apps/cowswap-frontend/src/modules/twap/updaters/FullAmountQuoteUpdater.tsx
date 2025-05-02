import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { onlyResolvesLast } from '@cowprotocol/common-utils'
import { OrderQuoteResponse } from '@cowprotocol/cow-sdk'

import { useAdvancedOrdersDerivedState } from 'modules/advancedOrders'
import { useQuoteParams, useTradeQuote } from 'modules/tradeQuote'

import { getQuote } from 'api/cowProtocol/api'

import { fullAmountQuoteAtom } from '../state/fullAmountQuoteAtom'

const getQuoteOnlyResolveLast = onlyResolvesLast<OrderQuoteResponse>(getQuote)

export function FullAmountQuoteUpdater() {
  const { inputCurrencyAmount } = useAdvancedOrdersDerivedState()
  const { quote, error, isLoading } = useTradeQuote()

  const fullQuoteAmount = inputCurrencyAmount?.quotient.toString() || null
  const partQuoteAmount = quote?.quoteResults.quoteResponse.quote.buyAmount

  const quoteParams = useQuoteParams(fullQuoteAmount)?.quoteParams
  const updateQuoteState = useSetAtom(fullAmountQuoteAtom)

  useEffect(() => {
    if (error || isLoading || !partQuoteAmount || !quoteParams) return

    getQuoteOnlyResolveLast(quoteParams)
      .then((response) => {
        const { cancelled, data } = response

        if (cancelled) {
          return
        }

        updateQuoteState(data)
      })
      .catch((error) => {
        const parsedError = error as Error

        console.log('[FullAmountQuoteUpdater]:: fetchQuote error', parsedError)
      })
  }, [partQuoteAmount, isLoading, error, quoteParams, updateQuoteState])

  return null
}
