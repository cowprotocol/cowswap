import { useCallback, useEffect, useRef } from 'react'

import ms from 'ms.macro'

const FIRST_RETRY_DELAY_MS = ms`1s`
const MAX_RETRY_DELAY_MS = ms`30s`

export interface CaptchaRetry {
  scheduleRetry(retry: () => void): void
  resetRetries(): void
}

export function useCaptchaRetry(): CaptchaRetry {
  const attemptRef = useRef(0)
  const timeoutRef = useRef<number | undefined>(undefined)

  const scheduleRetry = useCallback((retry: () => void) => {
    const delay = Math.min(FIRST_RETRY_DELAY_MS * 2 ** attemptRef.current, MAX_RETRY_DELAY_MS)

    attemptRef.current += 1
    window.clearTimeout(timeoutRef.current)
    timeoutRef.current = window.setTimeout(retry, delay)
  }, [])

  const resetRetries = useCallback(() => {
    window.clearTimeout(timeoutRef.current)
    attemptRef.current = 0
  }, [])

  useEffect(() => () => window.clearTimeout(timeoutRef.current), [])

  return { scheduleRetry, resetRetries }
}
