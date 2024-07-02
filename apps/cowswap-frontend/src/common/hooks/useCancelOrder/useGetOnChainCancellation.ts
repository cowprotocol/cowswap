import { useCallback } from 'react'

import { Order } from 'legacy/state/orders/actions'

import { getIsEthFlowOrder } from 'modules/swap/containers/EthFlowStepper'
import { useCancelTwapOrder } from 'modules/twap/hooks/useCancelTwapOrder'

import {
  getEthFlowCancellation,
  getOnChainCancellation,
  OnChainCancellation,
} from 'common/hooks/useCancelOrder/onChainCancellation'
import { useEthFlowContract, useGP2SettlementContract } from 'common/hooks/useContract'
import { getIsComposableCowParentOrder } from 'utils/orderUtils/getIsComposableCowParentOrder'
import { getIsTheLastTwapPart } from 'utils/orderUtils/getIsTheLastTwapPart'

export function useGetOnChainCancellation(): (order: Order) => Promise<OnChainCancellation> {
  const ethFlowContract = useEthFlowContract()
  const settlementContract = useGP2SettlementContract()
  const cancelTwapOrder = useCancelTwapOrder()

  return useCallback(
    (order: Order) => {
      if (getIsTheLastTwapPart(order.composableCowInfo)) {
        return cancelTwapOrder(order.composableCowInfo!.parentId!, order)
      }

      if (getIsComposableCowParentOrder(order)) {
        return cancelTwapOrder(order.composableCowInfo!.id!, order)
      }

      const isEthFlowOrder = getIsEthFlowOrder(order.inputToken.address)

      if (isEthFlowOrder) {
        return getEthFlowCancellation(ethFlowContract!, order)
      }

      return getOnChainCancellation(settlementContract!, order)
    },
    [ethFlowContract, settlementContract, cancelTwapOrder]
  )
}
