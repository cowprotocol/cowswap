import { useState } from 'react'

import { useInterval } from './useInterval'

export const useMachineTimeMs = (updateInterval: number): number => {
  // eslint-disable-next-line react-hooks/purity
  const [now, setNow] = useState(Date.now())

  useInterval(() => {
    setNow(Date.now())
  }, updateInterval)
  return now
}
