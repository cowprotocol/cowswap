import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { useSendBatchTransactions } from '@cowprotocol/wallet'

import { Order } from 'legacy/state/orders/actions'

import { useComposableCowContract } from 'modules/advancedOrders/hooks/useComposableCowContract'

import type { OnChainCancellation } from 'common/hooks/useCancelOrder/onChainCancellation'
import { useGP2SettlementContract } from 'common/hooks/useContract'

import { cancelTwapOrderTxs, estimateCancelTwapOrderTxs } from '../services/cancelTwapOrderTxs'
import { setTwapOrderStatusAtom } from '../state/twapOrdersListAtom'
import { twapPartOrdersAtom } from '../state/twapPartOrdersAtom'
import { TwapOrderStatus } from '../types'

export function useCancelTwapOrder(): (twapOrderId: string, order: Order) => Promise<OnChainCancellation> {
  const twapPartOrders = useAtomValue(twapPartOrdersAtom)
  const setTwapOrderStatus = useSetAtom(setTwapOrderStatusAtom)
  const sendBatchTransactions = useSendBatchTransactions()
  const { contract: settlementContract, chainId: settlementChainId } = useGP2SettlementContract()
  const { contract: composableCowContract, chainId: composableCowChainId } = useComposableCowContract()

  return useCallback(
    async (twapOrderId: string, order: Order) => {
      if (!composableCowContract || !settlementContract) {
        throw new Error('Context is not full to cancel TWAP order')
      }

      if (composableCowChainId !== settlementChainId) {
        throw new Error('Composable Cow and Settlement contracts are not on the same chain')
      }

      const partOrder = twapPartOrders[twapOrderId]?.sort((a, b) => a.order.validTo - b.order.validTo)[0]
      const partOrderId = partOrder?.uid

      const context = { composableCowContract, settlementContract, orderId: twapOrderId, partOrderId }

      return {
        estimatedGas: await estimateCancelTwapOrderTxs(context),
        sendTransaction: (processCancelledOrder) => {
          return sendBatchTransactions(cancelTwapOrderTxs(context)).then((txHash) => {
            const sellTokenAddress = order.inputToken.address
            const sellTokenSymbol = order.inputToken.symbol

            setTwapOrderStatus(twapOrderId, TwapOrderStatus.Cancelling)
            processCancelledOrder({ txHash, orderId: twapOrderId, sellTokenAddress, sellTokenSymbol })
          })
        },
      }
    },
    [
      composableCowContract,
      settlementContract,
      sendBatchTransactions,
      twapPartOrders,
      setTwapOrderStatus,
      composableCowChainId,
      settlementChainId,
    ],
  )
}
