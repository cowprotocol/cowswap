import { EnrichedOrder, OrderClass, OrderKind, SigningScheme, OrderStatus } from '@cowprotocol/cow-sdk'

import { TokensByAddress } from 'modules/tokensList/state/tokensListAtom'

import { TwapOrderItem, TWAPOrderStatus } from '../types'

// TODO: add FULFILLED status
const statusMap: Record<TWAPOrderStatus, OrderStatus> = {
  [TWAPOrderStatus.Pending]: OrderStatus.OPEN,
  [TWAPOrderStatus.Scheduled]: OrderStatus.OPEN,
  [TWAPOrderStatus.WaitSigning]: OrderStatus.PRESIGNATURE_PENDING,
  [TWAPOrderStatus.Cancelled]: OrderStatus.CANCELLED,
  [TWAPOrderStatus.Expired]: OrderStatus.EXPIRED,
}

export function emulateTwapAsDiscreteOrder(tokens: TokensByAddress, item: TwapOrderItem): EnrichedOrder {
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
