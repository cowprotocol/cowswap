import { isSellOrder } from '@cowprotocol/common-utils'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { BigNumber } from 'bignumber.js'

import { Order } from 'legacy/state/orders/actions'

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

export function getExecutedSummaryData(order: Order | ParsedOrder): ExecutedSummaryData {
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

export function getExecutedSummaryDataWithSurplusToken(order: Order | ParsedOrder, surplusToken: Token): ExecutedSummaryData {
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

  // Prefer the provided surplusToken (used to pass the intermediate token for bridge flows)
  // only when it is safe to do so:
  // - decimals must match the parsed output token (avoid mis-scaling)
  // - and either the order is a BUY (destination amount displayed in output token),
  //   or surplusToken differs from parsedOutputToken (bridge/intermediate case)
  const decimalsMatch = surplusToken.decimals === parsedOutputToken.decimals
  const isBuy = !isSellOrder(parsedOrder.kind)
  const isDifferentToken =
    surplusToken.address.toLowerCase() !== parsedOutputToken.address.toLowerCase() ||
    surplusToken.chainId !== parsedOutputToken.chainId
  const useSurplusForOutput = decimalsMatch && (isBuy || isDifferentToken)
  const effectiveOutputToken = useSurplusForOutput ? surplusToken : parsedOutputToken

  const { formattedFilledAmount, formattedSwappedAmount, swappedAmountWithFee } = getFilledAmounts({
    ...parsedOrder,
    inputToken: parsedInputToken,
    outputToken: effectiveOutputToken,
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
