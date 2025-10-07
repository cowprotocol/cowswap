import { isSellOrder } from '@cowprotocol/common-utils'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { BigNumber } from 'bignumber.js'

import { Order } from 'legacy/state/orders/actions'

import { GenericOrder } from 'common/types'
import { getFilledAmounts } from 'utils/orderUtils/getFilledAmounts'

import { isParsedOrder, ParsedOrder, parseOrder } from './orderUtils/parseOrder'

export interface ExecutedSummaryData {
  surplusAmount: CurrencyAmount<Token>
  surplusPercent: string | undefined
  surplusToken: Token
  formattedFilledAmount: CurrencyAmount<Token>
  formattedSwappedAmount: CurrencyAmount<Token>
  swappedAmountWithFee: BigNumber
}

export function getExecutedSummaryData(order: GenericOrder): ExecutedSummaryData {
  const { inputToken, outputToken } = order

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
  return getExecutedSummaryDataWithSurplusToken(order, surplusToken)
}

export function getExecutedSummaryDataWithSurplusToken(
  order: Order | ParsedOrder,
  surplusToken: Token,
): ExecutedSummaryData {
  const parsedOrder = isParsedOrder(order) ? order : parseOrder(order)
  const { inputToken, outputToken } = parsedOrder

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

  const { surplusAmount: amount, surplusPercentage: percentage } = parsedOrder.executionData

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
