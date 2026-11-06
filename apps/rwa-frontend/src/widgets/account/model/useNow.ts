'use client'

import { useEffect, useState } from 'react'

/** Unix seconds, refreshed every `intervalMs` */
export function useNow(intervalMs: number): number {
  const [now, setNow] = useState(() => Date.now() / 1000)

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now() / 1000), intervalMs)

    return () => clearInterval(timer)
  }, [intervalMs])

  return now
}
