import { isSellOrder } from '@cowprotocol/common-utils'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { Order } from 'legacy/state/orders/actions'

import { getFilledAmounts } from 'utils/orderUtils/getFilledAmounts'

import { isParsedOrder, ParsedOrder, parseOrder } from './orderUtils/parseOrder'

export function getExecutedSummaryData(order: Order | ParsedOrder) {
  const parsedOrder = isParsedOrder(order) ? order : parseOrder(order)

  const { inputToken, outputToken } = parsedOrder
  const { surplusAmount: amount, surplusPercentage: percentage } = parsedOrder.executionData

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

  const surplusToken = isSellOrder(order.kind) ? parsedOutputToken : parsedInputToken

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
