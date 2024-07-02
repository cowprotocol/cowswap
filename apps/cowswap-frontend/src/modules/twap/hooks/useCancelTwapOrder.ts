import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { useSafeAppsSdk } from '@cowprotocol/wallet'

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
  const safeAppsSdk = useSafeAppsSdk()
  const settlementContract = useGP2SettlementContract()
  const composableCowContract = useComposableCowContract()

  return useCallback(
    async (twapOrderId: string, order: Order) => {
      if (!composableCowContract || !settlementContract || !safeAppsSdk) {
        throw new Error('Context is not full to cancel TWAP order')
      }

      const partOrder = twapPartOrders[twapOrderId]?.sort((a, b) => a.order.validTo - b.order.validTo)[0]
      const partOrderId = partOrder?.uid

      const context = { composableCowContract, settlementContract, orderId: twapOrderId, partOrderId }

      return {
        estimatedGas: await estimateCancelTwapOrderTxs(context),
        sendTransaction: (processCancelledOrder) => {
          return safeAppsSdk.txs.send({ txs: cancelTwapOrderTxs(context) }).then((res) => {
            const txHash = res.safeTxHash
            const sellTokenAddress = order.inputToken.address
            const sellTokenSymbol = order.inputToken.symbol

            setTwapOrderStatus(twapOrderId, TwapOrderStatus.Cancelling)
            processCancelledOrder({ txHash, orderId: twapOrderId, sellTokenAddress, sellTokenSymbol })
          })
        },
      }
    },
    [composableCowContract, settlementContract, safeAppsSdk, twapPartOrders, setTwapOrderStatus]
  )
}
