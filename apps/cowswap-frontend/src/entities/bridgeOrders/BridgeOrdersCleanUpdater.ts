import { useAtom } from 'jotai'
import { useEffect, useRef } from 'react'

import ms from 'ms.macro'

import { bridgeOrdersAtom } from './state/bridgeOrdersAtom'

const BRIDGE_ORDERS_TTL = ms`3d`

/**
 * To avoid localStorage overflowing, we need to periodically remove outdated orders
 * Orders are create more than 3 days ago should be deleted
 */
export function BridgeOrdersCleanUpdater(): null {
  const isUpdaterDoneRef = useRef(false)
  const [bridgeOrders, setBridgeOrders] = useAtom(bridgeOrdersAtom)

  useEffect(() => {
    if (isUpdaterDoneRef.current) return

    const stateCopy = { ...bridgeOrders }
    const now = Date.now()

    let hasChanges = false

    Object.values(stateCopy).forEach((state) => {
      if (!state) return

      Object.keys(state).forEach((account) => {
        const orders = state[account]

        if (!orders?.length) return

        // Once there is some data in state - mark updater as executed
        // Because it's supposed to be executed once
        isUpdaterDoneRef.current = true

        const newOrders = orders.filter((order) => {
          return order.creationTimestamp + BRIDGE_ORDERS_TTL > now
        })

        if (newOrders.length < orders.length) {
          state[account] = newOrders
          hasChanges = true
        }
      })
    })

    if (hasChanges) {
      setBridgeOrders(stateCopy)
    }
  }, [bridgeOrders, setBridgeOrders])

  return null
}
