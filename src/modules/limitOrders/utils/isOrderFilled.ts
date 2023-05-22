import { Order, OrderStatus } from 'legacy/state/orders/actions'
import { BigNumber } from 'bignumber.js'

const ONE_BIG_NUMBER = new BigNumber(1)
const FILLED_ORDER_EPSILON = new BigNumber('0.0001')

export function isOrderFilled(order: Order): boolean {
  if (order.status === OrderStatus.PENDING) {
    return false
  }

  let amount, executedAmount
  const { apiAdditionalInfo } = order

  if (!apiAdditionalInfo) {
    return false
  }

  if (order.kind === 'buy') {
    amount = new BigNumber(order.buyAmount.toString())
    executedAmount = new BigNumber(apiAdditionalInfo.executedBuyAmount)
  } else {
    amount = new BigNumber(order.sellAmount.toString())
    executedAmount = new BigNumber(apiAdditionalInfo.executedSellAmount).minus(apiAdditionalInfo.executedFeeAmount)
  }

  const minimumAmount = amount.multipliedBy(ONE_BIG_NUMBER.minus(FILLED_ORDER_EPSILON))

  return executedAmount.gte(minimumAmount)
}
