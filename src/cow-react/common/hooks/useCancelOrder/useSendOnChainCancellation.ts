import { useCallback } from 'react'

import { useEthFlowContract, useGP2SettlementContract } from 'hooks/useContract'
import { Order } from 'state/orders/actions'
import { useRequestOrderCancellation, useSetOrderCancellationHash } from 'state/orders/hooks'
import { useTransactionAdder } from 'state/enhancedTransactions/hooks'
import { useWalletInfo } from '@cow/modules/wallet'
import { getIsEthFlowOrder } from '@cow/modules/swap/containers/EthFlowStepper'
import {
  getEthFlowCancellation,
  getOnChainCancellation,
  OnChainCancellation,
} from './onChainCancellation'

export function useSendOnChainCancellation() {
  const { chainId } = useWalletInfo()
  const setOrderCancellationHash = useSetOrderCancellationHash()
  const cancelPendingOrder = useRequestOrderCancellation()
  const addTransaction = useTransactionAdder()
  const getOnChainCancellation = useGetOnChainCancellation()

  return useCallback(
    async (order: Order) => {
      if (!chainId) {
        return
      }

      const { sendTransaction } = await getOnChainCancellation(order)

      const receipt = await sendTransaction()

      if (receipt?.hash) {
        cancelPendingOrder({ id: order.id, chainId })
        addTransaction({ hash: receipt.hash, ethFlow: { orderId: order.id, subType: 'cancellation' } })
        setOrderCancellationHash({ chainId, id: order.id, hash: receipt.hash })
      }
    },
    [addTransaction, getOnChainCancellation, cancelPendingOrder, chainId, setOrderCancellationHash]
  )
}

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
