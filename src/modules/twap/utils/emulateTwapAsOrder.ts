import { EnrichedOrder, OrderClass, OrderKind, SigningScheme, OrderStatus } from '@cowprotocol/cow-sdk'

import { TokensByAddress } from 'modules/tokensList/state/tokensListAtom'

import { TwapOrderItem, TwapOrderStatus } from '../types'

// TODO: add FULFILLED status
const statusMap: Record<TwapOrderStatus, OrderStatus> = {
  [TwapOrderStatus.Pending]: OrderStatus.OPEN,
  [TwapOrderStatus.Scheduled]: OrderStatus.OPEN,
  [TwapOrderStatus.WaitSigning]: OrderStatus.PRESIGNATURE_PENDING,
  [TwapOrderStatus.Cancelled]: OrderStatus.CANCELLED,
  [TwapOrderStatus.Expired]: OrderStatus.EXPIRED,
}

export function emulateTwapAsOrder(tokens: TokensByAddress, item: TwapOrderItem): EnrichedOrder {
  const { safeAddress, hash, status } = item
  const { sellToken, buyToken, partSellAmount, minPartLimit, n, t } = item.order
  const numOfParts = BigInt(n)
  const sellAmount = BigInt(partSellAmount) * numOfParts
  const buyAmount = BigInt(minPartLimit) * numOfParts

  const creationTime = new Date(item.submissionDate)
  const expirationTime = new Date(creationTime.getTime() + t * n * 1000)

  return {
    signingScheme: SigningScheme.EIP1271,
    status: statusMap[status],
    sellToken,
    buyToken,
    validTo: Math.ceil(expirationTime.getTime() / 1000),
    uid: hash,
    sellAmount: sellAmount.toString(),
    buyAmount: buyAmount.toString(),
    kind: OrderKind.SELL,
    partiallyFillable: true,
    creationDate: creationTime.toISOString(),
    class: OrderClass.LIMIT,
    owner: safeAddress,
    // TODO: fulfill data
    signature: '',
    appData: '',
    totalFee: '0',
    feeAmount: '0',
    executedSellAmount: '0',
    executedSellAmountBeforeFees: '0',
    executedBuyAmount: '0',
    executedFeeAmount: '0',
    invalidated: false,
  }
}
