import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { OrderClass } from '@cowprotocol/cow-sdk'

import { useGetActiveOrdersPermitValidityState } from 'modules/ordersTable'

import { usePendingOrdersFillability } from 'common/hooks/usePendingOrdersFillability'


export function useShowUnfillableOrderAlert(): boolean {
  const pendingOrdersFillability = usePendingOrdersFillability(OrderClass.MARKET)
  const { isPartialApproveEnabled } = useFeatureFlags()
  const activeOrdersPermitValidityState = useGetActiveOrdersPermitValidityState()

  if (!isPartialApproveEnabled) {
    return false
  }

  return Object.keys(pendingOrdersFillability).some((orderId) => {
    const fillability = pendingOrdersFillability[orderId]
    const hasValidPermit = activeOrdersPermitValidityState[orderId] === true
    if (fillability) {
      const hasEnoughAllowance = fillability.hasEnoughAllowance || hasValidPermit
      return !hasEnoughAllowance || !fillability.hasEnoughBalance
    }

    return false
  })
}
