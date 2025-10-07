import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { OrderClass } from '@cowprotocol/cow-sdk'

import { usePendingOrdersPermitValidityState } from 'modules/ordersTable/state/pendingOrdersPermitValidityState'

import { usePendingOrdersFillability } from 'common/hooks/usePendingOrdersFillability'

export function useShowUnfillableOrderAlert(): boolean {
  const pendingOrdersFillability = usePendingOrdersFillability(OrderClass.MARKET)
  const { isPartialApproveEnabled } = useFeatureFlags()
  const { pendingOrdersPermitValidityState } = usePendingOrdersPermitValidityState()

  if (!isPartialApproveEnabled) {
    return false
  }

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
