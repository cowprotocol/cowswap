import { useCallback } from 'react'

import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'
import { Order } from 'legacy/state/orders/actions'
import { useRequestOrderCancellation, useSetOrderCancellationHash } from 'legacy/state/orders/hooks'

import { getIsEthFlowOrder } from 'modules/swap/containers/EthFlowStepper'
import { useWalletInfo } from 'modules/wallet'

import { CancelledOrderInfo } from './onChainCancellation'
import { useGetOnChainCancellation } from './useGetOnChainCancellation'

export function useSendOnChainCancellation() {
  const { chainId } = useWalletInfo()
  const setOrderCancellationHash = useSetOrderCancellationHash()
  const cancelPendingOrder = useRequestOrderCancellation()
  const addTransaction = useTransactionAdder()
  const getOnChainCancellation = useGetOnChainCancellation()

  const processCancelledOrder = useCallback(
    ({ txHash, orderId, sellTokenAddress, sellTokenSymbol }: CancelledOrderInfo) => {
      if (!chainId) return

      const isEthFlowOrder = getIsEthFlowOrder(sellTokenAddress)

      cancelPendingOrder({ id: orderId, chainId })
      setOrderCancellationHash({ chainId, id: orderId, hash: txHash })

      if (isEthFlowOrder) {
        addTransaction({ hash: txHash, ethFlow: { orderId, subType: 'cancellation' } })
      } else {
        addTransaction({
          hash: txHash,
          onChainCancellation: { orderId, sellTokenSymbol: sellTokenSymbol || '' },
        })
      }
    },
    [chainId, cancelPendingOrder, setOrderCancellationHash, addTransaction]
  )

  return useCallback(
    async (order: Order) => {
      const { sendTransaction } = await getOnChainCancellation(order)

      await sendTransaction(processCancelledOrder)
    },
    [processCancelledOrder, getOnChainCancellation]
  )
}
