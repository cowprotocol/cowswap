import { useCallback, useState } from 'react'

export function useThrottleFn(fn: (...args: unknown[]) => unknown, timeout: number): typeof fn {
  const [lastCallTimestamp, setLastCallTimestamp] = useState<number | null>(null)

  return useCallback(
    (...args) => {
      const now = Date.now()

      if (lastCallTimestamp && now - lastCallTimestamp < timeout) return

      setLastCallTimestamp(now)

      return fn(args)
    },
    [fn, lastCallTimestamp, timeout]
  )
}
