import { RefObject, useCallback, useRef } from 'react'

import { getServerNowSec } from '@cowprotocol/common-utils'

import { useLocalTimeOffset } from './localTimeOffsetState'
import { useLatestRef } from './useLatestRef'
import { useThrottledRaf } from './useThrottledRaf'

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
 * Writes the formatted remaining time into `targetRef` via rAF, updating the DOM only when the
 * displayed second changes so ticks stay aligned with the wall clock.
 * Uses the global quote-derived local time offset for clock skew.
 *
 * TODO: Migrate other React-state / jotai countdown timers to this hook (or the same rAF + DOM pattern):
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
  const enabled = targetEpochSec != null

  const tick = useCallback(() => {
    const element = targetRef.current

    if (!element || targetEpochSec == null) {
      return
    }

    const remainingSec = Math.max(0, Math.ceil(targetEpochSec - getServerNowSec(timeOffsetSec)))

    // Skip if the remaining second is the same as the last one (assumes the formatter donesn't carr about milliseconds):
    if (remainingSec === lastRemainingRef.current) {
      return
    }

    lastRemainingRef.current = remainingSec
    element.textContent = formatRef.current(remainingSec)
    onRemainingChangeRef.current?.(remainingSec)
  }, [targetRef, targetEpochSec, timeOffsetSec, formatRef, onRemainingChangeRef])

  useThrottledRaf(tick, enabled)
}
