import { Order } from 'legacy/state/orders/actions'

/**
 * Syntactic sugar to get the order's executed amounts as a BigNumber (in atoms)
 * Mostly because `executedSellAmount` is derived from 2 fields (at time or writing)
 *
 * @param order The order
 */
export function getOrderExecutedAmounts(order: Order): {
  executedBuyAmount: bigint
  executedSellAmount: bigint
} {
  const { apiAdditionalInfo } = order

  if (!apiAdditionalInfo) {
    return {
      executedBuyAmount: 0n,
      executedSellAmount: 0n,
    }
  }

  const { executedBuyAmount, executedSellAmountBeforeFees } = apiAdditionalInfo

  return {
    executedBuyAmount: BigInt(executedBuyAmount),
    executedSellAmount: BigInt(executedSellAmountBeforeFees),
  }
}
