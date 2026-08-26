import { useCallback, useEffect, useRef, useState } from 'react'

import { AssistantUiContext } from '../types'

/**
 * Notices when the form works out what a just-applied trade actually costs.
 *
 * The assistant proposes before any of this exists: no quote, no price impact, no
 * distance from market. So the moment worth speaking up in is AFTER the trade lands
 * in the form — which is when the form itself knows the trade is absurd.
 *
 * That gap is not theoretical. A limit order was proposed at 400,000 USDC per WETH
 * from an ambiguous "for 4000 usd", the form immediately showed +16,101% above
 * market, and the assistant said nothing — because nothing told it to look again.
 *
 * One shot per applied trade: the form re-quotes constantly, and a comment on every
 * tick would be both expensive and unbearable.
 */
export interface QuoteWatch {
  /** Set once, when a signal worth commenting on appears. */
  ready: number | null
  clear(): void
  /** Call after a proposal is applied. */
  arm(): void
}

export function useQuoteWatch(uiContext: AssistantUiContext): QuoteWatch {
  const [ready, setReady] = useState<number | null>(null)
  const armed = useRef(false)

  // Anything the form can tell us that the assistant couldn't know at proposal time.
  const signal = uiContext.quoteStatus ?? uiContext.limitPrice ?? uiContext.limitOrderSize ?? null
  const hasSignal = Boolean(signal)

  useEffect(() => {
    if (!armed.current || !hasSignal) return
    armed.current = false
    setReady(Date.now())
  }, [hasSignal])

  const arm = useCallback(() => {
    armed.current = true
  }, [])

  const clear = useCallback(() => setReady(null), [])

  return { ready, arm, clear }
}
