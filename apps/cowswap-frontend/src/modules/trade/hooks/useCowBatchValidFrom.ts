import { useEffect, useState } from 'react'

import { getCowBatchValidFrom, getServerNowSec } from '@cowprotocol/common-utils'

import { useLocalTimeOffset } from 'common/containers/InvalidLocalTimeWarning/localTimeOffsetState'

/**
 * Stable next-batch `validFrom` (unix seconds). Recomputes via `setTimeout` when the
 * current window elapses (no per-second polling). Uses quote-derived clock skew when available.
 */
export function useCowBatchValidFrom(enabled: boolean): number | undefined {
  const timeOffset = useLocalTimeOffset()
  const [validFrom, setValidFrom] = useState<number | undefined>()

  useEffect(() => {
    if (!enabled) {
      setValidFrom(undefined)
      return
    }

    let timeoutId: ReturnType<typeof setTimeout> | undefined

    const schedule = (): void => {
      const nextValidFrom = getCowBatchValidFrom(getServerNowSec(timeOffset ?? 0))
      setValidFrom(nextValidFrom)

      // At least 1ms so a boundary-equal clock cannot busy-loop with setTimeout(0).
      const delayMs = Math.max(1, (nextValidFrom - getServerNowSec(timeOffset ?? 0)) * 1000)
      timeoutId = setTimeout(schedule, delayMs)
    }

    schedule()

    return () => {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId)
      }
    }
  }, [enabled, timeOffset])

  return validFrom
}
