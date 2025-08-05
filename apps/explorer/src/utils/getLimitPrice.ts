import { formatCalculatedPriceToDisplay } from './format'
import { getOrderLimitPrice } from './operator'

import { Order } from '../api/operator'

export function getLimitPrice(
  order: Pick<Order, 'buyToken' | 'sellToken' | 'buyAmount' | 'sellAmount'>,
  isPriceInverted: boolean,
): string {
  if (!order.buyToken || !order.sellToken) return '-'

  const calculatedPrice = getOrderLimitPrice({
    buyAmount: order.buyAmount,
    sellAmount: order.sellAmount,
    buyTokenDecimals: order.buyToken.decimals,
    sellTokenDecimals: order.sellToken.decimals,
    inverted: isPriceInverted,
  })

  return formatCalculatedPriceToDisplay(calculatedPrice, order.buyToken, order.sellToken, isPriceInverted)
}
