import { useCallback } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'
import { Order } from 'legacy/state/orders/actions'
import { useRequestOrderCancellation, useSetOrderCancellationHash } from 'legacy/state/orders/hooks'

import { getIsEthFlowOrder } from 'modules/swap/containers/EthFlowStepper'
import { useSetPartOrderCancelling } from 'modules/twap/hooks/useSetPartOrderCancelling'

import { CancelledOrderInfo } from './onChainCancellation'
import { useGetOnChainCancellation } from './useGetOnChainCancellation'

export function useSendOnChainCancellation() {
  const { chainId } = useWalletInfo()
  const setOrderCancellationHash = useSetOrderCancellationHash()
  const cancelPendingOrder = useRequestOrderCancellation()
  const setPartOrderCancelling = useSetPartOrderCancelling()
  const addTransaction = useTransactionAdder()
  const getOnChainCancellation = useGetOnChainCancellation()

  const processCancelledOrder = useCallback(
    ({ txHash, orderId, sellTokenAddress, sellTokenSymbol }: CancelledOrderInfo) => {
      if (!chainId) return

      const isEthFlowOrder = getIsEthFlowOrder(sellTokenAddress)

      cancelPendingOrder({ id: orderId, chainId })
      setOrderCancellationHash({ chainId, id: orderId, hash: txHash })
      setPartOrderCancelling(orderId)

      if (isEthFlowOrder) {
        addTransaction({ hash: txHash, ethFlow: { orderId, subType: 'cancellation' } })
      } else {
        addTransaction({
          hash: txHash,
          onChainCancellation: { orderId, sellTokenSymbol: sellTokenSymbol || '' },
        })
      }
    },
    [chainId, cancelPendingOrder, setOrderCancellationHash, addTransaction, setPartOrderCancelling]
  )

  return useCallback(
    async (order: Order) => {
      const { sendTransaction } = await getOnChainCancellation(order)

      await sendTransaction(processCancelledOrder)
    },
    [processCancelledOrder, getOnChainCancellation]
  )
}
