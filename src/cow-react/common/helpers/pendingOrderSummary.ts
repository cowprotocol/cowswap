import { Order, OrderKind } from 'state/orders/actions'
import { formatSmartAmount } from 'utils/format'
import { CurrencyAmount } from '@uniswap/sdk-core'

export function pendingOrderSummary(order: Order): string {
  const { kind, buyAmount, sellAmount, inputToken, outputToken, feeAmount } = order

  const inputPrefix = kind === OrderKind.BUY ? 'at most ' : ''
  const outputPrefix = kind === OrderKind.SELL ? 'at least ' : ''

  const inputAmount = CurrencyAmount.fromRawAmount(inputToken, sellAmount.toString()).add(
    CurrencyAmount.fromRawAmount(inputToken, feeAmount.toString())
  )
  const outputAmount = CurrencyAmount.fromRawAmount(outputToken, buyAmount.toString())

  return `Swap ${inputPrefix}${formatSmartAmount(inputAmount)} ${
    inputAmount.currency.symbol
  } for ${outputPrefix}${formatSmartAmount(outputAmount)} ${outputAmount.currency.symbol}`
}
