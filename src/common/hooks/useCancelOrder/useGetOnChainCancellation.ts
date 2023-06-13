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
import { getIsComposableCowParentOrder } from 'utils/orderUtils/getIsComposableCowParentOrder'

export function useGetOnChainCancellation(): (order: Order) => Promise<OnChainCancellation> {
  const ethFlowContract = useEthFlowContract()
  const settlementContract = useGP2SettlementContract()
  const cancelTwapOrder = useCancelTwapOrder()

  return useCallback(
    (order: Order) => {
      const isComposableCowOrder = getIsComposableCowParentOrder(order)

      if (isComposableCowOrder) {
        return cancelTwapOrder(order)
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
