import { TokensByAddress } from '@cowprotocol/tokens'

import { Order, OrderStatus } from 'legacy/state/orders/actions'

import { computeOrderSummary } from 'common/updaters/orders/utils'

import { emulateTwapAsOrder } from './emulateTwapAsOrder'

import { TwapOrderItem, TwapOrderStatus } from '../types'

const statusesMap: Record<TwapOrderStatus, OrderStatus> = {
  [TwapOrderStatus.Cancelled]: OrderStatus.CANCELLED,
  [TwapOrderStatus.Expired]: OrderStatus.EXPIRED,
  [TwapOrderStatus.Pending]: OrderStatus.PENDING,
  [TwapOrderStatus.WaitSigning]: OrderStatus.PRESIGNATURE_PENDING,
  [TwapOrderStatus.Fulfilled]: OrderStatus.FULFILLED,
  [TwapOrderStatus.Cancelling]: OrderStatus.PENDING,
}

export function mapTwapOrderToStoreOrder(order: TwapOrderItem, tokensByAddress: TokensByAddress): Order | undefined {
  const enrichedOrder = emulateTwapAsOrder(order)
  const status = statusesMap[order.status]

  const inputToken = tokensByAddress[enrichedOrder.sellToken.toLowerCase()]
  const outputToken = tokensByAddress[enrichedOrder.buyToken.toLowerCase()]

  if (!inputToken || !outputToken) {
    // FIXME: this is a hack to prevent errors, we should ensure this doesn't happen
    console.error('mapTwapOrderToStoreOrder: inputToken or outputToken not found', { inputToken, outputToken })
    return undefined
  }

  const storeOrder: Order = {
    ...enrichedOrder,
    id: enrichedOrder.uid,
    composableCowInfo: {
      id: order.id,
    },
    sellAmountBeforeFee: enrichedOrder.sellAmount,
    inputToken,
    outputToken,
    creationTime: enrichedOrder.creationDate,
    summary: '',
    status,
    apiAdditionalInfo: enrichedOrder,
    isCancelling: order.status === TwapOrderStatus.Cancelling,
  }

  const summary = computeOrderSummary({ orderFromStore: storeOrder, orderFromApi: enrichedOrder })

  storeOrder.summary = summary || ''

  return storeOrder
}
