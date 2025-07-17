import { ReactNode, useEffect } from 'react'

import { BridgeStatus, SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useCrossChainOrder, usePendingBridgeOrders, useUpdateBridgeOrderQuote } from 'entities/bridgeOrders'
import { useAddOrderToSurplusQueue } from 'entities/surplusModal'

import { getCowSoundError, getCowSoundSuccess } from 'modules/sounds'

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
    const orderStatus = crossChainOrder.statusResult.status
    const isOrderExecuted = orderStatus === BridgeStatus.EXECUTED
    const isOrderFailed = orderStatus === BridgeStatus.REFUND || orderStatus === BridgeStatus.EXPIRED

    if (isOrderExecuted) {
      updateBridgeOrderQuote(orderUid, crossChainOrder.statusResult)
      addOrderToSurplusQueue(orderUid)
      getCowSoundSuccess().play().then()
    } else if (isOrderFailed) {
      getCowSoundError().play().then()
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
