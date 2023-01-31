import { Order, OrderKind } from 'state/orders/actions'
import { formatSmartAmount } from '@cow/utils/format'
import { CurrencyAmount } from '@uniswap/sdk-core'
import { formatSymbol } from '@cow/utils/format'

export function pendingOrderSummary(order: Order): string {
  const { kind, buyAmount, sellAmount, inputToken, outputToken, feeAmount } = order

  const inputPrefix = kind === OrderKind.BUY ? 'at most ' : ''
  const outputPrefix = kind === OrderKind.SELL ? 'at least ' : ''

  const inputAmount = CurrencyAmount.fromRawAmount(inputToken, sellAmount.toString()).add(
    CurrencyAmount.fromRawAmount(inputToken, feeAmount.toString())
  )
  const outputAmount = CurrencyAmount.fromRawAmount(outputToken, buyAmount.toString())

  return `Swap ${inputPrefix}${formatSmartAmount(inputAmount)} ${formatSymbol(
    inputAmount.currency.symbol
  )} for ${outputPrefix}${formatSmartAmount(outputAmount)} ${formatSymbol(outputAmount.currency.symbol)}`
}
