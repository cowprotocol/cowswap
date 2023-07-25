import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { updateTradeQuoteAtom } from '../state/tradeQuoteAtom'
import { tradeQuoteParamsAtom } from '../state/tradeQuoteParamsAtom'

export function useSetTradeQuoteParams(currencyAmount: CurrencyAmount<Currency> | null) {
  const updateTradeQuote = useSetAtom(updateTradeQuoteAtom)
  const updateState = useSetAtom(tradeQuoteParamsAtom)

  const amount = currencyAmount?.quotient.toString() || null

  useEffect(() => {
    updateTradeQuote({ response: null, error: null })
    updateState({ amount })
  }, [amount, updateTradeQuote, updateState])
}
