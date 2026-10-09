import { useEffect, useState } from 'react'

const TICK_MS = 500

export function useRemainingMs(expiresAt: number): number {
  const [remainingMs, setRemainingMs] = useState(() => Math.max(0, expiresAt - Date.now()))

  useEffect(() => {
    const tick = (): void => setRemainingMs(Math.max(0, expiresAt - Date.now()))

    tick()
    const intervalId = setInterval(tick, TICK_MS)

    return () => clearInterval(intervalId)
  }, [expiresAt])

  return remainingMs
}
