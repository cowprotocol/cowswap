import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { useSendBatchTransactions } from '@cowprotocol/wallet'
import { BigNumber } from '@ethersproject/bignumber'

import { useLingui } from '@lingui/react/macro'
import { twapOrdersAtom } from 'entities/twap'

import { Order } from 'legacy/state/orders/actions'

import { useComposableCowContract } from 'modules/advancedOrders'

import type { OnChainCancellation } from 'common/hooks/useCancelOrder/onChainCancellation'
import { useGP2SettlementContract } from 'common/hooks/useContract'

import { cancelTwapOrderTxs, estimateCancelTwapOrderTxs } from '../services/cancelTwapOrderTxs'
import { processTwapCancellation } from '../services/processTwapCancellation'
import { setTwapOrderStatusAtom, updateTwapOrderAtom } from '../state/twapOrdersListAtom'
import { twapPartOrdersAtom } from '../state/twapPartOrdersAtom'
import { TwapOrderItem, TwapOrderStatus } from '../types'
import { resolveDisplayTwapOrder } from '../utils/resolveDisplayTwapOrder'

export function useCancelTwapOrder(): (twapOrderId: string, order: Order) => Promise<OnChainCancellation> {
  const twapOrders = useAtomValue(twapOrdersAtom)
  const twapPartOrders = useAtomValue(twapPartOrdersAtom)
  const setTwapOrderStatus = useSetAtom(setTwapOrderStatusAtom)
  const updateTwapOrder = useSetAtom(updateTwapOrderAtom)
  const sendBatchTransactions = useSendBatchTransactions()
  const { contract: settlementContract, chainId: settlementChainId } = useGP2SettlementContract()
  const { contract: composableCowContract, chainId: composableCowChainId } = useComposableCowContract()
  const { t } = useLingui()

  return useCallback(
    async (twapOrderId: string, order: Order) => {
      const twapOrder = twapOrders[twapOrderId]

      if (twapOrder?.isPrototype) {
        return getPrototypeCancellation(twapOrderId, order, twapOrder, updateTwapOrder)
      }

      if (!composableCowContract || !settlementContract) {
        throw new Error(t`Context is not full to cancel TWAP order`)
      }

      if (composableCowChainId !== settlementChainId) {
        throw new Error(t`Composable Cow and Settlement contracts are not on the same chain`)
      }

      const partOrder = twapPartOrders[twapOrderId]?.sort((a, b) => a.order.validTo - b.order.validTo)[0]
      const partOrderId = partOrder?.uid

      const context = {
        composableCowContract,
        settlementContract,
        orderId: twapOrderId,
        partOrderId,
        chainId: composableCowChainId,
      }

      return {
        estimatedGas: await estimateCancelTwapOrderTxs(context),
        sendTransaction: (processCancelledOrder) => {
          return sendBatchTransactions(cancelTwapOrderTxs(context)).then((txHash) => {
            const sellTokenAddress = order.inputToken.address
            const sellTokenSymbol = order.inputToken.symbol

            setTwapOrderStatus(twapOrderId, TwapOrderStatus.Cancelling)
            processCancelledOrder({ txHash, orderId: twapOrderId, sellTokenAddress, sellTokenSymbol })

            processTwapCancellation(txHash, () => {
              setTwapOrderStatus(twapOrderId, TwapOrderStatus.Cancelled)
            })
          })
        },
      }
    },
    [
      composableCowContract,
      settlementContract,
      composableCowChainId,
      settlementChainId,
      twapOrders,
      twapPartOrders,
      t,
      sendBatchTransactions,
      setTwapOrderStatus,
      updateTwapOrder,
    ],
  )
}

function getPrototypeCancellation(
  twapOrderId: string,
  order: Order,
  twapOrder: TwapOrderItem,
  updateTwapOrder: (payload: { orderId: string; updates: Partial<TwapOrderItem> }) => void,
): OnChainCancellation {
  const resolvedOrder = resolveDisplayTwapOrder(twapOrder)

  return {
    estimatedGas: BigNumber.from(0),
    sendTransaction: async (processCancelledOrder) => {
      const txHash = twapOrder.id
      const sellTokenAddress = order.inputToken.address
      const sellTokenSymbol = order.inputToken.symbol
      const updates = { executionInfo: resolvedOrder.executionInfo }

      updateTwapOrder({ orderId: twapOrderId, updates: { ...updates, status: TwapOrderStatus.Cancelling } })
      processCancelledOrder({ txHash, orderId: twapOrderId, sellTokenAddress, sellTokenSymbol })

      await new Promise((resolve) => setTimeout(resolve, 800))

      updateTwapOrder({ orderId: twapOrderId, updates: { ...updates, status: TwapOrderStatus.Cancelled } })
    },
  }
}
