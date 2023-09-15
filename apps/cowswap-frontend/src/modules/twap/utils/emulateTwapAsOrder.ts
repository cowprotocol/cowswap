import { EnrichedOrder, OrderClass, OrderKind, OrderStatus, SigningScheme } from '@cowprotocol/cow-sdk'

import { TwapOrderItem, TwapOrderStatus } from '../types'

const statusMap: Record<TwapOrderStatus, OrderStatus> = {
  [TwapOrderStatus.Pending]: OrderStatus.OPEN,
  [TwapOrderStatus.Cancelling]: OrderStatus.OPEN,
  [TwapOrderStatus.WaitSigning]: OrderStatus.PRESIGNATURE_PENDING,
  [TwapOrderStatus.Cancelled]: OrderStatus.CANCELLED,
  [TwapOrderStatus.Expired]: OrderStatus.EXPIRED,
  [TwapOrderStatus.Fulfilled]: OrderStatus.FULFILLED,
}

export function emulateTwapAsOrder(item: TwapOrderItem): EnrichedOrder {
  const { safeAddress, id, status, executionInfo } = item
  const { sellToken, buyToken, partSellAmount, minPartLimit, n, t, appData, receiver } = item.order
  const numOfParts = BigInt(n)
  const sellAmountValue = BigInt(partSellAmount) * numOfParts
  const buyAmount = BigInt(minPartLimit) * numOfParts

  const sellAmount = sellAmountValue.toString()

  const creationTime = new Date(item.executedDate || item.submissionDate)
  const expirationTime = new Date(creationTime.getTime() + t * n * 1000)
  const { executedSellAmount = '0', executedBuyAmount = '0', executedFeeAmount = '0' } = executionInfo?.info || {}

  return {
    signingScheme: SigningScheme.EIP1271,
    status: statusMap[status],
    sellToken,
    buyToken,
    validTo: Math.ceil(expirationTime.getTime() / 1000),
    uid: id,
    sellAmount,
    buyAmount: buyAmount.toString(),
    kind: OrderKind.SELL,
    partiallyFillable: true,
    creationDate: creationTime.toISOString(),
    class: OrderClass.LIMIT,
    owner: safeAddress,
    signature: '',
    appData,
    feeAmount: '0',
    totalFee: executedFeeAmount,
    executedSellAmount,
    executedSellAmountBeforeFees: executedSellAmount,
    executedBuyAmount,
    executedFeeAmount,
    invalidated: status === TwapOrderStatus.Cancelling,
    receiver,
  }
}
