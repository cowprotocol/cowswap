import { ZERO_BIG_NUMBER } from '@cowprotocol/cow-js'
import BigNumber from 'bignumber.js'
import { Order } from 'state/orders/actions'

/**
 * Syntactic sugar to get the order's executed amounts as a BigNumber (in atoms)
 * Mostly because `executedSellAmount` is derived from 2 fields (at time or writing)
 *
 * @param order The order
 */
export function getOrderExecutedAmounts(order: Order): {
  executedBuyAmount: BigNumber
  executedSellAmount: BigNumber
} {
  if (!order.apiAdditionalInfo) {
    return {
      executedBuyAmount: ZERO_BIG_NUMBER,
      executedSellAmount: ZERO_BIG_NUMBER,
    }
  }

  return {
    executedBuyAmount: new BigNumber(order.apiAdditionalInfo.executedBuyAmount),
    executedSellAmount: new BigNumber(order.apiAdditionalInfo.executedSellAmount).minus(
      order.apiAdditionalInfo.executedFeeAmount
    ),
  }
}
