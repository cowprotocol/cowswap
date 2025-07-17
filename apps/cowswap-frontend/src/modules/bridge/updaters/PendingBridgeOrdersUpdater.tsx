import { ReactNode, useEffect } from 'react'

import { BridgeStatus, SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useCrossChainOrder, usePendingBridgeOrders, useUpdateBridgeOrderQuote } from 'entities/bridgeOrders'
import { useAddOrderToSurplusQueue } from 'entities/surplusModal'

interface PendingOrderUpdaterProps {
  chainId: SupportedChainId
  orderUid: string
}

function PendingOrderUpdater({ chainId, orderUid }: PendingOrderUpdaterProps): ReactNode {
  const { data: crossChainOrder } = useCrossChainOrder(chainId, orderUid)
  const updateBridgeOrderQuote = useUpdateBridgeOrderQuote()
  const addOrderToSurplusQueue = useAddOrderToSurplusQueue()

  useEffect(() => {
    if (!crossChainOrder) return

    const orderUid = crossChainOrder.order.uid
    const isOrderExecuted = crossChainOrder.statusResult.status === BridgeStatus.EXECUTED

    // Update bridge order status for ALL status changes, not just EXECUTED
    updateBridgeOrderQuote(orderUid, crossChainOrder.statusResult)

    if (isOrderExecuted) {
      addOrderToSurplusQueue(orderUid)
      // TODO: play MOOO sound
    }
  }, [crossChainOrder, updateBridgeOrderQuote, addOrderToSurplusQueue])

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
