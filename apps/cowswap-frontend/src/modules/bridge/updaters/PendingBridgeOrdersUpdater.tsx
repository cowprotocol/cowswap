import { ReactNode, useEffect } from 'react'

import { BridgeStatus, SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useCrossChainOrder, usePendingBridgeOrders, useUpdateBridgeOrderQuote } from 'entities/bridgeOrders'
import { useAddOrderToSurplusQueue } from 'entities/surplusModal'

import { useFulfillBridgeOrder, useRefundBridgeOrder } from 'legacy/state/orders/hooks'

interface PendingOrderUpdaterProps {
  chainId: SupportedChainId
  orderUid: string
}

function PendingOrderUpdater({ chainId, orderUid }: PendingOrderUpdaterProps): ReactNode {
  const { data: crossChainOrder } = useCrossChainOrder(chainId, orderUid)
  const updateBridgeOrderQuote = useUpdateBridgeOrderQuote()
  const addOrderToSurplusQueue = useAddOrderToSurplusQueue()
  const fulfillBridgeOrder = useFulfillBridgeOrder()
  const refundBridgeOrder = useRefundBridgeOrder()

  useEffect(() => {
    if (!crossChainOrder) return

    const orderUid = crossChainOrder.order.uid
    const isOrderExecuted = crossChainOrder.statusResult.status === BridgeStatus.EXECUTED
    const isOrderRefund = crossChainOrder.statusResult.status === BridgeStatus.REFUND

    if (isOrderExecuted) {
      updateBridgeOrderQuote(orderUid, crossChainOrder.statusResult)
      addOrderToSurplusQueue(orderUid)
      fulfillBridgeOrder({ chainId, order: crossChainOrder })
    } else if (isOrderRefund) {
      refundBridgeOrder({ chainId, order: crossChainOrder })
    }
  }, [crossChainOrder, updateBridgeOrderQuote, addOrderToSurplusQueue, fulfillBridgeOrder, refundBridgeOrder, chainId])

  return null
}

export function PendingBridgeOrdersUpdater(): ReactNode {
  const { chainId } = useWalletInfo()

  const pendingBridgeOrders = usePendingBridgeOrders()

  if (!pendingBridgeOrders) return null

  return (
    <>
      {pendingBridgeOrders.map((order) => (
        <PendingOrderUpdater key={order.orderUid} chainId={chainId} orderUid={order.orderUid} />
      ))}
    </>
  )
}
