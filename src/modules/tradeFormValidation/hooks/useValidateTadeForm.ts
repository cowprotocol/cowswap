import { useUpdateAtom } from 'jotai/utils'
import { useEffect } from 'react'

import { useTradeFormValidationContext } from './useTradeFormValidationContext'

import { tradeFormValidationContextAtom } from '../state/tradeFormValidationContextAtom'
import { TradeFormValidationLocalContext } from '../types'

export function useValidateTadeForm(localContext: TradeFormValidationLocalContext) {
  const updateContext = useUpdateAtom(tradeFormValidationContextAtom)
  const context = useTradeFormValidationContext(localContext)

  useEffect(() => {
    updateContext(context)
  }, [context, updateContext])
}
