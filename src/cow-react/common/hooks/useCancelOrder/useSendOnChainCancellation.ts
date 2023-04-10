import { useCallback } from 'react'
import { Order } from 'state/orders/actions'
import { useRequestOrderCancellation, useSetOrderCancellationHash } from 'state/orders/hooks'
import { useTransactionAdder } from 'state/enhancedTransactions/hooks'
import { useWalletInfo } from '@cow/modules/wallet'
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
