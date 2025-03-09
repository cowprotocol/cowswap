import { useCallback } from 'react'

import { getIsNativeToken } from '@cowprotocol/common-utils'

import { Order } from 'legacy/state/orders/actions'

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
  const {
    result: { contract: ethFlowContract, chainId: ethFlowChainId },
  } = useEthFlowContract()
  const { contract: settlementContract, chainId: settlementChainId } = useGP2SettlementContract()
  const cancelTwapOrder = useCancelTwapOrder()

  return useCallback(
    (order: Order) => {
      if (ethFlowChainId !== settlementChainId) {
        throw new Error(
          `Chain Id from contracts should match (ethFlow=${ethFlowChainId}, settlement=${settlementChainId})`,
        )
      }

      if (getIsTheLastTwapPart(order.composableCowInfo)) {
        return cancelTwapOrder(order.composableCowInfo!.parentId!, order)
      }

      if (getIsComposableCowParentOrder(order)) {
        return cancelTwapOrder(order.composableCowInfo!.id!, order)
      }

      const isEthFlowOrder = getIsNativeToken(order.inputToken)

      if (isEthFlowOrder) {
        return getEthFlowCancellation(ethFlowContract!, order)
      }

      return getOnChainCancellation(settlementContract!, order)
    },
    [ethFlowContract, settlementContract, cancelTwapOrder, ethFlowChainId, settlementChainId],
  )
}
