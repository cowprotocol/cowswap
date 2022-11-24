import { Order } from 'state/orders/actions'
import JSBI from 'jsbi'

/**
 * Syntactic sugar to get the order's executed amounts as a BigNumber (in atoms)
 * Mostly because `executedSellAmount` is derived from 2 fields (at time or writing)
 *
 * @param order The order
 */
export function getOrderExecutedAmounts(order: Order): {
  executedBuyAmount: JSBI
  executedSellAmount: JSBI
} {
  if (!order.apiAdditionalInfo) {
    return {
      executedBuyAmount: JSBI.BigInt(0),
      executedSellAmount: JSBI.BigInt(0),
    }
  }

  return {
    executedBuyAmount: JSBI.BigInt(order.apiAdditionalInfo.executedBuyAmount),
    executedSellAmount: JSBI.subtract(
      JSBI.BigInt(order.apiAdditionalInfo.executedSellAmount),
      JSBI.BigInt(order.apiAdditionalInfo.executedFeeAmount)
    ),
  }
}
