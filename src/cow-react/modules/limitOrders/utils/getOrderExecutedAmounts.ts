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
  const { apiAdditionalInfo } = order

  if (!apiAdditionalInfo) {
    return {
      executedBuyAmount: JSBI.BigInt(0),
      executedSellAmount: JSBI.BigInt(0),
    }
  }

  const { executedBuyAmount, executedSellAmount, executedFeeAmount } = apiAdditionalInfo

  return {
    executedBuyAmount: JSBI.BigInt(executedBuyAmount),
    executedSellAmount: JSBI.subtract(JSBI.BigInt(executedSellAmount), JSBI.BigInt(executedFeeAmount)),
  }
}
