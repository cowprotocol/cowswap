import { useState } from 'react'

import { useInterval } from 'common/hooks/useInterval'

const useMachineTimeMs = (updateInterval: number): number => {
  const [now, setNow] = useState(Date.now())

  useInterval({
    callback: () => {
      setNow(Date.now())
    },
    name: 'useMachineTimeMs',
    delay: updateInterval,
  })

  return now
}

export default useMachineTimeMs
