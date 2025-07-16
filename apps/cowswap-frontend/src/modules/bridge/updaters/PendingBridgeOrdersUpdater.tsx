import { ReactNode, useEffect } from 'react'

import { BridgeStatus, SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useCrossChainOrder, usePendingBridgeOrders, useUpdateBridgeOrderQuote } from 'entities/bridgeOrders'
import { useAddOrderToSurplusQueue } from 'entities/surplusModal'

import { useFulfillBridgeOrder } from 'legacy/state/orders/hooks'

interface PendingOrderUpdaterProps {
  chainId: SupportedChainId
  orderUid: string
}

function PendingOrderUpdater({ chainId, orderUid }: PendingOrderUpdaterProps): ReactNode {
  const { data: crossChainOrder } = useCrossChainOrder(chainId, orderUid)
  const updateBridgeOrderQuote = useUpdateBridgeOrderQuote()
  const addOrderToSurplusQueue = useAddOrderToSurplusQueue()
  const fulfillOrdersBatch = useFulfillBridgeOrder()

  useEffect(() => {
    if (!crossChainOrder) return

    const orderUid = crossChainOrder.order.uid
    const isOrderExecuted = crossChainOrder.statusResult.status === BridgeStatus.EXECUTED

    if (isOrderExecuted) {
      updateBridgeOrderQuote(orderUid, crossChainOrder.statusResult)
      addOrderToSurplusQueue(orderUid)
      fulfillOrdersBatch({ chainId: chainId, order: crossChainOrder })
    }
  }, [crossChainOrder, updateBridgeOrderQuote, addOrderToSurplusQueue, fulfillOrdersBatch, chainId])

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
