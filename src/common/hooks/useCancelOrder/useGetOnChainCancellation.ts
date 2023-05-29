import { useCallback } from 'react'

import { useEthFlowContract, useGP2SettlementContract } from 'legacy/hooks/useContract'
import { Order } from 'legacy/state/orders/actions'

import { getIsEthFlowOrder } from 'modules/swap/containers/EthFlowStepper'

import {
  getEthFlowCancellation,
  getOnChainCancellation,
  OnChainCancellation,
} from 'common/hooks/useCancelOrder/onChainCancellation'

export function useGetOnChainCancellation(): (order: Order) => Promise<OnChainCancellation> {
  const ethFlowContract = useEthFlowContract()
  const settlementContract = useGP2SettlementContract()

  return useCallback(
    (order: Order) => {
      const isEthFlowOrder = getIsEthFlowOrder(order)

      if (isEthFlowOrder) {
        return getEthFlowCancellation(ethFlowContract!, order)
      } else {
        return getOnChainCancellation(settlementContract!, order)
      }
    },
    [ethFlowContract, settlementContract]
  )
}
