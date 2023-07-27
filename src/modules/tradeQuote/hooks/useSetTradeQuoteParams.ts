import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { updateTradeQuoteAtom } from '../state/tradeQuoteAtom'
import { tradeQuoteParamsAtom } from '../state/tradeQuoteParamsAtom'

export function useSetTradeQuoteParams(amount: CurrencyAmount<Currency> | null) {
  const updateTradeQuote = useSetAtom(updateTradeQuoteAtom)
  const updateState = useSetAtom(tradeQuoteParamsAtom)

  const amountStr = amount?.quotient.toString()
  useEffect(() => {
    updateTradeQuote({ response: null, error: null })
    updateState({ amount })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amountStr, updateTradeQuote, updateState])
}
