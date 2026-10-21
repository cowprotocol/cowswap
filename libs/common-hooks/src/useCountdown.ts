import { RefObject, useEffect, useRef } from 'react'

import { getServerNowSec } from '@cowprotocol/common-utils'

import { useLocalTimeOffset } from './localTimeOffsetState'
import { useLatestRef } from './useLatestRef'

const ELEMENT_RETRY_MS = 100
const TICK_SLACK_MS = 1

export interface UseCountdownParams {
  /** Reference to the DOM element to write the countdown to. */
  targetRef: RefObject<HTMLElement | null>
  /** Unix timestamp (seconds) when the countdown reaches zero. `null` / `undefined` stops the timer. */
  targetEpochSec?: number | null
  /** Formats remaining whole seconds as plain text written to `textContent`. */
  format: (remainingSec: number) => string
  /** Called when the displayed remaining second changes (including the first write). */
  onRemainingChange?: (remainingSec: number) => void
}

/**
 * Writes the formatted remaining time into `targetRef`, scheduling one timeout per displayed second
 * so ticks stay aligned with the wall clock without waking the main thread in between.
 * Uses the global quote-derived local time offset for clock skew.
 *
 * TODO: Migrate other React-state / jotai countdown timers to this hook (or the same timer + DOM pattern):
 * - apps/cowswap-frontend/src/modules/trade/pure/SolanaSigningCountdown/useRemainingMs.ts
 * - apps/cowswap-frontend/src/modules/orderProgressBar/updaters/ProgressBarExecutingOrdersUpdater.ts
 * - apps/cowswap-frontend/src/modules/trade/pure/TradeConfirmation/CountDown.tsx
 * - apps/cowswap-frontend/src/modules/tradeQuote/hooks/useTradeQuotePolling.ts (tradeQuoteCounterAtom)
 * - apps/cowswap-frontend/src/modules/trade/containers/QuotePolingProgress/index.tsx
 * - libs/common-hooks/src/useTimeAgo.ts
 * - libs/common-hooks/src/useMachineTime.ts
 * - apps/cow-fi/app/(mev-blocker)/mev-blocker/page.tsx
 */
export function useCountdown({ targetRef, targetEpochSec, format, onRemainingChange }: UseCountdownParams): void {
  const timeOffsetSec = useLocalTimeOffset() ?? 0
  const formatRef = useLatestRef(format)
  const onRemainingChangeRef = useLatestRef(onRemainingChange)
  const lastRemainingRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (targetEpochSec == null) {
      return
    }

    let timeoutId: ReturnType<typeof setTimeout> | undefined

    const tick = (): void => {
      const element = targetRef.current

      if (!element) {
        timeoutId = setTimeout(tick, ELEMENT_RETRY_MS)
        return
      }

      const secondsLeft = targetEpochSec - getServerNowSec(timeOffsetSec)
      const remainingSec = Math.max(0, Math.ceil(secondsLeft))

      if (remainingSec !== lastRemainingRef.current) {
        lastRemainingRef.current = remainingSec
        element.textContent = formatRef.current(remainingSec)
        onRemainingChangeRef.current?.(remainingSec)
      }

      if (remainingSec > 0) {
        timeoutId = setTimeout(tick, getMsUntilDisplayChange(secondsLeft))
      }
    }

    tick()

    return () => clearTimeout(timeoutId)
  }, [targetRef, targetEpochSec, timeOffsetSec, formatRef, onRemainingChangeRef])
}

// ceil(secondsLeft) drops by one once secondsLeft reaches the integer below it, i.e. after its fractional part
// elapses; a whole number takes a full second. The slack absorbs float rounding so we don't wake just short of it.
function getMsUntilDisplayChange(secondsLeft: number): number {
  const fractionMs = (secondsLeft - Math.floor(secondsLeft)) * 1000

  return Math.ceil(fractionMs || 1000) + TICK_SLACK_MS
}
