import { useEffect, useState } from 'react'

import { TWAP_REFRESH_INTERVAL } from '../twap.constants'

export function useCurrentUnixTime(): number {
  const [now, setNow] = useState(0)

  useEffect(() => {
    const update = (): void => setNow(Math.ceil(Date.now() / 1000))
    const interval = window.setInterval(update, TWAP_REFRESH_INTERVAL)
    update()

    return () => window.clearInterval(interval)
  }, [])

  return now
}
