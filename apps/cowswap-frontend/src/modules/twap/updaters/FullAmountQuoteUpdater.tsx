import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { onlyResolvesLast } from '@cowprotocol/common-utils'
import { QuoteAndPost } from '@cowprotocol/cow-sdk'

import { tradingSdk } from 'tradingSdk/tradingSdk'

import { useAdvancedOrdersDerivedState } from 'modules/advancedOrders'
import { useQuoteParams, useTradeQuote } from 'modules/tradeQuote'

import { fullAmountQuoteAtom } from '../state/fullAmountQuoteAtom'

const getQuote = tradingSdk.getQuote.bind(tradingSdk)

const getQuoteOnlyResolveLast = onlyResolvesLast<QuoteAndPost>(getQuote)

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
        const { quoteResults } = data

        updateQuoteState(quoteResults.quoteResponse)
      })
      .catch((error) => {
        const parsedError = error as Error

        console.log('[FullAmountQuoteUpdater]:: fetchQuote error', parsedError)
      })
  }, [partQuoteAmount, isLoading, error, quoteParams, updateQuoteState])

  return null
}
