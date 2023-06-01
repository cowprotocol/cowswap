import { useResetAtom, useUpdateAtom } from 'jotai/utils'
import { useEffect } from 'react'

import { tradeQuoteAtom } from '../state/tradeQuoteAtom'
import { tradeQuoteParamsAtom, TradeQuoteParamsState } from '../state/tradeQuoteParamsAtom'

export function useSetTradeQuoteParams(state: TradeQuoteParamsState) {
  const resetTradeQuote = useResetAtom(tradeQuoteAtom)
  const updateState = useUpdateAtom(tradeQuoteParamsAtom)

  useEffect(() => {
    resetTradeQuote()
    updateState(state)
  }, [state, resetTradeQuote, updateState])
}
