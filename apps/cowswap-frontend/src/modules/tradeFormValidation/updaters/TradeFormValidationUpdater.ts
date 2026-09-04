import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { useDebounce } from '@cowprotocol/common-hooks'

import ms from 'ms.macro'

import { useTradeFormValidationContext } from '../hooks/useTradeFormValidationContext'
import { tradeFormValidationContextAtom } from '../state/tradeFormValidationContextAtom'

// commonContext is rebuilt from ~30 upstream hooks and changes on every keystroke in any trade
// field (recipient included). Pushing it into the shared atom on every single change fans out
// into a full validation re-render each time; under fast/continuous typing (e.g. holding a key,
// or pasting a long invalid recipient) those cascades can queue up faster than React settles
// them, eventually tripping its "Maximum update depth exceeded" guard. Debouncing this the same
// way useQuoteParams debounces amount changes caps how often that cascade can run.
const VALIDATION_CONTEXT_DEBOUNCE_TIME = ms`300ms`

export function TradeFormValidationUpdater(): null {
  const updateContext = useSetAtom(tradeFormValidationContextAtom)
  const commonContext = useTradeFormValidationContext()
  const debouncedContext = useDebounce(commonContext, VALIDATION_CONTEXT_DEBOUNCE_TIME)

  useEffect(() => {
    if (!debouncedContext) return

    updateContext({
      ...debouncedContext,
    })
  }, [debouncedContext, updateContext])

  return null
}
