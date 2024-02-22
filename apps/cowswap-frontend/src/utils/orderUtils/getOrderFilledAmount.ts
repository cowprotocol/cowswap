import { ZERO_BIG_NUMBER } from '@cowprotocol/common-const'
import { isSellOrder } from '@cowprotocol/common-utils'

import BigNumber from 'bignumber.js'

import { Order } from 'legacy/state/orders/actions'

/**
 * Get order filled amount, both as raw amount (in atoms) and as percentage (from 0 to 1)
 *
 * @param order The order
 */

interface FilledAmountResult {
  amount: BigNumber
  percentage: BigNumber
}

export function getOrderFilledAmount(order: Order): FilledAmountResult {
  let executedAmount, totalAmount

  if (!order.apiAdditionalInfo) {
    return { amount: ZERO_BIG_NUMBER, percentage: ZERO_BIG_NUMBER }
  }

  if (isSellOrder(order.kind)) {
    executedAmount = new BigNumber(order.apiAdditionalInfo.executedSellAmount).minus(
      order.apiAdditionalInfo?.executedFeeAmount
    )
    totalAmount = new BigNumber(order.sellAmount.toString())
  } else {
    executedAmount = new BigNumber(order.apiAdditionalInfo.executedBuyAmount)
    totalAmount = new BigNumber(order.buyAmount.toString())
  }

  return { amount: executedAmount, percentage: executedAmount.div(totalAmount) }
}
