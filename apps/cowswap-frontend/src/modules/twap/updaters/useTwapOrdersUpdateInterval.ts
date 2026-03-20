import { useEffect, useState } from 'react'

/** Drives periodic recomputation of TWAP order state (aligned with `TWAP_ORDERS_UPDATE_INTERVAL`). */
export function useTwapOrdersUpdateInterval(intervalMs: number): number {
  const [updateTimestamp, setUpdateTimestamp] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setUpdateTimestamp(Date.now())
    }, intervalMs)

    return () => {
      clearInterval(interval)
    }
  }, [intervalMs])

  return updateTimestamp
}
