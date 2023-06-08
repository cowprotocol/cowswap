import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { ParsedOrder } from './parseOrder'

export function getSellAmountWithFee(order: ParsedOrder): CurrencyAmount<Token> {
  const feeAmountParsed = CurrencyAmount.fromRawAmount(order.inputToken, order.feeAmount.toString())
  const sellAmountParsed = CurrencyAmount.fromRawAmount(order.inputToken, order.sellAmount.toString())
  return sellAmountParsed.add(feeAmountParsed)
}
