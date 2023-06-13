import JSBI from 'jsbi'

import { Order } from 'legacy/state/orders/actions'

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

  const { executedBuyAmount, executedSellAmountBeforeFees } = apiAdditionalInfo

  return {
    executedBuyAmount: JSBI.BigInt(executedBuyAmount),
    executedSellAmount: JSBI.BigInt(executedSellAmountBeforeFees),
  }
}
