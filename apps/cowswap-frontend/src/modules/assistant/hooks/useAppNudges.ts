import { useEffect } from 'react'

import { FILL_MARKER, PLACED_MARKER, QUOTE_MARKER } from './useConversation'
import { FillWatch } from './useFillWatch'
import { PlacementWatch } from './usePlacementWatch'
import { QuoteWatchState } from './useQuoteWatch'

import { AssistantMessage, AssistantUiContext } from '../types'

interface AppNudgesParams {
  busy: boolean
  fillWatch: FillWatch
  messages: AssistantMessage[]
  placementWatch: PlacementWatch
  quoteWatch: QuoteWatchState
  send(text: string, uiContext: AssistantUiContext): void
  uiContext: AssistantUiContext
}

/**
 * The turns the app injects on its own behalf.
 *
 * Three moments the assistant can't see for itself: the form has priced a trade, an
 * order was posted, an order settled. Each arrives as a marker turn with the relevant
 * state attached, fires **once**, and only into a conversation that already exists —
 * an unprompted "your order filled" in an empty panel is a notification, and the app
 * already has those.
 *
 * Gathered into one hook because they are one idea expressed three times, and because
 * three near-identical effects in the drawer pushed it past its line budget. Their
 * ordering here is not significant; each waits on `busy`, so they queue behind each
 * other rather than racing.
 */
export function useAppNudges({
  busy,
  fillWatch,
  messages,
  placementWatch,
  quoteWatch,
  send,
  uiContext,
}: AppNudgesParams): void {
  const hasConversation = messages.length > 0

  // Once the form has priced the applied trade, ask for a comment on it. This is the
  // only point at which the assistant can see what the trade actually costs.
  useEffect(() => {
    if (!quoteWatch.ready || busy) return
    quoteWatch.clear()
    send(QUOTE_MARKER, { ...uiContext, inputMode: 'app' })
    // uiContext changes on every tick; depending on it would resend the nudge.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quoteWatch.ready, busy])

  // An order was signed and posted. Market orders never reach here — see
  // usePlacementWatch for why the settlement message is the better one there.
  useEffect(() => {
    if (!placementWatch.placement || busy || !hasConversation) return
    const lastPlacement = placementWatch.placement
    placementWatch.clear()
    send(PLACED_MARKER, { ...uiContext, inputMode: 'app', lastPlacement })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placementWatch.placement, busy, hasConversation])

  // An order settled, with the amounts that actually executed.
  useEffect(() => {
    if (!fillWatch.fill || busy || !hasConversation) return
    const lastFill = fillWatch.fill
    fillWatch.clear()
    send(FILL_MARKER, { ...uiContext, inputMode: 'app', lastFill })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fillWatch.fill, busy, hasConversation])
}
