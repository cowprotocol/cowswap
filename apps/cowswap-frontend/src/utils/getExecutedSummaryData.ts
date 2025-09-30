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

  const { effectiveOutputToken, surplusDisplayToken } = resolveDisplayTokens({
    parsedOrder,
    parsedInputToken,
    parsedOutputToken,
    surplusToken,
  })
  const surplusAmount = CurrencyAmount.fromRawAmount(surplusDisplayToken, rawSurplus)

  const { formattedFilledAmount, formattedSwappedAmount, swappedAmountWithFee } = getFilledAmounts({
    ...parsedOrder,
    inputToken: parsedInputToken,
    outputToken: effectiveOutputToken,
  })

  return {
    surplusAmount,
    surplusPercent,
    surplusToken: surplusDisplayToken,
    formattedFilledAmount,
    formattedSwappedAmount,
    swappedAmountWithFee,
  }
}

interface ResolveDisplayTokensParams {
  parsedOrder: ParsedOrder
  parsedInputToken: Token
  parsedOutputToken: Token
  surplusToken: Token
}

function resolveDisplayTokens({
  parsedOrder,
  parsedInputToken,
  parsedOutputToken,
  surplusToken,
}: ResolveDisplayTokensParams): { effectiveOutputToken: Token; surplusDisplayToken: Token } {
  const isSell = isSellOrder(parsedOrder.kind)
  const defaultSurplusToken = isSell ? parsedOutputToken : parsedInputToken

  if (!isSell) {
    return {
      effectiveOutputToken: parsedOutputToken,
      surplusDisplayToken: defaultSurplusToken,
    }
  }

  const decimalsAlignWithDefault = surplusToken.decimals === defaultSurplusToken.decimals
  const differsFromOutputToken =
    !areAddressesEqual(surplusToken.address, parsedOutputToken.address) ||
    surplusToken.chainId !== parsedOutputToken.chainId
  const differsFromDefaultToken =
    !areAddressesEqual(surplusToken.address, defaultSurplusToken.address) ||
    surplusToken.chainId !== defaultSurplusToken.chainId

  if (decimalsAlignWithDefault && differsFromOutputToken && differsFromDefaultToken) {
    return {
      effectiveOutputToken: surplusToken,
      surplusDisplayToken: surplusToken,
    }
  }

  return {
    effectiveOutputToken: parsedOutputToken,
    surplusDisplayToken: defaultSurplusToken,
  }
}
