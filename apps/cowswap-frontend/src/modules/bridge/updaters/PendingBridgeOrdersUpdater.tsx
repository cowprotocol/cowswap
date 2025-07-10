import { ReactNode, useEffect } from 'react'

import { BridgeStatus, SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useCrossChainOrder, useBridgeOrders, useUpdateBridgeOrderQuote } from 'entities/bridgeOrders'
import { BRIDGING_FINAL_STATUSES } from 'entities/bridgeOrders/useCrossChainOrder'
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

    if (isOrderExecuted) {
      updateBridgeOrderQuote(orderUid, crossChainOrder.statusResult)
      addOrderToSurplusQueue(orderUid)
      // TODO: play MOOO sound
    }
  }, [crossChainOrder, updateBridgeOrderQuote, addOrderToSurplusQueue])

  return null
}

export function PendingBridgeOrdersUpdater(): ReactNode {
  const { chainId } = useWalletInfo()
  const bridgeOrders = useBridgeOrders()

  if (!bridgeOrders) return null

  const pendingBridgeOrders = bridgeOrders.filter((order) =>
    order.statusResult ? !BRIDGING_FINAL_STATUSES.includes(order.statusResult.status) : true,
  )

  return (
    <>
      {pendingBridgeOrders.map((order) => (
        <PendingOrderUpdater key={order.orderUid} chainId={chainId} orderUid={order.orderUid} />
      ))}
    </>
  )
}
