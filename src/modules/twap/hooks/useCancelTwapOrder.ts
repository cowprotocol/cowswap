import { useAtomValue } from 'jotai/utils'
import { useCallback } from 'react'

import { useGP2SettlementContract } from 'legacy/hooks/useContract'
import { Order } from 'legacy/state/orders/actions'

import { useComposableCowContract } from 'modules/advancedOrders/hooks/useComposableCowContract'
import { useSafeAppsSdk } from 'modules/wallet/web3-react/hooks/useSafeAppsSdk'

import type { OnChainCancellation } from 'common/hooks/useCancelOrder/onChainCancellation'

import { cancelTwapOrderTxs, estimateCancelTwapOrderTxs } from '../services/cancelTwapOrderTxs'
import { twapPartOrdersListAtom } from '../state/twapPartOrdersAtom'

export function useCancelTwapOrder(): (order: Order) => Promise<OnChainCancellation> {
  const twapPartOrders = useAtomValue(twapPartOrdersListAtom)
  const safeAppsSdk = useSafeAppsSdk()
  const settlementContract = useGP2SettlementContract()
  const composableCowContract = useComposableCowContract()

  return useCallback(
    async (order: Order) => {
      const orderId = order.composableCowInfo?.id

      if (!orderId) {
        throw new Error('Wrong orderId for TWAP order cancellation')
      }

      if (!composableCowContract || !settlementContract || !safeAppsSdk) {
        throw new Error('Context is not full to cancel TWAP order')
      }

      const partOrder = twapPartOrders.find((item) => item.twapOrderId === orderId)
      const partOrderId = partOrder?.uid

      const context = { composableCowContract, settlementContract, orderId, partOrderId }

      return {
        estimatedGas: await estimateCancelTwapOrderTxs(context),
        sendTransaction: (processCancelledOrder) => {
          return safeAppsSdk.txs.send({ txs: cancelTwapOrderTxs(context) }).then((res) => {
            const txHash = res.safeTxHash
            const sellTokenAddress = order.inputToken.address
            const sellTokenSymbol = order.inputToken.symbol

            processCancelledOrder({ txHash, orderId, sellTokenAddress, sellTokenSymbol })

            if (partOrderId) {
              processCancelledOrder({ txHash, orderId: partOrderId, sellTokenAddress, sellTokenSymbol })
            }
          })
        },
      }
    },
    [composableCowContract, settlementContract, safeAppsSdk, twapPartOrders]
  )
}
