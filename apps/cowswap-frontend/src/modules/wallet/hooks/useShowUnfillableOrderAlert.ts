import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { OrderClass } from '@cowprotocol/cow-sdk'

import { usePendingOrdersFillability } from 'common/hooks/usePendingOrdersFillability'

export function useShowUnfillableOrderAlert(): boolean {
  const pendingOrdersFillability = usePendingOrdersFillability(OrderClass.MARKET)
  const { isPartialApproveEnabled } = useFeatureFlags()

  if (!isPartialApproveEnabled) {
    return false
  }

  return Object.keys(pendingOrdersFillability)
    .map((orderId) => {
      const fillability = pendingOrdersFillability[orderId]
      return fillability ? !fillability.hasEnoughAllowance && !fillability.hasPermit : false
    })
    .some(Boolean)
}
