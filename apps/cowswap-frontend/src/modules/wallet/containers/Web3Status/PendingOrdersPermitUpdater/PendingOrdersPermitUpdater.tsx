import { ReactNode } from 'react'

import { OrderClass } from '@cowprotocol/cow-sdk'

import { OrderPermitUpdater, useGetPendingOrdersPermitValidityState } from 'modules/ordersTable'
import { TradeType } from 'modules/trade'

import { usePendingOrdersFillability } from 'common/hooks/usePendingOrdersFillability'


export function PendingOrdersPermitUpdater(): ReactNode {
  const pendingOrdersFillability = usePendingOrdersFillability(OrderClass.MARKET)
  const pendingOrdersPermitValidityState = useGetPendingOrdersPermitValidityState()

  return Object.keys(pendingOrdersFillability).map((orderId) => {
    const fillability = pendingOrdersFillability[orderId]
    // skip if order does not have a permit
    if (!fillability?.hasPermit || fillability.hasEnoughAllowance) return null

    const isPermitInvalid = pendingOrdersPermitValidityState[orderId] === false
    // if permit is already known to be invalid, skip
    if (isPermitInvalid) return null

    const order = pendingOrdersFillability[orderId]?.order
    if (!order) return null

    return <OrderPermitUpdater key={order.id} order={order} tradeType={TradeType.SWAP} />
  })
}
