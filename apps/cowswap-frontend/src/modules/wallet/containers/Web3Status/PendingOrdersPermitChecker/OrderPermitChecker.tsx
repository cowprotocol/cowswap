import { useEffect } from 'react'

import { Order } from 'legacy/state/orders/actions'

import { useDoesOrderHaveValidPermit } from 'modules/ordersTable/hooks/useDoesOrderHaveValidPermit'
import { usePendingOrdersPermitValidityState } from 'modules/ordersTable/state/pendingOrdersPermitValidityState'
import { TradeType } from 'modules/trade'

type OrderPermitCheckerProps = {
  order: Order
}

export function OrderPermitChecker(props: OrderPermitCheckerProps): null {
  const { order } = props
  const { updatePendingOrdersPermitValidityState } = usePendingOrdersPermitValidityState()

  const isPermitValid = useDoesOrderHaveValidPermit(order, TradeType.SWAP)
  // undefined means we don't know yet, so we optimistically assume it's valid
  useEffect(() => {
    updatePendingOrdersPermitValidityState({ [order.id]: isPermitValid === undefined ? true : isPermitValid })
  }, [order.id, isPermitValid, updatePendingOrdersPermitValidityState])

  return null
}
