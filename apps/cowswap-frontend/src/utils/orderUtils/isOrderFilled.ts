import { isSellOrder } from '@cowprotocol/common-utils'

import { BigNumber } from 'bignumber.js'

import { Order, OrderStatus } from 'legacy/state/orders/actions'

import { isParsedOrder, ParsedOrder } from './parseOrder'

const ONE_BIG_NUMBER = new BigNumber(1)
const FILLED_ORDER_EPSILON = new BigNumber('0.0001')
const ZERO_BIG_NUMBER = new BigNumber(0)

export function isOrderFilled(order: Order | ParsedOrder): boolean {
  if (order.status === OrderStatus.PENDING) {
    return false
  }

  if (isParsedOrder(order)) {
    return order.executionData.fullyFilled
  }

  const executedAmount = getExecutedAmount(order)

  if (!executedAmount) {
    return false
  }

  const amount = new BigNumber(isSellOrder(order.kind) ? order.sellAmount.toString() : order.buyAmount.toString())

  const minimumAmount = amount.multipliedBy(ONE_BIG_NUMBER.minus(FILLED_ORDER_EPSILON))

  return executedAmount.gte(minimumAmount)
}

function getExecutedAmount(order: Order): BigNumber | null {
  if (!order.apiAdditionalInfo) {
    return null
  }

  if (isSellOrder(order.kind)) {
    return getExecutedSellAmount(order)
  }

  return new BigNumber(order.apiAdditionalInfo.executedBuyAmount.toString())
}

function getExecutedSellAmount(order: Order): BigNumber {
  const { executedFeeAmount, executedSellAmount, executedSellAmountBeforeFees } = order.apiAdditionalInfo || {}
  const executedSellAmountBeforeFeesBigNumber = new BigNumber(executedSellAmountBeforeFees || '0')

  if (executedSellAmountBeforeFeesBigNumber.gt(0)) {
    return executedSellAmountBeforeFeesBigNumber
  }

  const executedSellAmountBigNumber = new BigNumber(executedSellAmount || '0')
  const executedFeeAmountBigNumber = new BigNumber(executedFeeAmount || '0')

  return BigNumber.max(executedSellAmountBigNumber.minus(executedFeeAmountBigNumber), ZERO_BIG_NUMBER)
}
