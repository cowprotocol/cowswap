import { areAddressesEqual, isSellOrder } from '@cowprotocol/common-utils'
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
  const isSell = isSellOrder(parsedOrder.kind)

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

  // Guard against missing surplus by falling back to '0' raw amount
  const rawSurplus = amount ? amount.decimalPlaces(0).toFixed() : '0'
  const surplusPercent = percentage?.multipliedBy(100)?.toFixed(2)

  // Prefer the provided surplusToken (used to pass the intermediate token for bridge flows)
  // only when it is safe to do so:
  // - decimals must match the parsed output token (avoid mis-scaling)
  // - the order is a SELL and surplusToken differs from parsedOutputToken (bridge/intermediate case)
  const decimalsMatch = surplusToken.decimals === parsedOutputToken.decimals
  const isDifferentToken =
    !areAddressesEqual(surplusToken.address, parsedOutputToken.address) ||
    surplusToken.chainId !== parsedOutputToken.chainId
  const useSurplusForOutput = decimalsMatch && isSell && isDifferentToken
  const effectiveOutputToken = useSurplusForOutput ? surplusToken : parsedOutputToken
  const surplusAmount = CurrencyAmount.fromRawAmount(effectiveOutputToken, rawSurplus)

  const { formattedFilledAmount, formattedSwappedAmount, swappedAmountWithFee } = getFilledAmounts({
    ...parsedOrder,
    inputToken: parsedInputToken,
    outputToken: effectiveOutputToken,
  })

  return {
    surplusAmount,
    surplusPercent,
    surplusToken: effectiveOutputToken,
    formattedFilledAmount,
    formattedSwappedAmount,
    swappedAmountWithFee,
  }
}
