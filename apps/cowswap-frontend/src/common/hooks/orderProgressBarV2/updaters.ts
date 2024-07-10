import { useAtom } from 'jotai'
import { useLayoutEffect, useRef } from 'react'

import { executingOrdersCountdownAtom } from './atoms'
import { ExecutingOrdersCountdown } from './types'

export function ProgressBarV2ExecutingOrdersCountdownUpdater(): null {
  const [allCountdowns, setCountdowns] = useAtom(executingOrdersCountdownAtom)

  const countdownsRef = useRef(allCountdowns)
  countdownsRef.current = allCountdowns

  useLayoutEffect(() => {
    function updateCountdowns() {
      const countdowns = countdownsRef.current

      const orderIds = Object.keys(countdowns)
      if (!orderIds.length || orderIds.every((orderId) => !countdowns[orderId])) {
        return
      }

      const newCountdowns = orderIds.reduce<ExecutingOrdersCountdown>((acc, orderId) => {
        const value = countdowns[orderId]
        acc[orderId] = value && value - 1 >= 0 ? value - 1 : value

        return acc
      }, {})

      setCountdowns(newCountdowns)
    }

    const timer = setInterval(updateCountdowns, 1000)

    return () => clearInterval(timer)
  }, [setCountdowns])

  return null
}
