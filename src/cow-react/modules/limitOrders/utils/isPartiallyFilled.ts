import { Order, OrderStatus } from 'state/orders/actions'
import { OrderKind } from '@cowprotocol/cow-sdk'

const CANT_BE_PARTIALLY_FILLED_STATUSES = [OrderStatus.FULFILLED, OrderStatus.PENDING]

export function isPartiallyFilled(order: Order): boolean {
  if (CANT_BE_PARTIALLY_FILLED_STATUSES.includes(order.status)) {
    return false
  }

  const { apiAdditionalInfo, kind } = order

  if (!apiAdditionalInfo) {
    return false
  }

  const { executedSellAmountBeforeFees, executedBuyAmount } = apiAdditionalInfo

  if (kind === OrderKind.SELL) {
    return +executedSellAmountBeforeFees > 0
  } else {
    return +executedBuyAmount > 0
  }
}
