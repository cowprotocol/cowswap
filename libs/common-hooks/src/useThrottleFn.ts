import { useCallback, useRef } from 'react'

import { usePreviousRef } from './usePrevious'

export function useThrottleFn<Args extends unknown[], R>(
  fn: (...args: Args) => R,
  timeoutMs: number,
): (...args: Args) => R | undefined {
  const fnRef = usePreviousRef(fn)
  const lastCallTimestampRef = useRef<number | null>(null)

  return useCallback(
    (...args: Args): R | undefined => {
      const now = Date.now()

      if (lastCallTimestampRef.current !== null && now - lastCallTimestampRef.current < timeoutMs) {
        return undefined
      }

      lastCallTimestampRef.current = now

      return fnRef.current(...args)
    },
    [fnRef, timeoutMs],
  )
}
