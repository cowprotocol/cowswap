import { Order } from 'state/orders/actions'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

export function getSellAmountWithFee(order: Order): CurrencyAmount<Token> {
  const feeAmountParsed = CurrencyAmount.fromRawAmount(order.inputToken, order.feeAmount.toString())
  const sellAmountParsed = CurrencyAmount.fromRawAmount(order.inputToken, order.sellAmount.toString())
  return sellAmountParsed.add(feeAmountParsed)
}
