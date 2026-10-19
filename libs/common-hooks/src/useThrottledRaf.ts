import { useEffect } from 'react'

import { Command } from '@cowprotocol/types'

import { useLatestRef } from './useLatestRef'

const DEFAULT_MIN_INTERVAL_MS = 100

/**
 * Runs `callback` on a `requestAnimationFrame` loop while `enabled` is true.
 * Skips frames until `minIntervalMs` have elapsed since the last invocation (default 100ms).
 * Pass `0` to invoke on every frame.
 */
export function useThrottledRaf(callback: Command, enabled: boolean, minIntervalMs = DEFAULT_MIN_INTERVAL_MS): void {
  const callbackRef = useLatestRef(callback)

  useEffect(() => {
    if (!enabled) {
      return
    }

    let rafId = 0
    let lastInvokedAt: number | undefined
    let cancelled = false

    const loop = (now: number): void => {
      if (cancelled) {
        return
      }

      if (lastInvokedAt === undefined || minIntervalMs <= 0 || now - lastInvokedAt >= minIntervalMs) {
        lastInvokedAt = now
        callbackRef.current()
      }

      rafId = requestAnimationFrame(loop)
    }

    rafId = requestAnimationFrame(loop)

    return () => {
      cancelled = true
      cancelAnimationFrame(rafId)
    }
  }, [callbackRef, enabled, minIntervalMs])
}
