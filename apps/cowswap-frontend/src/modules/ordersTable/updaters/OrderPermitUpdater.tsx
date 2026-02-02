import { useEffect } from 'react'

import { TradeType } from 'modules/trade'

import { GenericOrder } from 'common/types'

import { useDoesOrderHaveValidPermit } from '../hooks/useDoesOrderHaveValidPermit'
import { useUpdatePendingOrdersPermitValidityState } from '../hooks/usePendingOrderPermitValidity'

type OrderPermitUpdaterProps = {
  order: GenericOrder
  tradeType: TradeType
}

export function OrderPermitUpdater(props: OrderPermitUpdaterProps): null {
  const { order, tradeType } = props
  const updatePendingOrdersPermitValidityState = useUpdatePendingOrdersPermitValidityState()

  const isPermitValid = useDoesOrderHaveValidPermit(order, tradeType)
  // undefined means we don't know yet, so we optimistically assume it's valid
  useEffect(() => {
    updatePendingOrdersPermitValidityState({ [order.id]: isPermitValid === undefined ? true : isPermitValid })
  }, [order.id, isPermitValid, updatePendingOrdersPermitValidityState])

  return null
}
