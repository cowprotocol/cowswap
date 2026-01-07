import { OrderClass } from '@cowprotocol/cow-sdk'

import { useGetPendingOrdersPermitValidityState, usePendingOrdersFillability } from 'modules/ordersTable'

export function useShowUnfillableOrderAlert(): boolean {
  const pendingOrdersFillability = usePendingOrdersFillability(OrderClass.MARKET)
  const pendingOrdersPermitValidityState = useGetPendingOrdersPermitValidityState()

  return Object.keys(pendingOrdersFillability).some((orderId) => {
    const fillability = pendingOrdersFillability[orderId]
    const hasValidPermit = pendingOrdersPermitValidityState[orderId] === true
    if (fillability) {
      const hasEnoughAllowance = fillability.hasEnoughAllowance || hasValidPermit
      return !hasEnoughAllowance || !fillability.hasEnoughBalance
    }

    return false
  })
}
