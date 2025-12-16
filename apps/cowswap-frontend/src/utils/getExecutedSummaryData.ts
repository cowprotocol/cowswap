import { isSellOrder } from '@cowprotocol/common-utils'
import { Nullish } from '@cowprotocol/types'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { BigNumber } from 'bignumber.js'

import { GenericOrder } from 'common/types'
import { getFilledAmounts } from 'utils/orderUtils/getFilledAmounts'

import { isParsedOrder, parseOrder } from './orderUtils/parseOrder'

export interface ExecutedSummaryData {
  surplusAmount: CurrencyAmount<Token>
  surplusPercent: string | undefined
  surplusToken: Token
  formattedFilledAmount: CurrencyAmount<Token>
  formattedSwappedAmount: CurrencyAmount<Token>
  swappedAmountWithFee: BigNumber
}

export function getExecutedSummaryData(order: GenericOrder, intermediateToken: Nullish<Token>): ExecutedSummaryData {
  const surplusToken = isSellOrder(order.kind) ? intermediateToken || order.outputToken : order.inputToken

  const parsedOrder = isParsedOrder(order) ? order : parseOrder(order)

  const { surplusAmount: amount, surplusPercentage: percentage } = parsedOrder.executionData

  // Guard against missing surplus by falling back to '0' raw amount
  const rawSurplus = amount ? amount.decimalPlaces(0, BigNumber.ROUND_DOWN).toFixed(0) : '0'
  const surplusPercent = percentage?.multipliedBy(100)?.toFixed(2)

  const surplusAmount = CurrencyAmount.fromRawAmount(surplusToken, rawSurplus)

  const { formattedFilledAmount, formattedSwappedAmount, swappedAmountWithFee } = getFilledAmounts({
    ...parsedOrder,
    inputToken: order.inputToken,
    outputToken: surplusToken,
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
