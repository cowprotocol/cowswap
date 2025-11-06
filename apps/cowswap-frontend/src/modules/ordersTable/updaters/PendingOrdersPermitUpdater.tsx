import { ReactNode } from 'react'

import { OrderClass } from '@cowprotocol/cow-sdk'

import { TradeType } from 'modules/trade'

import { OrderPermitUpdater } from './OrderPermitUpdater'

import { useGetActiveOrdersPermitValidityState } from '../hooks/usePendingOrderPermitValidity'
import { usePendingOrdersFillability } from '../hooks/usePendingOrdersFillability'

type PendingOrdersPermitUpdaterProps = {
  orderClass?: OrderClass
  tradeType: TradeType
}

export function PendingOrdersPermitUpdater({ orderClass, tradeType }: PendingOrdersPermitUpdaterProps): ReactNode {
  const pendingOrdersFillability = usePendingOrdersFillability(orderClass)
  const activeOrdersPermitValidityState = useGetActiveOrdersPermitValidityState()

  return Object.keys(pendingOrdersFillability).map((orderId) => {
    const fillability = pendingOrdersFillability[orderId]
    // skip if order does not have a permit
    if (!fillability?.hasPermit || fillability.hasEnoughAllowance) return null

    const isPermitInvalid = activeOrdersPermitValidityState[orderId] === false
    // if permit is already known to be invalid, skip
    if (isPermitInvalid) return null

    const order = pendingOrdersFillability[orderId]?.order
    if (!order) return null

    return <OrderPermitUpdater key={order.id} order={order} tradeType={tradeType} />
  })
}
