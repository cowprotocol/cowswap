/* eslint-disable @typescript-eslint/no-restricted-imports */ // TODO: Don't use 'modules' import
import { useCallback } from 'react'

import { getIsNativeToken } from '@cowprotocol/common-utils'

import { useLingui } from '@lingui/react/macro'
import { useConfig } from 'wagmi'

import { Order } from 'legacy/state/orders/actions'

import { useCancelTwapOrder } from 'modules/twap/hooks/useCancelTwapOrder'

import {
  getEthFlowCancellation,
  getOnChainCancellation,
  OnChainCancellation,
} from 'common/hooks/useCancelOrder/onChainCancellation'
import { useEthFlowContract, useGP2SettlementContractData } from 'common/hooks/useContract'
import { getIsComposableCowParentOrder } from 'utils/orderUtils/getIsComposableCowParentOrder'
import { getIsTheLastTwapPart } from 'utils/orderUtils/getIsTheLastTwapPart'

export function useGetOnChainCancellation(): (order: Order) => Promise<OnChainCancellation> {
  const config = useConfig()
  const {
    result: { contract: ethFlowContract, chainId: ethFlowChainId },
  } = useEthFlowContract()
  const settlementContractData = useGP2SettlementContractData()
  const cancelTwapOrder = useCancelTwapOrder()
  const { t } = useLingui()

  const { chainId: settlementChainId } = settlementContractData

  return useCallback(
    (order: Order) => {
      if (ethFlowChainId !== settlementChainId) {
        throw new Error(
          t`Chain Id from contracts should match (ethFlow=${ethFlowChainId}, settlement=${settlementChainId})`,
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

      return getOnChainCancellation({ config, order, settlementContractData })
    },
    [config, ethFlowChainId, settlementChainId, settlementContractData, t, cancelTwapOrder, ethFlowContract],
  )
}
