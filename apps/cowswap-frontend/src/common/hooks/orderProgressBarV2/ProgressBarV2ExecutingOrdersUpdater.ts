import { useAtom } from 'jotai'
import { useLayoutEffect, useRef } from 'react'

import { ordersProgressBarCountdown } from './atoms'
import { OrdersProgressBarCountdown } from './types'

export function ProgressBarV2ExecutingOrdersUpdater(): null {
  useCountdownUpdater()

  return null
}

function useCountdownUpdater() {
  const [allCountdowns, setCountdowns] = useAtom(ordersProgressBarCountdown)

  // Use a ref to not restart the updater on every change
  const countdownsRef = useRef(allCountdowns)
  // Important! Update the ref on every re-render
  countdownsRef.current = allCountdowns

  useLayoutEffect(() => {
    function updateCountdowns() {
      const countdowns = countdownsRef.current

      const orderIds = Object.keys(countdowns)
      if (!orderIds.length || orderIds.every((orderId) => !countdowns[orderId])) {
        // Skip update if there are no countdowns or none of them are truthy
        return
      }

      const newCountdowns = orderIds.reduce<OrdersProgressBarCountdown>((acc, orderId) => {
        const value = countdowns[orderId]

        // Decrement counter
        acc[orderId] = value && value - 1 >= 0 ? value - 1 : value

        return acc
      }, {})

      setCountdowns(newCountdowns)
    }

    const timer = setInterval(updateCountdowns, 1000)

    return () => clearInterval(timer)
  }, [setCountdowns])
}
