import { Currency, CurrencyAmount, Price } from '@uniswap/sdk-core'

import BigNumber from 'bignumber.js'
import JSBI from 'jsbi'

import { Order, OrderStatus } from 'legacy/state/orders/actions'

import { getOrderExecutedAmounts } from './getOrderExecutedAmounts'
import { getOrderFilledAmount } from './getOrderFilledAmount'
import { getOrderSurplus } from './getOrderSurplus'
import { isOrderFilled } from './isOrderFilled'
import { isPartiallyFilled } from './isPartiallyFilled'

export interface ParsedOrder extends Order {
  executedBuyAmount: JSBI
  executedSellAmount: JSBI
  expirationTime: Date
  fullyFilled: boolean
  partiallyFilled: boolean
  filledAmount: BigNumber
  filledPercentage: BigNumber
  surplusAmount: BigNumber
  surplusPercentage: BigNumber
  executedFeeAmount: string | undefined
  executedSurplusFee: string | null
  formattedPercentage: number
  parsedCreationTime: Date
  executedPrice: Price<Currency, Currency> | null
  activityId: string | undefined
  activityTitle: string
}

export const parseOrder = (order: Order): ParsedOrder => {
  const { amount: filledAmount, percentage: filledPercentage } = getOrderFilledAmount(order)
  const { amount: surplusAmount, percentage: surplusPercentage } = getOrderSurplus(order)
  const { executedBuyAmount, executedSellAmount } = getOrderExecutedAmounts(order)
  const expirationTime = new Date(Number(order.validTo) * 1000)
  const executedFeeAmount = order.apiAdditionalInfo?.executedFeeAmount
  const executedSurplusFee = order.apiAdditionalInfo?.executedSurplusFee || null
  const parsedCreationTime = new Date(order.creationTime)
  const fullyFilled = isOrderFilled(order)
  const partiallyFilled = isPartiallyFilled(order)
  const formattedPercentage = filledPercentage.times(100).decimalPlaces(2).toNumber()
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

  return {
    ...order,
    expirationTime,
    executedBuyAmount,
    executedSellAmount,
    filledAmount,
    filledPercentage,
    formattedPercentage,
    surplusAmount,
    surplusPercentage,
    executedFeeAmount,
    executedSurplusFee,
    executedPrice,
    parsedCreationTime,
    fullyFilled,
    partiallyFilled,
    activityId,
    activityTitle,
  }
}
