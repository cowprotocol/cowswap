import { useCallback, useEffect, useRef, useState } from 'react'

import { LandedStatus } from './useProposalLanded'

import { AssistantUiContext } from '../types'

/** How long the signals must stop changing before they count as the form's answer. */
const SETTLE_MS = 1500

/**
 * Fire anyway after this long. A quote that never stops moving would otherwise mean
 * never commenting, and silence is the failure mode this hook exists to remove.
 */
const MAX_WAIT_MS = 8000

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
 * But `partial` waits for the form to settle first. On a re-proposal over the same
 * pair the tokens already match, so the state reads `partial` from the instant the
 * navigation starts, while the amounts on screen are still the previous trade's.
 * Commenting there would mean commenting on numbers that are about to be replaced —
 * the same stale-state mistake, arriving from the other direction.
 *
 * One shot per applied trade: the form re-quotes constantly, and a comment on every
 * tick would be both expensive and unbearable.
 */
export function useQuoteWatch(uiContext: AssistantUiContext, landed: LandedStatus): QuoteWatchState {
  const [ready, setReady] = useState<number | null>(null)
  const armed = useRef(false)
  /** When arming became effective, so the wait can be bounded. */
  const armedAt = useRef<number | null>(null)

  // Anything the form can tell us that the assistant couldn't know at proposal time.
  // estimatedFillPrice is in here so a limit order sitting exactly at market — no
  // rate impact, and no quote either, because limit orders don't get one — still
  // earns the fill-price explanation the prompt asks for.
  const hasSignal = Boolean(
    uiContext.quoteStatus ?? uiContext.limitPrice ?? uiContext.limitOrderSize ?? uiContext.estimatedFillPrice,
  )

  // Everything the comment would be based on, as one value. Any change to any of it
  // restarts the wait below, so the comment is made on the numbers that stay put.
  const signature = JSON.stringify([
    uiContext.quoteStatus,
    uiContext.limitPrice,
    uiContext.limitOrderSize,
    uiContext.estimatedFillPrice,
  ])

  useEffect(() => {
    if (!armed.current || landed === 'pending' || !hasSignal) return undefined

    if (armedAt.current === null) armedAt.current = Date.now()
    const waited = Date.now() - armedAt.current

    const fire = (): void => {
      if (!armed.current) return
      armed.current = false
      armedAt.current = null
      console.info(`[assistant] quote settled after apply (${landed}) — asking for a comment`)
      setReady(Date.now())
    }

    // ⚠️ **Never fire on the first quote.** `landed` proves the tokens and amounts
    // arrived; it proves nothing about the quote, which is a separate async result
    // for a pair that may have just changed. Firing immediately reported "quote
    // looks fine" on a swap the form went on to price at -33%, because the impact
    // still belonged to the previous pair — WETH→USDC is liquid where WETH→DAI is
    // not. An early right-sounding answer is worse than a late one: nobody
    // re-reads it.
    //
    // So wait for the numbers to stop moving. Each change re-runs this effect and
    // restarts the timer; MAX_WAIT_MS stops a permanently-churning quote from
    // meaning permanent silence.
    if (waited >= MAX_WAIT_MS) {
      fire()
      return undefined
    }

    const timer = setTimeout(fire, Math.min(SETTLE_MS, MAX_WAIT_MS - waited))
    return () => clearTimeout(timer)
  }, [hasSignal, landed, signature])

  const arm = useCallback(() => {
    armed.current = true
    armedAt.current = null
  }, [])

  const clear = useCallback(() => setReady(null), [])

  return { ready, arm, clear }
}
