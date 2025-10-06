import { ReactNode } from 'react'

import { OrderClass } from '@cowprotocol/cow-sdk'

import { usePendingOrdersPermitValidityState } from 'modules/ordersTable'

import { usePendingOrdersFillability } from 'common/hooks/usePendingOrdersFillability'

import { OrderPermitChecker } from './OrderPermitChecker'


export function PendingOrdersPermitChecker(): ReactNode {
  const pendingOrdersFillability = usePendingOrdersFillability(OrderClass.MARKET)
  const { pendingOrdersPermitValidityState } = usePendingOrdersPermitValidityState()

  return Object.keys(pendingOrdersFillability).map((orderId) => {
    const fillability = pendingOrdersFillability[orderId]
    // skip if order does not have a permit
    if (!fillability?.hasPermit || fillability.hasEnoughAllowance) return null

    const isPermitInvalid = pendingOrdersPermitValidityState[orderId] === false
    // if permit is already known to be invalid, skip
    if (isPermitInvalid) return null

    const order = pendingOrdersFillability[orderId]?.order
    if (!order) return null

    return <OrderPermitChecker key={order.id} order={order} />
  })
}
