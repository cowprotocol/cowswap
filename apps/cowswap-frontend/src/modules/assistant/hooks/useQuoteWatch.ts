import { useCallback, useEffect, useRef, useState } from 'react'

import { LandedStatus } from './useProposalLanded'

import { AssistantUiContext } from '../types'

/** What the form actually shows, compared against what was applied. */
export type QuoteWatchState = {
  /** Set once per applied trade, when there's something to comment on. */
  ready: number | null
  clear(): void
  /** Call after a proposal is applied. */
  arm(): void
}

/**
 * Notices when the form works out what a just-applied trade actually costs.
 *
 * The assistant proposes before any of this exists: no quote, no price impact, no
 * distance from market. So the moment worth speaking up in is AFTER the trade lands
 * in the form — which is when the form itself knows the trade is absurd.
 *
 * That gap is not theoretical. A limit order went in at 400,000 USDC per WETH, the
 * form showed +16,101% above market, and the assistant said nothing.
 *
 * ⚠️ **Gated on `landed`, not on a change in the signal.** The first version fired
 * when `hasSignal` flipped false→true, which fails in the ordinary case of somebody
 * trying a second trade: the form still carries the previous order's rate, so the
 * flag is already true, nothing transitions, and the watch stays silent forever.
 * `landed` means the form now matches the trade that was just applied, so any signal
 * present is about the new trade and no transition is needed to prove it.
 *
 * Only `pending` blocks, not `partial`. A trade whose amounts didn't land as proposed
 * is one of the cases most worth commenting on — letting the verification gate
 * silence the safety net would be exactly the wrong coupling.
 *
 * One shot per applied trade: the form re-quotes constantly, and a comment on every
 * tick would be both expensive and unbearable.
 */
export function useQuoteWatch(uiContext: AssistantUiContext, landed: LandedStatus): QuoteWatchState {
  const [ready, setReady] = useState<number | null>(null)
  const armed = useRef(false)

  // Anything the form can tell us that the assistant couldn't know at proposal time.
  // estimatedFillPrice is in here so a limit order sitting exactly at market — no
  // rate impact, and no quote either, because limit orders don't get one — still
  // earns the fill-price explanation the prompt asks for.
  const hasSignal = Boolean(
    uiContext.quoteStatus ?? uiContext.limitPrice ?? uiContext.limitOrderSize ?? uiContext.estimatedFillPrice,
  )

  useEffect(() => {
    if (!armed.current || landed === 'pending' || !hasSignal) return
    armed.current = false
    console.info('[assistant] quote signal after apply — asking for a comment')
    setReady(Date.now())
  }, [hasSignal, landed])

  const arm = useCallback(() => {
    armed.current = true
  }, [])

  const clear = useCallback(() => setReady(null), [])

  return { ready, arm, clear }
}
