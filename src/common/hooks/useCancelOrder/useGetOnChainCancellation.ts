import { useCallback } from 'react'

import { useEthFlowContract, useGP2SettlementContract } from 'legacy/hooks/useContract'
import { Order } from 'legacy/state/orders/actions'

import { getIsEthFlowOrder } from 'modules/swap/containers/EthFlowStepper'
import { useCancelTwapOrder } from 'modules/twap/hooks/useCancelTwapOrder'

import {
  getEthFlowCancellation,
  getOnChainCancellation,
  OnChainCancellation,
} from 'common/hooks/useCancelOrder/onChainCancellation'

export function useGetOnChainCancellation(): (order: Order) => Promise<OnChainCancellation> {
  const ethFlowContract = useEthFlowContract()
  const settlementContract = useGP2SettlementContract()
  const cancelTwapOrder = useCancelTwapOrder()

  return useCallback(
    (order: Order) => {
      const isComposableCowOrder = !!order.composableCowInfo?.id
      const isEthFlowOrder = getIsEthFlowOrder(order.inputToken.address)

      if (isComposableCowOrder) {
        return cancelTwapOrder(order)
      }

      if (isEthFlowOrder) {
        return getEthFlowCancellation(ethFlowContract!, order)
      }

      return getOnChainCancellation(settlementContract!, order)
    },
    [ethFlowContract, settlementContract, cancelTwapOrder]
  )
}
