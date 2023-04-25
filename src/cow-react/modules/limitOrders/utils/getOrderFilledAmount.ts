import BigNumber from 'bignumber.js'
import { Order } from 'state/orders/actions'
import { ZERO_BIG_NUMBER } from 'constants/index'

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

  if (order.kind === 'buy') {
    executedAmount = new BigNumber(order.apiAdditionalInfo.executedBuyAmount)
    totalAmount = new BigNumber(order.buyAmount.toString())
  } else {
    executedAmount = new BigNumber(order.apiAdditionalInfo.executedSellAmount).minus(
      order.apiAdditionalInfo?.executedFeeAmount
    )
    totalAmount = new BigNumber(order.sellAmount.toString())
  }

  return { amount: executedAmount, percentage: executedAmount.div(totalAmount) }
}
