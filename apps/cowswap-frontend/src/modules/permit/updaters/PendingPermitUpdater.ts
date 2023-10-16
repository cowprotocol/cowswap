import { useSetAtom } from 'jotai'
import { useEffect, useRef } from 'react'

import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { PENDING_ORDER_PERMIT_CHECK_INTERVAL } from '../const'
import { useCheckHasValidPendingPermit } from '../hooks/useCheckHasValidPendingPermit'
import { updateOrdersPermitStatusAtom } from '../state/ordersPermitStatusAtom'

export type PendingPermitUpdaterProps = {
  orders: ParsedOrder[]
}

export function PendingPermitUpdater({ orders }: PendingPermitUpdaterProps): null {
  const ordersRef = useRef(orders)
  ordersRef.current = orders

  const checkHasValidPendingPermit = useCheckHasValidPendingPermit()
  const updateOrdersPermitStatus = useSetAtom(updateOrdersPermitStatusAtom)

  useEffect(() => {
    const checkOrders = () => {
      console.debug(`UpdatePendingPermit: checking orders`, ordersRef.current.length)
      ordersRef.current.forEach((order) => {
        checkHasValidPendingPermit(order).then((status) => {
          console.debug(`UpdatePendingPermit: checked order ${order.id} with status ${status}`)
          updateOrdersPermitStatus({ [order.id]: status })
        })
      })
    }

    checkOrders()
    const interval = setInterval(checkOrders, PENDING_ORDER_PERMIT_CHECK_INTERVAL)

    return () => clearInterval(interval)
  }, [checkHasValidPendingPermit, updateOrdersPermitStatus])

  return null
}
