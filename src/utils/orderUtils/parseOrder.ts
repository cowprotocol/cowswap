import { OrderClass, OrderKind } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount, Price, Token } from '@uniswap/sdk-core'

import BigNumber from 'bignumber.js'
import JSBI from 'jsbi'

import { Order, OrderStatus } from 'legacy/state/orders/actions'

import { getOrderExecutedAmounts } from './getOrderExecutedAmounts'
import { getOrderFilledAmount } from './getOrderFilledAmount'
import { getOrderSurplus } from './getOrderSurplus'
import { isOrderFilled } from './isOrderFilled'
import { isPartiallyFilled } from './isPartiallyFilled'

export interface ParsedOrderExecutionData {
  executedBuyAmount: JSBI
  executedSellAmount: JSBI
  fullyFilled: boolean
  partiallyFilled: boolean
  filledAmount: BigNumber
  filledPercentage: BigNumber
  surplusAmount: BigNumber
  surplusPercentage: BigNumber
  executedFeeAmount: string | undefined
  executedSurplusFee: string | null
  filledPercentDisplay: number
  executedPrice: Price<Currency, Currency> | null
  activityId: string | undefined
  activityTitle: string
}

export interface ParsedOrder {
  id: string
  isCancelling: boolean | undefined
  inputToken: Token
  outputToken: Token
  kind: OrderKind
  sellAmount: string
  buyAmount: string
  feeAmount: string
  class: OrderClass
  status: OrderStatus
  partiallyFillable: boolean
  creationTime: Date
  expirationTime: Date

  executionData: ParsedOrderExecutionData
}

export const parseOrder = (order: Order): ParsedOrder => {
  const { amount: filledAmount, percentage: filledPercentage } = getOrderFilledAmount(order)
  const { amount: surplusAmount, percentage: surplusPercentage } = getOrderSurplus(order)
  const { executedBuyAmount, executedSellAmount } = getOrderExecutedAmounts(order)
  const expirationTime = new Date(Number(order.validTo) * 1000)
  const executedFeeAmount = order.apiAdditionalInfo?.executedFeeAmount
  const executedSurplusFee = order.apiAdditionalInfo?.executedSurplusFee || null
  const creationTime = new Date(order.creationTime)
  const fullyFilled = isOrderFilled(order)
  const partiallyFilled = isPartiallyFilled(order)
  const filledPercentDisplay = filledPercentage.times(100).decimalPlaces(2).toNumber()
  const executedPrice = JSBI.greaterThan(executedBuyAmount, JSBI.BigInt(0))
    ? new Price({
        baseAmount: CurrencyAmount.fromRawAmount(order.inputToken, executedSellAmount),
        quoteAmount: CurrencyAmount.fromRawAmount(order.outputToken, executedBuyAmount),
      })
    : null
  const showCreationTxLink =
    (order.status === OrderStatus.CREATING || order.status === OrderStatus.FAILED) &&
    order.orderCreationHash &&
    !order.apiAdditionalInfo
  const activityId = showCreationTxLink ? order.orderCreationHash : order.id
  const activityTitle = showCreationTxLink ? 'Creation transaction' : 'Order ID'

  const executionData: ParsedOrderExecutionData = {
    executedBuyAmount,
    executedSellAmount,
    filledAmount,
    filledPercentage,
    filledPercentDisplay,
    surplusAmount,
    surplusPercentage,
    executedFeeAmount,
    executedSurplusFee,
    executedPrice,
    fullyFilled,
    partiallyFilled,
    activityId,
    activityTitle,
  }

  return {
    id: order.id,
    isCancelling: order.isCancelling,
    inputToken: order.inputToken,
    outputToken: order.outputToken,
    kind: order.kind,
    sellAmount: order.sellAmount,
    buyAmount: order.buyAmount,
    feeAmount: order.feeAmount,
    class: order.class,
    status: order.status,
    partiallyFillable: order.partiallyFillable,
    creationTime,
    expirationTime,
    executionData,
  }
}
