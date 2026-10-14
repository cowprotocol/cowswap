import { useSetAtom } from 'jotai'
import { startTransition, useEffect } from 'react'

import { useTradeFormValidationContext } from '../hooks/useTradeFormValidationContext'
import { tradeFormValidationContextAtom } from '../state/tradeFormValidationContextAtom'

export function TradeFormValidationUpdater(): null {
  const updateContext = useSetAtom(tradeFormValidationContextAtom)
  const commonContext = useTradeFormValidationContext()

  useEffect(() => {
    if (!commonContext) return

    // The context changes on every keystroke. A plain update here leaves work pending after each keystroke commit,
    // so a held key never lets React reset its nested update counter and it throws "Maximum update depth exceeded".
    // Transition updates are not counted.
    startTransition(() => {
      updateContext({
        ...commonContext,
      })
    })
  }, [commonContext, updateContext])

  return null
}
