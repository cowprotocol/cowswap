import { TokensByAddress } from '@cowprotocol/tokens'

import { Order, OrderStatus } from 'legacy/state/orders/actions'

import { TwapOrderItem, TwapOrderStatus } from 'modules/twap/types'

import { emulateTwapAsOrder } from './emulateTwapAsOrder'

const statusesMap: Record<TwapOrderStatus, OrderStatus> = {
  [TwapOrderStatus.Cancelled]: OrderStatus.CANCELLED,
  [TwapOrderStatus.Expired]: OrderStatus.EXPIRED,
  [TwapOrderStatus.Pending]: OrderStatus.PENDING,
  [TwapOrderStatus.WaitSigning]: OrderStatus.PRESIGNATURE_PENDING,
  [TwapOrderStatus.Fulfilled]: OrderStatus.FULFILLED,
  [TwapOrderStatus.Cancelling]: OrderStatus.PENDING,
}

export function mapTwapOrderToStoreOrder(order: TwapOrderItem, tokensByAddress: TokensByAddress): Order | null {
  const enrichedOrder = emulateTwapAsOrder(order)
  const status = statusesMap[order.status]
  const inputToken = tokensByAddress[enrichedOrder.sellToken.toLowerCase()]
  const outputToken = tokensByAddress[enrichedOrder.buyToken.toLowerCase()]

  if (!inputToken || !outputToken) return null

  return {
    ...enrichedOrder,
    id: enrichedOrder.uid,
    composableCowInfo: {
      id: order.id,
    },
    sellAmountBeforeFee: enrichedOrder.sellAmount,
    inputToken,
    outputToken,
    creationTime: enrichedOrder.creationDate,
    status,
    apiAdditionalInfo: enrichedOrder,
    isCancelling: order.status === TwapOrderStatus.Cancelling,
  }
}
