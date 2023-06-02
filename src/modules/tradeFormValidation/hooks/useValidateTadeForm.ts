import { useUpdateAtom } from 'jotai/utils'
import { useEffect, useMemo } from 'react'

import { useTradeFormValidationContext } from './useTradeFormValidationContext'

import { tradeFormValidationContextAtom } from '../state/tradeFormValidationContextAtom'

export function useValidateTadeForm(isExpertMode: boolean) {
  const updateContext = useUpdateAtom(tradeFormValidationContextAtom)
  const localContext = useMemo(() => ({ isExpertMode }), [isExpertMode])
  const commonContext = useTradeFormValidationContext()

  useEffect(() => {
    if (!commonContext) return

    updateContext({
      ...commonContext,
      ...localContext,
    })
  }, [commonContext, localContext, updateContext])
}
