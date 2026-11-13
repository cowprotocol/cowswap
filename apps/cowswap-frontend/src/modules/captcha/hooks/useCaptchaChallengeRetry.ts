import { useCallback, useEffect, useRef } from 'react'

import ms from 'ms.macro'

const CAPTCHA_RETRY_BASE_DELAY_MS = ms`1s`
const CAPTCHA_RETRY_MAX_DELAY_MS = ms`30s`

export interface CaptchaChallengeRetry {
  resetAttempts: () => void
  scheduleRetry: (resetWidget: () => void, options?: { immediate?: boolean }) => void
}

export function useCaptchaChallengeRetry(): CaptchaChallengeRetry {
  const attemptRef = useRef(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const usedImmediateResetRef = useRef(false)

  const clearTimer = useCallback(() => {
    if (timeoutRef.current === null) return

    clearTimeout(timeoutRef.current)
    timeoutRef.current = null
  }, [])

  useEffect(() => {
    return () => clearTimer()
  }, [clearTimer])

  const resetAttempts = useCallback(() => {
    attemptRef.current = 0
    usedImmediateResetRef.current = false
    clearTimer()
  }, [clearTimer])

  const scheduleRetry = useCallback(
    (resetWidget: () => void, options?: { immediate?: boolean }): void => {
      clearTimer()

      if (options?.immediate === true && !usedImmediateResetRef.current) {
        usedImmediateResetRef.current = true
        resetWidget()
        return
      }

      const delay = Math.min(CAPTCHA_RETRY_BASE_DELAY_MS * 2 ** attemptRef.current, CAPTCHA_RETRY_MAX_DELAY_MS)
      attemptRef.current += 1

      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null
        resetWidget()
      }, delay)
    },
    [clearTimer],
  )

  return { resetAttempts, scheduleRetry }
}
