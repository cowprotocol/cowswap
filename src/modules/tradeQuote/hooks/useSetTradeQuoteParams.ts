import { useUpdateAtom } from 'jotai/utils'
import { useEffect } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { updateTradeQuoteAtom } from '../state/tradeQuoteAtom'
import { tradeQuoteParamsAtom } from '../state/tradeQuoteParamsAtom'

export function useSetTradeQuoteParams(amount: CurrencyAmount<Currency> | null) {
  const updateTradeQuote = useUpdateAtom(updateTradeQuoteAtom)
  const updateState = useUpdateAtom(tradeQuoteParamsAtom)

  useEffect(() => {
    updateTradeQuote({ response: null, error: null })
    updateState({ amount })
  }, [amount, updateTradeQuote, updateState])
}
