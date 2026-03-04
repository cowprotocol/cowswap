import { isSellOrder } from '@cowprotocol/common-utils'

import { Order, OrderStatus } from 'legacy/state/orders/actions'

import { isParsedOrder, ParsedOrder } from './parseOrder'

const CANT_BE_PARTIALLY_FILLED_STATUSES = [OrderStatus.FULFILLED, OrderStatus.PENDING]

export function isPartiallyFilled(order: Order | ParsedOrder): boolean {
  if (CANT_BE_PARTIALLY_FILLED_STATUSES.includes(order.status)) {
    return false
  }

  const apiAdditionalInfo = isParsedOrder(order) ? order.executionData : order.apiAdditionalInfo

  if (!apiAdditionalInfo) {
    return false
  }

  const { executedSellAmount, executedBuyAmount } = apiAdditionalInfo

  // todo check
  return isSellOrder(order.kind) ? BigInt(executedSellAmount) > 0n : BigInt(executedBuyAmount) > 0n
}
