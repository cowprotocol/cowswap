import { useSetAtom } from 'jotai'
import { useEffect, useRef } from 'react'

import { useTradeFormValidationContext } from '../hooks/useTradeFormValidationContext'
import { tradeFormValidationContextAtom } from '../state/tradeFormValidationContextAtom'

export function TradeFormValidationUpdater(): null {
  const updateContext = useSetAtom(tradeFormValidationContextAtom)
  const commonContext = useTradeFormValidationContext()

  // TEMP DIAGNOSTIC - remove once the "Maximum update depth exceeded" repro is pinpointed.
  const diagFireCountRef = useRef(0)

  useEffect(() => {
    if (!commonContext) return

    diagFireCountRef.current += 1

    console.log('[DIAG TradeFormValidationUpdater] effect fired, count =', diagFireCountRef.current)

    updateContext({
      ...commonContext,
    })
  }, [commonContext, updateContext])

  return null
}
