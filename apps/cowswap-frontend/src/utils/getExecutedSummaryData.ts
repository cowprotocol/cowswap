import { isSellOrder } from '@cowprotocol/common-utils'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { Order } from 'legacy/state/orders/actions'

import { getFilledAmounts } from 'utils/orderUtils/getFilledAmounts'

import { isParsedOrder, ParsedOrder, parseOrder } from './orderUtils/parseOrder'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function getExecutedSummaryData(order: Order | ParsedOrder) {
  const parsedOrder = isParsedOrder(order) ? order : parseOrder(order)

  const { inputToken, outputToken } = parsedOrder
  const { surplusAmount: amount, surplusPercentage: percentage } = parsedOrder.executionData

  const parsedInputToken = new Token(
    inputToken.chainId,
    inputToken.address,
    inputToken.decimals,
    inputToken.symbol,
    inputToken.name,
  )
  const parsedOutputToken = new Token(
    outputToken.chainId,
    outputToken.address,
    outputToken.decimals,
    outputToken.symbol,
    outputToken.name,
  )

  const surplusToken = isSellOrder(order.kind) ? parsedOutputToken : parsedInputToken

  const surplusAmount = CurrencyAmount.fromRawAmount(surplusToken, amount?.decimalPlaces(0).toFixed())
  const surplusPercent = percentage?.multipliedBy(100)?.toFixed(2)

  const { formattedFilledAmount, formattedSwappedAmount, swappedAmountWithFee } = getFilledAmounts({
    ...parsedOrder,
    inputToken: parsedInputToken,
    outputToken: parsedOutputToken,
  })

  return {
    surplusAmount,
    surplusPercent,
    surplusToken,
    formattedFilledAmount,
    formattedSwappedAmount,
    swappedAmountWithFee,
  }
}
