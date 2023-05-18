import { Order } from 'state/orders/actions'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { parseOrder } from 'modules/limitOrders/containers/OrdersWidget/hooks/useLimitOrdersList'
import { getFilledAmounts } from 'modules/limitOrders/utils/getFilledAmounts'

export function getExecutedSummaryData(order: Order) {
  const parsedOrder = parseOrder(order)

  const { inputToken, outputToken, surplusAmount: amount, surplusPercentage: percentage } = parsedOrder

  const parsedInputToken = new Token(
    inputToken.chainId,
    inputToken.address,
    inputToken.decimals,
    inputToken.symbol,
    inputToken.name
  )
  const parsedOutputToken = new Token(
    outputToken.chainId,
    outputToken.address,
    outputToken.decimals,
    outputToken.symbol,
    outputToken.name
  )

  const surplusToken = order.kind === OrderKind.SELL ? parsedOutputToken : parsedInputToken

  const surplusAmount = CurrencyAmount.fromRawAmount(surplusToken, amount?.decimalPlaces(0).toFixed())
  const suprlusPercent = percentage?.multipliedBy(100)?.toFixed(2)

  const { formattedFilledAmount, formattedSwappedAmount } = getFilledAmounts({
    ...parsedOrder,
    inputToken: parsedInputToken,
    outputToken: parsedOutputToken,
  })

  return {
    surplusAmount,
    suprlusPercent,
    surplusToken,
    formattedFilledAmount,
    formattedSwappedAmount,
  }
}
