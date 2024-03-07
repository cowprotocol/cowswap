import { OrderClass, OrderKind, SigningScheme } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount, Price, Token } from '@uniswap/sdk-core'

import BigNumber from 'bignumber.js'
import JSBI from 'jsbi'

import { Order, OrderStatus } from 'legacy/state/orders/actions'

import { ComposableCowInfo } from 'common/types'

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
  owner: string
  isCancelling: boolean | undefined
  receiver: string | undefined
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
  composableCowInfo?: ComposableCowInfo
  fullAppData: Order['fullAppData']
  signingScheme: SigningScheme

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
    owner: order.owner,
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
    composableCowInfo: order.composableCowInfo,
    receiver: order.receiver || undefined,
    creationTime,
    expirationTime,
    fullAppData: order.fullAppData,
    executionData,
    signingScheme: order.signingScheme,
  }
}

export function isParsedOrder(order: Order | ParsedOrder): order is ParsedOrder {
  return !!(order as ParsedOrder).executionData
}

export function isOffchainOrder(order: Order | ParsedOrder): boolean {
  return order.signingScheme === SigningScheme.EIP712
}
