import { ReactNode } from 'react'

import { TradeType } from 'modules/trade'

import { GenericOrder } from 'common/types'

import { OrderPermitUpdater } from './OrderPermit.updater'

import { useOrdersFillability } from '../../../hooks/useOrdersFillability'
import { useGetPendingOrdersPermitValidityState } from '../usePendingOrderPermitValidity'

type OrdersPermitUpdaterProps = {
  orders: GenericOrder[]
  tradeType: TradeType
}

export function OrdersPermitUpdater({ orders, tradeType }: OrdersPermitUpdaterProps): ReactNode {
  const ordersFillability = useOrdersFillability(orders)
  const pendingOrdersPermitValidityState = useGetPendingOrdersPermitValidityState()

  return orders.map((order) => {
    const fillability = ordersFillability[order.id]
    // skip if order does not have a permit
    if (!fillability?.hasPermit || fillability.hasEnoughAllowance) return null

    const isPermitInvalid = pendingOrdersPermitValidityState[order.id] === false
    // if permit is already known to be invalid, skip
    if (isPermitInvalid) return null

    return <OrderPermitUpdater key={order.id} order={order} tradeType={tradeType} />
  })
}
