import { RefObject, useEffect } from 'react'

import { getServerNowSec } from '@cowprotocol/common-utils'

import { useLocalTimeOffset } from './localTimeOffsetState'
import { runCountdown } from './runCountdown'
import { useLatestRef } from './useLatestRef'

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
 * Writes the formatted remaining time into `targetRef` without re-rendering, waking up only when the
 * displayed second changes so ticks stay aligned with the wall clock.
 * Uses the global quote-derived local time offset for clock skew.
 * Use `useRemainingSeconds` when the remaining time has to drive rendering.
 *
 * TODO: Migrate other React-state / jotai countdown timers to this hook, or to `useRemainingSeconds` when the value drives rendering:
 * - apps/cowswap-frontend/src/modules/orderProgressBar/updaters/ProgressBarExecutingOrdersUpdater.ts
 * - apps/cowswap-frontend/src/modules/trade/pure/TradeConfirmation/CountDown.tsx
 * - apps/cowswap-frontend/src/modules/tradeQuote/hooks/useTradeQuotePolling.ts (tradeQuoteCounterAtom)
 * - apps/cowswap-frontend/src/modules/trade/containers/QuotePolingProgress/index.tsx
 * - libs/common-hooks/src/useTimeAgo.ts
 * - libs/common-hooks/src/useMachineTime.ts (remaining callers)
 */
export function useCountdown({ targetRef, targetEpochSec, format, onRemainingChange }: UseCountdownParams): void {
  const timeOffsetSec = useLocalTimeOffset() ?? 0
  const formatRef = useLatestRef(format)
  const onRemainingChangeRef = useLatestRef(onRemainingChange)

  useEffect(() => {
    if (targetEpochSec == null) {
      return
    }

    return runCountdown(
      () => (targetEpochSec - getServerNowSec(timeOffsetSec)) * 1000,
      (remainingSec) => {
        const element = targetRef.current

        if (!element) {
          return false
        }

        element.textContent = formatRef.current(remainingSec)
        onRemainingChangeRef.current?.(remainingSec)

        return true
      },
    )
  }, [targetRef, targetEpochSec, timeOffsetSec, formatRef, onRemainingChangeRef])
}
