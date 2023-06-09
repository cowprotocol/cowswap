import { useCallback } from 'react'

import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'
import { Order } from 'legacy/state/orders/actions'
import { useRequestOrderCancellation, useSetOrderCancellationHash } from 'legacy/state/orders/hooks'

import { getIsEthFlowOrder } from 'modules/swap/containers/EthFlowStepper'
import { useWalletInfo } from 'modules/wallet'

import { useGetOnChainCancellation } from './useGetOnChainCancellation'

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

      const isEthFlowOrder = getIsEthFlowOrder(order)
      const { sendTransaction } = await getOnChainCancellation(order)

      const hash = await sendTransaction()

      cancelPendingOrder({ id: order.id, chainId })
      setOrderCancellationHash({ chainId, id: order.id, hash })

      if (isEthFlowOrder) {
        addTransaction({ hash, ethFlow: { orderId: order.id, subType: 'cancellation' } })
      } else {
        addTransaction({
          hash,
          onChainCancellation: { orderId: order.id, sellTokenSymbol: order.inputToken.symbol || '' },
        })
      }
    },
    [addTransaction, getOnChainCancellation, cancelPendingOrder, chainId, setOrderCancellationHash]
  )
}
