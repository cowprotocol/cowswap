import { OrderKind } from '@cowprotocol/cow-sdk'

import { OrderStatus } from 'legacy/state/orders/actions'

import { GenericOrder } from 'common/types'
import { getOrderFilledAmount } from 'utils/orderUtils/getOrderFilledAmount'
import { isParsedOrder } from 'utils/orderUtils/parseOrder'

/**
 * Returns integer amount strings in token base units.
 * For expired partial-fill orders, both amounts scale by the unfilled sell or buy volume, including proportional legacy fees.
 * Input rounds down and output rounds up to avoid weakening the limit price.
 * Other orders retain their original amounts.
 */
export function getRecreatedOrderAmounts(order: GenericOrder): {
  inputCurrencyAmount: string
  outputCurrencyAmount: string
} {
  const sellAmount = BigInt(order.sellAmount)
  const buyAmount = BigInt(order.buyAmount)
  const totalSellAmount = sellAmount + BigInt(order.feeAmount ?? '0')
  const originalAmounts = {
    inputCurrencyAmount: totalSellAmount.toString(),
    outputCurrencyAmount: buyAmount.toString(),
  }

  if (order.status !== OrderStatus.EXPIRED || !order.partiallyFillable) return originalAmounts

  const totalAmount = order.kind === OrderKind.SELL ? sellAmount : buyAmount
  if (totalAmount <= 0n) return originalAmounts

  const filledAmount = BigInt(
    (isParsedOrder(order) ? order.executionData.filledAmount : getOrderFilledAmount(order).amount).toFixed(0),
  )
  const remainingAmount = totalAmount - filledAmount
  const remainder = remainingAmount < 0n ? 0n : remainingAmount > totalAmount ? totalAmount : remainingAmount

  return {
    inputCurrencyAmount: ((totalSellAmount * remainder) / totalAmount).toString(),
    outputCurrencyAmount: ((buyAmount * remainder + totalAmount - 1n) / totalAmount).toString(),
  }
}
