import { EnrichedOrder, getAddressKey, OrderClass, OrderStatus, SigningScheme } from '@cowprotocol/cow-sdk'

import { TwapPartOrderItem } from '../state/twapPartOrdersAtom'
import { TwapOrderItem, TwapOrderStatus } from '../types'

export function emulatePartAsOrder(item: TwapPartOrderItem, parent: TwapOrderItem): EnrichedOrder {
  const creationDate = new Date((item.order.validTo - parent.order.t) * 1000)
  const isCancelling = parent.status === TwapOrderStatus.Cancelling
  const isConfirmedPart = item.index < parent.executionInfo.confirmedPartsCount
  const executedSellAmount = isConfirmedPart ? item.order.sellAmount : '0'
  const executedBuyAmount = isConfirmedPart ? item.order.buyAmount : '0'

  return {
    ...item.order,
    creationDate: creationDate.toISOString(),
    class: OrderClass.LIMIT,
    status: getOrderStatus(parent),
    owner: getAddressKey(parent.safeAddress),
    uid: item.uid,
    signingScheme: parent.isPrototype ? SigningScheme.EIP712 : SigningScheme.EIP1271,
    signature: '',
    appData: parent.order.appData,
    totalFee: '0',
    feeAmount: '0',
    executedSellAmount,
    executedSellAmountBeforeFees: executedSellAmount,
    executedBuyAmount,
    executedFeeAmount: '0',
    invalidated: isCancelling,
  }
}

function getOrderStatus(parent: TwapOrderItem): OrderStatus {
  if (parent.status === TwapOrderStatus.Fulfilled) return OrderStatus.FULFILLED
  if (parent.status === TwapOrderStatus.Expired) return OrderStatus.EXPIRED
  if (parent.status === TwapOrderStatus.Cancelled) return OrderStatus.CANCELLED

  return OrderStatus.OPEN
}
