import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { onlyResolvesLast } from '@cowprotocol/common-utils'
import { OrderQuoteResponse } from '@cowprotocol/cow-sdk'

import { useAdvancedOrdersDerivedState } from 'modules/advancedOrders'
import { useTradeQuote, useQuoteParams } from 'modules/tradeQuote'

import { getQuote } from 'api/gnosisProtocol/api'

import { fullAmountQuoteAtom } from '../state/fullAmountQuoteAtom'

const getQuoteOnlyResolveLast = onlyResolvesLast<OrderQuoteResponse>(getQuote)

export function FullAmountQuoteUpdater() {
  const { inputCurrencyAmount } = useAdvancedOrdersDerivedState()
  const { response, error, isLoading } = useTradeQuote()

  const fullQuoteAmount = inputCurrencyAmount?.quotient.toString() || null
  const partQuoteAmount = response?.quote.buyAmount

  const quoteParams = useQuoteParams(fullQuoteAmount)
  const updateQuoteState = useSetAtom(fullAmountQuoteAtom)

  useEffect(() => {
    if (error || isLoading || !partQuoteAmount || !quoteParams) return

    getQuoteOnlyResolveLast(quoteParams).then((response) => {
      const { cancelled, data } = response

      if (cancelled) {
        return
      }

      updateQuoteState(data)
    })
  }, [partQuoteAmount, isLoading, error, quoteParams, updateQuoteState])

  return null
}
