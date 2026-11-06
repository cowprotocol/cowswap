import { useEffect, useState } from 'react'

import { runCountdown } from './runCountdown'

interface RemainingState {
  targetEpochMs: number | null | undefined
  remainingSec: number | undefined
}

/**
 * Whole seconds left until `targetEpochMs` (local clock), re-rendering only when that number changes.
 * Returns `undefined` while there is no target, and stops ticking at `0`.
 * Prefer `useCountdown` when the value is only displayed as text.
 */
export function useRemainingSeconds(targetEpochMs: number | null | undefined): number | undefined {
  const [state, setState] = useState<RemainingState>(() => ({
    targetEpochMs,
    remainingSec: getRemainingSec(targetEpochMs),
  }))

  useEffect(() => {
    if (targetEpochMs == null) {
      return
    }

    return runCountdown(
      () => targetEpochMs - Date.now(),
      (remainingSec) => {
        setState((prev) =>
          prev.targetEpochMs === targetEpochMs && prev.remainingSec === remainingSec
            ? prev
            : { targetEpochMs, remainingSec },
        )
      },
    )
  }, [targetEpochMs])

  // The state still belongs to the previous target on the first render after it changes, until the effect catches up.
  return state.targetEpochMs === targetEpochMs ? state.remainingSec : getRemainingSec(targetEpochMs)
}

function getRemainingSec(targetEpochMs: number | null | undefined): number | undefined {
  return targetEpochMs == null ? undefined : Math.max(0, Math.ceil((targetEpochMs - Date.now()) / 1000))
}
