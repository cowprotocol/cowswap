// Util functions that only pertain to/deal with operator API related stuff
import BigNumber from 'bignumber.js'

import { calculatePrice, invertPrice, TokenErc20 } from '@gnosis.pm/dex-js'
import { OrderKind, Trade as TradeMetaData } from '@cowprotocol/cow-sdk'

import { FILLED_ORDER_EPSILON, ONE_BIG_NUMBER, ZERO_BIG_NUMBER } from 'const'

import { Order, OrderStatus, RawOrder, Trade } from 'api/operator/types'

import { formatSmartMaxPrecision, formattingAmountPrecision } from 'utils'
import { PENDING_ORDERS_BUFFER } from 'apps/explorer/const'

function isOrderFilled(order: RawOrder): boolean {
  const { kind, executedBuyAmount, sellAmount, executedSellAmount, buyAmount, executedFeeAmount } = order
  let amount, executedAmount

  if (kind === 'buy') {
    amount = new BigNumber(buyAmount)
    executedAmount = new BigNumber(executedBuyAmount)
  } else {
    amount = new BigNumber(sellAmount)
    executedAmount = new BigNumber(executedSellAmount).minus(executedFeeAmount)
  }

  const minimumAmount = amount.multipliedBy(ONE_BIG_NUMBER.minus(FILLED_ORDER_EPSILON))

  return executedAmount.gte(minimumAmount)
}

function isOrderExpired(order: RawOrder): boolean {
  return Math.floor(Date.now() / 1000) > order.validTo
}

function isOrderPartiallyFilled(order: RawOrder): boolean {
  if (isOrderFilled(order)) {
    return false
  }
  if (order.kind === 'buy') {
    return order.executedBuyAmount !== '0'
  } else {
    return order.executedSellAmount !== '0'
  }
}

function isOrderPresigning(order: RawOrder): boolean {
  return order.status === 'presignaturePending'
}

/**
 * An order is considered cancelled if the `invalidated` flag is `true` and
 * it has been at least `PENDING_ORDERS_BUFFER` since it has been created.
 * The buffer is used to take into account race conditions where a solver might
 * execute a transaction after the backend changed the order status.
 *
 * We assume the order is not fulfilled.
 */
function isOrderCancelled(order: Pick<RawOrder, 'creationDate' | 'invalidated'>): boolean {
  const creationTime = new Date(order.creationDate).getTime()
  return order.invalidated && Date.now() - creationTime > PENDING_ORDERS_BUFFER
}

function isOrderCancelling(order: RawOrder): boolean {
  return order.status === 'cancelled' && order.invalidated
}

export function getOrderStatus(order: RawOrder): OrderStatus {
  if (isOrderFilled(order)) {
    return 'filled'
  } else if (isOrderCancelled(order)) {
    return 'cancelled'
  } else if (isOrderExpired(order)) {
    return 'expired'
  } else if (isOrderPresigning(order)) {
    return 'signing'
  } else if (isOrderCancelling(order)) {
    return 'cancelling'
  } else {
    return 'open'
  }
}

/**
 * Get order filled amount, both as raw amount (in atoms) and as percentage (from 0 to 1)
 *
 * @param order The order
 */
export function getOrderFilledAmount(order: RawOrder): { amount: BigNumber; percentage: BigNumber } {
  const { kind, executedBuyAmount, buyAmount, executedSellAmount, sellAmount, executedFeeAmount } = order
  let executedAmount, totalAmount

  if (kind === 'buy') {
    executedAmount = new BigNumber(executedBuyAmount)
    totalAmount = new BigNumber(buyAmount)
  } else {
    executedAmount = new BigNumber(executedSellAmount).minus(executedFeeAmount)
    totalAmount = new BigNumber(sellAmount)
  }

  return { amount: executedAmount, percentage: executedAmount.div(totalAmount) }
}

export type Surplus = {
  amount: BigNumber
  percentage: BigNumber
}

/**
 * Calculates SELL surplus based on buy amounts
 *
 * @returns Sell surplus
 */
export function getSellSurplus(order: RawOrder): Surplus {
  const { partiallyFillable } = order

  const surplus = partiallyFillable ? _getPartialFillSellSurplus(order) : _getFillOrKillSellSurplus(order)

  return surplus || ZERO_SURPLUS
}

function _getFillOrKillSellSurplus(order: RawOrder): Surplus | null {
  const { buyAmount, executedBuyAmount } = order

  const buyAmountBigNumber = new BigNumber(buyAmount.toString())
  const executedBuyAmountBigNumber = new BigNumber(executedBuyAmount)

  // Difference between what you got minus what you wanted to get is the surplus
  const difference = executedBuyAmountBigNumber.minus(buyAmountBigNumber)

  const amount = difference.gt(ZERO_BIG_NUMBER) ? difference : ZERO_BIG_NUMBER

  const percentage = amount.dividedBy(executedBuyAmountBigNumber)

  return { amount, percentage }
}

type PartialFillSurplusParams = {
  buyAmount: string | BigNumber
  sellAmount: string | BigNumber
  executedSellAmountBeforeFees: string
  executedBuyAmount: string
}

// The surplus calculation can be called for huge and small values
// And default DECIMAL_PLACES=20 is not enough for it and can cause rounding problems
const BigNumberForSurplus = BigNumber.clone({ DECIMAL_PLACES: 32 })

function _getPartialFillSellSurplus(params: PartialFillSurplusParams): Surplus | null {
  const { buyAmount, sellAmount, executedSellAmountBeforeFees, executedBuyAmount } = params

  const sellAmountBigNumber = new BigNumberForSurplus(sellAmount)
  const executedSellAmountBigNumber = new BigNumberForSurplus(executedSellAmountBeforeFees)
  const buyAmountBigNumber = new BigNumberForSurplus(buyAmount)
  const executedBuyAmountBigNumber = new BigNumberForSurplus(executedBuyAmount)

  // BUY is QUOTE
  const price = buyAmountBigNumber.dividedBy(sellAmountBigNumber)

  // What you would get at limit price, in buy token atoms
  const minimumBuyAmount = executedSellAmountBigNumber.multipliedBy(price)

  // Surplus is the difference between what you got minus what you would get if executed at limit price
  // Surplus amount, in buy token atoms
  const amount = executedBuyAmountBigNumber.minus(minimumBuyAmount)

  // The percentage is based on the amount you would receive, if executed at limit price
  const percentage = amount.dividedBy(executedBuyAmountBigNumber)

  return { amount, percentage }
}

/**
 * Calculates BUY surplus based on sell amounts
 *
 * @returns Buy surplus
 */
export function getBuySurplus(order: RawOrder): Surplus {
  const { partiallyFillable } = order

  const surplus = partiallyFillable ? _getPartialFillBuySurplus(order) : _getFillOrKillBuySurplus(order)

  return surplus || ZERO_SURPLUS
}

function _getFillOrKillBuySurplus(order: RawOrder): Surplus | null {
  const { sellAmount, executedSellAmountBeforeFees } = order

  const sellAmountBigNumber = new BigNumber(sellAmount)
  const executedSellAmountBigNumber = new BigNumber(executedSellAmountBeforeFees)

  // BUY order has the buy amount fixed, so it'll sell AT MOST `sellAmount`
  // Surplus will come in the form of a "discount", selling less than `sellAmount`
  // The difference between `sellAmount - executedSellAmount` is the surplus.
  const amount = sellAmountBigNumber.minus(executedSellAmountBigNumber)

  const percentage = amount.dividedBy(executedSellAmountBigNumber)

  return { amount, percentage }
}

function _getPartialFillBuySurplus(params: PartialFillSurplusParams): Surplus | null {
  const { buyAmount, sellAmount, executedSellAmountBeforeFees, executedBuyAmount } = params

  const sellAmountBigNumber = new BigNumberForSurplus(sellAmount)
  const executedSellAmountBigNumber = new BigNumberForSurplus(executedSellAmountBeforeFees)
  const buyAmountBigNumber = new BigNumberForSurplus(buyAmount)
  const executedBuyAmountBigNumber = new BigNumberForSurplus(executedBuyAmount)

  // SELL is QUOTE
  const price = sellAmountBigNumber.dividedBy(buyAmountBigNumber)

  const maximumSellAmount = executedBuyAmountBigNumber.multipliedBy(price)

  const amount = maximumSellAmount.minus(executedSellAmountBigNumber)

  const percentage = amount.dividedBy(executedSellAmountBigNumber)

  return { amount, percentage }
}

export const ZERO_SURPLUS: Surplus = { amount: ZERO_BIG_NUMBER, percentage: ZERO_BIG_NUMBER }

export function getOrderSurplus(order: RawOrder): Surplus {
  const { kind } = order

  // `executedSellAmount` already has the fees discounted
  const { executedBuyAmount, executedSellAmount } = getOrderExecutedAmounts(order)

  if (executedBuyAmount.isZero() || executedSellAmount.isZero()) {
    return ZERO_SURPLUS
  }

  if (kind === 'buy') {
    return getBuySurplus(order)
  } else {
    return getSellSurplus(order)
  }
}

/**
 * Syntactic sugar to get the order's executed amounts as a BigNumber (in atoms)
 * Mostly because `executedSellAmount` (with fees deducted) is named `executedSellAmountBeforeFees`
 *
 * @param order The order
 */
export function getOrderExecutedAmounts(order: Pick<RawOrder, 'executedBuyAmount' | 'executedSellAmountBeforeFees'>): {
  executedBuyAmount: BigNumber
  executedSellAmount: BigNumber
} {
  const { executedBuyAmount, executedSellAmountBeforeFees } = order

  return {
    executedBuyAmount: new BigNumber(executedBuyAmount),
    executedSellAmount: new BigNumber(executedSellAmountBeforeFees),
  }
}

interface CommonPriceParams {
  buyTokenDecimals: number
  sellTokenDecimals: number
  inverted?: boolean
}

export type GetRawOrderPriceParams = CommonPriceParams & {
  order: Pick<RawOrder, 'executedBuyAmount' | 'executedSellAmountBeforeFees'>
}

export type GetOrderLimitPriceParams = CommonPriceParams & {
  buyAmount: string | BigNumber
  sellAmount: string | BigNumber
}

/**
 * Calculates order limit price base on order and buy/sell token decimals
 * Result is given in sell token units
 *
 * @param buyAmount The order buyAmount
 * @param sellAmount The order sellAmount
 * @param buyTokenDecimals The buy token decimals
 * @param sellTokenDecimals The sell token decimals
 * @param inverted Optional. Whether to invert the price (1/price).
 */
export function getOrderLimitPrice({
  buyAmount,
  sellAmount,
  buyTokenDecimals,
  sellTokenDecimals,
  inverted,
}: GetOrderLimitPriceParams): BigNumber {
  const price = calculatePrice({
    numerator: { amount: sellAmount, decimals: sellTokenDecimals },
    denominator: { amount: buyAmount, decimals: buyTokenDecimals },
  })

  return inverted ? invertPrice(price) : price
}

/**
 * Calculates order executed price base on order and buy/sell token decimals
 * Result is given in sell token units
 *
 * @param order The order
 * @param buyTokenDecimals The buy token decimals
 * @param sellTokenDecimals The sell token decimals
 * @param inverted Optional. Whether to invert the price (1/price).
 */
export function getOrderExecutedPrice({
  order,
  buyTokenDecimals,
  sellTokenDecimals,
  inverted,
}: GetRawOrderPriceParams): BigNumber {
  const { executedBuyAmount, executedSellAmount } = getOrderExecutedAmounts(order)

  // Only calculate the price when both values are set
  // Having only one value > 0 is anyway an invalid state
  if (executedBuyAmount.isZero() || executedSellAmount.isZero()) {
    return ZERO_BIG_NUMBER
  }

  return getOrderLimitPrice({
    buyAmount: executedBuyAmount,
    sellAmount: executedSellAmount,
    buyTokenDecimals,
    sellTokenDecimals,
    inverted,
  })
}

export function getShortOrderId(orderId: string, length = 8): string {
  return orderId.replace(/^0x/, '').slice(0, length)
}

function isZeroAddress(address: string): boolean {
  return /^0x0{40}$/.test(address)
}

export function isTokenErc20(token: TokenErc20 | null | undefined): token is TokenErc20 {
  return (token as TokenErc20)?.address !== undefined
}

export enum FormatAmountPrecision {
  middlePrecision,
  highPrecision,
  maxPrecision,
}

export function formattedAmount(
  erc20: TokenErc20 | null | undefined,
  amount: BigNumber,
  typePrecision: FormatAmountPrecision = FormatAmountPrecision.maxPrecision,
): string {
  if (!isTokenErc20(erc20)) return '-'

  if (!erc20.decimals) return amount.toString(10)

  return typePrecision === FormatAmountPrecision.maxPrecision
    ? formatSmartMaxPrecision(amount, erc20)
    : formattingAmountPrecision(amount, erc20, typePrecision)
}

function getReceiverAddress({ owner, receiver }: RawOrder): string {
  return !receiver || isZeroAddress(receiver) ? owner : receiver
}

/**
 * Transforms a RawOrder into an Order object
 *
 * @param rawOrder RawOrder object
 */
export function transformOrder(rawOrder: RawOrder): Order {
  const {
    creationDate,
    validTo,
    buyToken,
    sellToken,
    buyAmount,
    sellAmount,
    feeAmount,
    executedFeeAmount,
    executedSurplusFee,
    totalFee,
    invalidated,
    ...rest
  } = rawOrder
  const receiver = getReceiverAddress(rawOrder)
  const shortId = getShortOrderId(rawOrder.uid)
  const { executedBuyAmount, executedSellAmount } = getOrderExecutedAmounts(rawOrder)
  const status = getOrderStatus(rawOrder)
  const partiallyFilled = isOrderPartiallyFilled(rawOrder)
  const fullyFilled = isOrderFilled(rawOrder)
  const { amount: filledAmount, percentage: filledPercentage } = getOrderFilledAmount(rawOrder)
  const { amount: surplusAmount, percentage: surplusPercentage } = getOrderSurplus(rawOrder)

  return {
    ...rest,
    receiver,
    shortId,
    creationDate: new Date(creationDate),
    expirationDate: new Date(validTo * 1000),
    buyTokenAddress: buyToken,
    sellTokenAddress: sellToken,
    buyAmount: new BigNumber(buyAmount),
    sellAmount: new BigNumber(sellAmount),
    executedBuyAmount,
    executedSellAmount,
    feeAmount: new BigNumber(feeAmount),
    executedFeeAmount: new BigNumber(executedFeeAmount),
    executedSurplusFee: executedSurplusFee ? new BigNumber(executedSurplusFee) : null,
    totalFee: new BigNumber(totalFee),
    cancelled: invalidated,
    status,
    partiallyFilled,
    fullyFilled,
    filledAmount,
    filledPercentage,
    surplusAmount,
    surplusPercentage,
  } as Order
}

/**
 * Transforms a RawTrade into a Trade object
 */
export function transformTrade(rawTrade: TradeMetaData, order: Order, executionTimestamp?: number): Trade {
  const { orderUid, buyAmount, sellAmount, sellAmountBeforeFees, buyToken, sellToken, ...rest } = rawTrade
  const { amount, percentage } = getTradeSurplus(rawTrade, order)

  return {
    ...rest,
    orderId: orderUid,
    kind: order.kind,
    buyAmount: new BigNumber(buyAmount),
    sellAmount: new BigNumber(sellAmount),
    sellAmountBeforeFees: new BigNumber(sellAmountBeforeFees),
    buyTokenAddress: buyToken,
    sellTokenAddress: sellToken,
    surplusAmount: amount,
    surplusPercentage: percentage,
    executionTime: executionTimestamp ? new Date(executionTimestamp * 1000) : null,
  }
}

export function getTradeSurplus(rawTrade: TradeMetaData, order: Order): Surplus {
  const params: PartialFillSurplusParams = {
    sellAmount: order.sellAmount,
    buyAmount: order.buyAmount,
    executedSellAmountBeforeFees: rawTrade.sellAmountBeforeFees,
    executedBuyAmount: rawTrade.buyAmount,
  }

  const surplus = order.kind === OrderKind.SELL ? _getPartialFillSellSurplus(params) : _getPartialFillBuySurplus(params)

  return surplus || ZERO_SURPLUS
}
