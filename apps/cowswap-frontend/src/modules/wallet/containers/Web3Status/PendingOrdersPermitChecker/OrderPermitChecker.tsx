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
  const { updatePendingOrdersPermitValidityState, pendingOrdersPermitValidityState } =
    usePendingOrdersPermitValidityState()

  const isPermitInvalid = pendingOrdersPermitValidityState[order.id] === false
  // skip if we already know the permit is invalid
  const isPermitValid = useDoesOrderHaveValidPermit(!isPermitInvalid ? order : undefined, TradeType.SWAP)
  // undefined means we don't know yet, so we optimistically assume it's valid
  useEffect(() => {
    updatePendingOrdersPermitValidityState({ [order.id]: isPermitValid === undefined ? true : isPermitValid })
  }, [order.id, isPermitValid, updatePendingOrdersPermitValidityState])

  return null
}
