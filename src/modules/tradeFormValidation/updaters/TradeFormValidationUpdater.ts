import { useUpdateAtom } from 'jotai/utils'
import { useEffect, useMemo } from 'react'

import { useTradeFormValidationContext } from '../hooks/useTradeFormValidationContext'
import { tradeFormValidationContextAtom } from '../state/tradeFormValidationContextAtom'

export function TradeFormValidationUpdater({ isExpertMode }: { isExpertMode: boolean }) {
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

  return null
}
