import { Order, OrderStatus } from 'legacy/state/orders/actions'
import { computeOrderSummary } from 'legacy/state/orders/updaters/utils'

import { TokensByAddress } from 'modules/tokensList/state/tokensListAtom'
import { getTokensByAddress } from 'modules/tokensList/utils/getTokensByAddress'

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

export function mapTwapOrderToStoreOrder(order: TwapOrderItem, tokensByAddress: TokensByAddress): Order {
  const enrichedOrder = emulateTwapAsOrder(order)
  const status = statusesMap[order.status]

  const storeOrder: Order = {
    ...enrichedOrder,
    id: enrichedOrder.uid,
    composableCowInfo: {
      id: order.id,
    },
    sellAmountBeforeFee: enrichedOrder.sellAmount,
    inputToken: getTokensByAddress(order.chainId, enrichedOrder.sellToken, tokensByAddress),
    outputToken: getTokensByAddress(order.chainId, enrichedOrder.buyToken, tokensByAddress),
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
