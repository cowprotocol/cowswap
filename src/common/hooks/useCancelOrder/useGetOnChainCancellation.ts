import { useCallback } from 'react'

import { useEthFlowContract, useGP2SettlementContract } from 'legacy/hooks/useContract'
import { Order } from 'legacy/state/orders/actions'

import { useComposableCowContract } from 'modules/advancedOrders/hooks/useComposableCowContract'
import { getIsEthFlowOrder } from 'modules/swap/containers/EthFlowStepper'

import {
  getConditionalOrderCancellation,
  getEthFlowCancellation,
  getOnChainCancellation,
  OnChainCancellation,
} from 'common/hooks/useCancelOrder/onChainCancellation'

export function useGetOnChainCancellation(): (order: Order) => Promise<OnChainCancellation> {
  const ethFlowContract = useEthFlowContract()
  const settlementContract = useGP2SettlementContract()
  const composableCowContract = useComposableCowContract()

  return useCallback(
    (order: Order) => {
      const composableCowId = order.composableCowInfo?.id

      const isEthFlowOrder = getIsEthFlowOrder(order)

      if (composableCowId) {
        return getConditionalOrderCancellation(composableCowContract!, composableCowId)
      }

      if (isEthFlowOrder) {
        return getEthFlowCancellation(ethFlowContract!, order)
      }

      return getOnChainCancellation(settlementContract!, order)
    },
    [ethFlowContract, settlementContract, composableCowContract]
  )
}
