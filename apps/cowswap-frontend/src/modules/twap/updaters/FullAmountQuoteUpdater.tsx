import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { onlyResolvesLast } from '@cowprotocol/common-utils'
import { CrossChainQuoteAndPost, isBridgeQuoteAndPost } from '@cowprotocol/cow-sdk'

import { bridgingSdk } from 'tradingSdk/bridgingSdk'

import { useAdvancedOrdersDerivedState } from 'modules/advancedOrders'
import { useTradeQuote, useQuoteParams } from 'modules/tradeQuote'

import { fullAmountQuoteAtom } from '../state/fullAmountQuoteAtom'

const getQuote = bridgingSdk.getQuote.bind(bridgingSdk)
const getQuoteOnlyResolveLast = onlyResolvesLast<CrossChainQuoteAndPost>(getQuote)

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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

        const quote = isBridgeQuoteAndPost(data) ? data.swap.quoteResponse : data.quoteResults.quoteResponse

        updateQuoteState(quote)
      })
      .catch((error) => {
        console.error('[TWAP FullAmountQuoteUpdater]:: fetchQuote error', error)
      })
  }, [partQuoteAmount, isLoading, error, quoteParams, updateQuoteState])

  return null
}
