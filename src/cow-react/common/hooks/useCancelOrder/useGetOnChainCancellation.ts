import { useCallback } from 'react'
import { Order } from 'state/orders/actions'
import {
  getEthFlowCancellation,
  getOnChainCancellation,
  OnChainCancellation,
} from '@cow/common/hooks/useCancelOrder/onChainCancellation'
import { useEthFlowContract, useGP2SettlementContract } from 'hooks/useContract'
import { getIsEthFlowOrder } from '@cow/modules/swap/containers/EthFlowStepper'

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
