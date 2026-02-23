import { useEffect, useState } from 'react'

export function useDelay(delayMs: number | null): boolean {
  const [hasDelayElapsed, setHasDelayElapsed] = useState(!(typeof delayMs === 'number' && delayMs > 0))

  useEffect(() => {
    if (typeof delayMs !== 'number' || delayMs <= 0) return

    setHasDelayElapsed(false)

    const timeoutId = window.setTimeout(() => {
      setHasDelayElapsed(true)
    }, delayMs)

    return () => window.clearTimeout(timeoutId)
  }, [delayMs])

  return hasDelayElapsed
}
