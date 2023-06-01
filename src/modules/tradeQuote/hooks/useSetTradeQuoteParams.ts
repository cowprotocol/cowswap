import { useUpdateAtom } from 'jotai/utils'
import { useEffect } from 'react'

import { tradeQuoteParamsAtom, TradeQuoteParamsState } from '../state/tradeQuoteParamsAtom'

export function useSetTradeQuoteParams(state: TradeQuoteParamsState) {
  const updateState = useUpdateAtom(tradeQuoteParamsAtom)

  useEffect(() => {
    updateState(state)
  }, [state, updateState])
}
