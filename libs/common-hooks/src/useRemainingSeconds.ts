import { useEffect, useState } from 'react'

import { runCountdown } from './runCountdown'

/**
 * Whole seconds left until `targetEpochMs` (local clock), re-rendering only when that number changes.
 * Returns `undefined` while there is no target, and stops ticking at `0`.
 * Prefer `useCountdown` when the value is only displayed as text.
 */
export function useRemainingSeconds(targetEpochMs: number | null | undefined): number | undefined {
  const [remainingSec, setRemainingSec] = useState(() =>
    targetEpochMs == null ? undefined : getRemainingSec(targetEpochMs),
  )

  useEffect(() => {
    if (targetEpochMs == null) {
      setRemainingSec(undefined)
      return
    }

    return runCountdown(() => targetEpochMs - Date.now(), setRemainingSec)
  }, [targetEpochMs])

  return remainingSec
}

function getRemainingSec(targetEpochMs: number): number {
  return Math.max(0, Math.ceil((targetEpochMs - Date.now()) / 1000))
}
