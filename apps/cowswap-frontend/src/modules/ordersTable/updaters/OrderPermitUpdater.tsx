import { useEffect } from 'react'

import { Order } from 'legacy/state/orders/actions'

import { TradeType } from 'modules/trade'

import { useDoesOrderHaveValidPermit } from '../hooks/useDoesOrderHaveValidPermit'
import { useUpdateActiveOrdersPermitValidityState } from '../hooks/usePendingOrderPermitValidity'

type OrderPermitUpdaterProps = {
  order: Order
  tradeType: TradeType
}

export function OrderPermitUpdater(props: OrderPermitUpdaterProps): null {
  const { order, tradeType } = props
  const updateActiveOrdersPermitValidityState = useUpdateActiveOrdersPermitValidityState()

  const isPermitValid = useDoesOrderHaveValidPermit(order, tradeType)
  // undefined means we don't know yet, so we optimistically assume it's valid
  useEffect(() => {
    updateActiveOrdersPermitValidityState({ [order.id]: isPermitValid === undefined ? true : isPermitValid })
  }, [order.id, isPermitValid, updateActiveOrdersPermitValidityState])

  return null
}

