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
    const isPermitValid =
      pendingOrdersPermitValidityState[orderId] === undefined ? true : pendingOrdersPermitValidityState[orderId]
    if (fillability) {
      // todo check permit amount and validity further
      const hasEnoughAllowance = fillability.hasEnoughAllowance || isPermitValid
      return !hasEnoughAllowance || !fillability.hasEnoughBalance
    }

    return false
  })
}
