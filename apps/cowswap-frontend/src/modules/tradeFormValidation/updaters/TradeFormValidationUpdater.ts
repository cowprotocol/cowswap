import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { useTradeFormValidationContext } from '../hooks/useTradeFormValidationContext'
import { tradeFormValidationContextAtom } from '../state/tradeFormValidationContextAtom'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function TradeFormValidationUpdater() {
  const updateContext = useSetAtom(tradeFormValidationContextAtom)
  const commonContext = useTradeFormValidationContext()

  useEffect(() => {
    if (!commonContext) return

    updateContext({
      ...commonContext,
    })
  }, [commonContext, updateContext])

  return null
}
