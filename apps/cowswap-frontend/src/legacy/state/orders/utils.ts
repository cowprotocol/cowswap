import type { LatestAppDataDocVersion } from '@cowprotocol/app-data'
import { ONE_HUNDRED_PERCENT, PENDING_ORDERS_BUFFER, ZERO_FRACTION } from '@cowprotocol/common-const'
import { bpsToPercent, buildPriceFromCurrencyAmounts, getWrappedToken, isSellOrder } from '@cowprotocol/common-utils'
import { EnrichedOrder, getPartnerFeeBps, OrderKind, OrderStatus } from '@cowprotocol/cow-sdk'
import { UiOrderType } from '@cowprotocol/types'
import { Currency, CurrencyAmount, Percent, Price, Token } from '@uniswap/sdk-core'

import BigNumber from 'bignumber.js'
import JSBI from 'jsbi'

import { decodeAppData } from 'modules/appData/utils/decodeAppData'

import { getIsComposableCowParentOrder } from 'utils/orderUtils/getIsComposableCowParentOrder'
import { getOrderSurplus } from 'utils/orderUtils/getOrderSurplus'
import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'
import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { Order, updateOrder, UpdateOrderParams as UpdateOrderParamsAction } from './actions'
import { OUT_OF_MARKET_PRICE_DELTA_PERCENTAGE } from './consts'
import { UpdateOrderParams } from './hooks'

import { AppDispatch } from '../index'
import { serializeToken } from '../user/hooks'

export type OrderTransitionStatus =
  | 'unknown'
  | 'fulfilled'
  | 'expired'
  | 'cancelled'
  | 'presignaturePending'
  | 'presigned'
  | 'pending'

/**
 * An order is considered fulfilled if all sellAmount has been sold, for sell orders
 * or all buyAmount has been bought, for buy orders
 */
export function isOrderFulfilled(
  order: Pick<
    EnrichedOrder,
    'buyAmount' | 'sellAmount' | 'executedBuyAmount' | 'executedSellAmountBeforeFees' | 'kind'
  >,
): boolean {
  const { buyAmount, sellAmount, executedBuyAmount, executedSellAmountBeforeFees, kind } = order

  if (isSellOrder(kind)) {
    return sellAmount === executedSellAmountBeforeFees
  } else {
    return buyAmount === executedBuyAmount
  }
}

/**
 * An order is considered cancelled if the `invalidated` flag is `true` and
 * it has been at least `PENDING_ORDERS_BUFFER` since it has been created.
 * The buffer is used to take into account race conditions where a solver might
 * execute a transaction after the backend changed the order status.
 *
 * We assume the order is not fulfilled.
 */
export function isOrderCancelled(order: Pick<EnrichedOrder, 'creationDate' | 'invalidated' | 'status'>): boolean {
  const creationTime = new Date(order.creationDate).getTime()
  return order.invalidated && Date.now() - creationTime > PENDING_ORDERS_BUFFER
}

export function isTwapOrderCancelled(order: EnrichedOrder): boolean {
  return order.status === OrderStatus.CANCELLED
}

/**
 * An order is considered expired if it has been at least `PENDING_ORDERS_BUFFER` after `validTo`.
 * The buffer is used to take into account race conditions where a solver might
 * execute a transaction after the backend changed the order status.
 */
export function isOrderExpired(order: Pick<EnrichedOrder, 'validTo'>, threshold = PENDING_ORDERS_BUFFER): boolean {
  const validToTime = order.validTo * 1000 // validTo is in seconds
  return Date.now() - validToTime > threshold
}

function isPresignPending(order: Pick<EnrichedOrder, 'status'>): boolean {
  return order.status === 'presignaturePending'
}

/**
 * An order is considered presigned, when it transitions from "presignaturePending" to just "pending"
 */
function isOrderPresigned(order: Pick<EnrichedOrder, 'signingScheme' | 'status'>): boolean {
  return order.signingScheme === 'presign' && order.status === 'open'
}

export function classifyOrder(
  order: Pick<
    EnrichedOrder,
    | 'uid'
    | 'validTo'
    | 'creationDate'
    | 'invalidated'
    | 'buyAmount'
    | 'sellAmount'
    | 'executedBuyAmount'
    | 'executedSellAmountBeforeFees'
    | 'kind'
    | 'signingScheme'
    | 'status'
  > | null,
): OrderTransitionStatus {
  if (!order) {
    console.debug(`[state::orders::classifyOrder] unknown order`)
    return 'unknown'
  } else if (isOrderFulfilled(order)) {
    return 'fulfilled'
  } else if (isOrderCancelled(order)) {
    return 'cancelled'
  } else if (isOrderExpired(order)) {
    return 'expired'
  } else if (isPresignPending(order)) {
    return 'presignaturePending'
  } else if (isOrderPresigned(order)) {
    return 'presigned'
  }

  return 'pending'
}

/**
 * Based on the order and current price, returns `true` if order is out of the market.
 * Out of the market means the price difference between original and current to be positive
 * and greater than OUT_OF_MARKET_PRICE_DELTA_PERCENTAGE.
 * Negative difference is good for the user.
 * We allow for it to be up to OUT_OF_MARKET_PRICE_DELTA_PERCENTAGE worse to account for
 * small price changes
 *
 * @param order
 * @param orderPrice
 * @param executionPrice
 */
export function isOrderUnfillable(
  order: Order,
  orderPrice: Price<Currency, Currency>,
  executionPrice: Price<Currency, Currency>,
): boolean {
  // Calculate the percentage of the current price in regards to the order price
  const percentageDifference = ONE_HUNDRED_PERCENT.subtract(executionPrice.divide(orderPrice))

  console.debug(
    `[UnfillableOrdersUpdater::isOrderUnfillable] ${order.kind} [${order.id.slice(0, 8)}]:`,
    orderPrice.toSignificant(10),
    executionPrice.toSignificant(10),
    `${percentageDifference.toFixed(4)}%`,
    percentageDifference.greaterThan(OUT_OF_MARKET_PRICE_DELTA_PERCENTAGE),
  )

  // Example. Consider the pair X-Y:
  // Order price of 1X = 20459.60331Y
  // Current market price is 1X = 20562.41538Y
  // The different between order price and current price is -0.5025%
  // That means the market price is better than the order price, thus, NOT unfillable

  // Higher prices are worse, thus, the order will be unfillable whenever percentage difference is positive
  // Check whether given price difference is > Price delta %, to allow for small market variations
  return percentageDifference.greaterThan(OUT_OF_MARKET_PRICE_DELTA_PERCENTAGE)
}

/**
 * Builds order market price, based on quoted amount and fee
 *
 * Discounts the fee from sell amount (for sell orders)
 * @param order
 * @param quotedAmount
 * @param feeAmount
 */
export function getOrderMarketPrice(order: Order, quotedAmount: string, feeAmount: string): Price<Currency, Currency> {
  // We get the remainder as the order might have already been partially filled
  const remainingAmount = getRemainderAmount(order.kind, order)

  if (isSellOrder(order.kind)) {
    return new Price(
      order.inputToken,
      order.outputToken,
      // For sell orders, the market price has the fee subtracted from the sell amount
      JSBI.subtract(JSBI.BigInt(remainingAmount), JSBI.BigInt(feeAmount)),
      quotedAmount,
    )
  }

  // For buy orders, the market price uses the quotedAmount which comes without the fee amount
  return new Price(order.inputToken, order.outputToken, quotedAmount, remainingAmount)
}

/**
 * 5% to level out the fee amount changes
 */
const EXECUTION_PRICE_FEE_COEFFICIENT = new Percent(5, 100)
const FEE_AMOUNT_MULTIPLIER = 1_000

/**
 * Calculates the estimated execution price based on order params, before the order is placed
 *
 * @param order undefined // there's no order when calling this way
 * @param fillPrice The current market price
 * @param fee The estimated fee in inputToken atoms, as string
 * @param inputAmount The input amount
 * @param outputAmount The output amount
 * @param kind The order kind
 * @param fullAppData The full app data (for calculating the partner fee)
 * @param isPartiallyFillable Whether the order is partially fillable
 */
export function getEstimatedExecutionPrice(
  order: undefined,
  fillPrice: Price<Currency, Currency>,
  fee: string,
  inputAmount: CurrencyAmount<Currency>,
  outputAmount: CurrencyAmount<Currency>,
  kind: OrderKind,
  fullAppData: EnrichedOrder['fullAppData'],
  isPartiallyFillable: boolean,
): Price<Currency, Currency> | null
/**
 * Calculates the estimated execution price for an order
 *
 * @param order Tokens and amounts information, plus whether partially fillable
 * @param fillPrice AKA MarketPrice
 * @param fee Estimated fee in inputToken atoms, as string
 */
export function getEstimatedExecutionPrice(
  order: Order | ParsedOrder,
  fillPrice: Price<Currency, Currency>,
  fee: string,
): Price<Currency, Currency> | null
/**
 * Get estimated execution price
 *
 * Implementation of logic defined on https://www.notion.so/cownation/Execution-Price-Market-Price-90524299d1874a59bb34c658293a0316?pvs=4
 *
 * In summary, given an Order with:
 * * `LP` Limit Price (this and all other prices, is expressed in buy tokens)
 * * `A` Amount of the order (in sell tokens)
 * * `Kind` Fill Type (FoC, Partial)
 *
 * And the Market conditions:
 * * `FP` Fill Price (No longer volume sensitive) (aka Market Price, Spot price)
 * * `BOP` Best Offer Price (Non-volume sensitive) (aka Spot Price)
 * * `F` Fee to execute the order (in sell tokens)
 *
 * If we define something called `Feasible Execution Price` as
 * FEP = (A - F) * LP / A
 *
 * Similarly as above, we define something called `Feasible Best Order Price` as
 * FBOP = (A - F) * BOP / A
 *
 * Then, depending on the Kind, the `Estimated Execution Price` (EEP) would be:
 * IF (Kind = FoC)
 *       EEP = MAX(FEP, FP)
 *
 * IF (Kind = Partial)
 *        EEP = MAX(FEP, FBOP)
 */
// TODO: Break down this large function into smaller functions
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function, complexity
export function getEstimatedExecutionPrice(
  order: Order | ParsedOrder | undefined,
  fillPrice: Price<Currency, Currency>,
  fee: string,
  inputAmount?: CurrencyAmount<Currency>,
  outputAmount?: CurrencyAmount<Currency>,
  kind?: OrderKind,
  fullAppData?: EnrichedOrder['fullAppData'],
  isPartiallyFillable?: boolean,
): Price<Currency, Currency> | null {
  let inputToken: Token
  let outputToken: Token
  let limitPrice: Price<Currency, Currency>
  let sellAmount: string
  let partiallyFillable = isPartiallyFillable

  if (order) {
    inputToken = order.inputToken
    outputToken = order.outputToken
    // Take partner fee into account when calculating the limit price
    limitPrice = getOrderLimitPriceWithPartnerFee(order)

    if (getUiOrderType(order) === UiOrderType.SWAP) {
      return limitPrice
    }

    // Parent TWAP order, ignore
    if (getIsComposableCowParentOrder(order)) {
      return null
    }

    // Check what's left to sell, discounting the surplus, if any
    sellAmount = getRemainderAmountsWithoutSurplus(order).sellAmount
    partiallyFillable = order.partiallyFillable
  } else {
    if (!inputAmount || !outputAmount || !kind || inputAmount.equalTo(0) || outputAmount.equalTo(0)) {
      return null
    }
    // Always the full amount
    sellAmount = inputAmount.quotient.toString()

    inputToken = getWrappedToken(inputAmount.currency)
    outputToken = getWrappedToken(outputAmount.currency)

    limitPrice = getOrderLimitPriceWithPartnerFee({
      inputToken,
      outputToken,
      sellAmount,
      buyAmount: outputAmount.quotient.toString(),
      kind: kind as OrderKind,
      fullAppData,
    })
  }

  if (!limitPrice) {
    return null
  }

  const feeAmount = CurrencyAmount.fromRawAmount(inputToken, fee)

  const remainingSellAmount = CurrencyAmount.fromRawAmount(inputToken, sellAmount)

  // When fee > amount, return 0 price
  if (!remainingSellAmount.greaterThan(ZERO_FRACTION)) {
    return new Price(inputToken, outputToken, '1', '0')
  }

  const feeWithMargin = feeAmount.add(feeAmount.multiply(EXECUTION_PRICE_FEE_COEFFICIENT))

  let feasibleExecutionPrice: Price<Currency, Currency> | undefined = undefined

  if (partiallyFillable) {
    // If the order is partially fillable, we need to extrapolate the price based on the fee amount
    // So the estimated price remains fixed regardless of the order size
    feasibleExecutionPrice = extrapolatePriceBasedOnFeeAmount(
      feeAmount,
      remainingSellAmount,
      limitPrice,
      inputToken,
      outputToken,
    )
  }

  // Regular case, when the order is fill or kill OR the fill amount is smaller than the threshold set
  if (feasibleExecutionPrice === undefined) {
    const numerator = remainingSellAmount.multiply(limitPrice)
    const denominator = remainingSellAmount.subtract(feeWithMargin)

    // Just in case when the denominator is <= 0 after subtracting the fee
    if (!denominator.greaterThan(ZERO_FRACTION)) {
      // numerator and denominator are inverted!!!
      // https://github.com/Uniswap/sdk-core/blob/9997e88/src/entities/fractions/price.ts#L26
      return new Price(inputToken, outputToken, '1', '0')
    }

    /**
     * Example:
     * Order: 100 WETH -> 182000 USDC
     * Fee: 0.002 WETH
     * Limit price: 182000 / 100 = 1820 USDC per 1 WETH
     *
     * Fee with margin: 0.002 + 5% = 0.0021 WETH
     * Executes at: 182000 / (100 - 0.0021) = 1820.038 USDC per 1 WETH
     */
    feasibleExecutionPrice = new Price(inputToken, outputToken, denominator.quotient, numerator.quotient)
  }

  // Pick the MAX between FEP and FP
  return fillPrice.greaterThan(feasibleExecutionPrice) ? fillPrice : feasibleExecutionPrice
}

/**
 * Gets the remainder amounts for both sell and buy, already discounting for surplus, if any surplus or matches
 *
 * Sell orders will have the surplus in the buy token.
 * Which means sell amount does not need to be adjusted, while the buy amount does.
 * Since the surplus is in the for of additional buy amount, we remove the surplus from the executed buy amount
 *
 * Buy orders will have the surplus in the sell token.
 * Which means buy amount does not need to be adjusted, while the sell amount does.
 * Since the surplus is in the for of less sell tokens being consumed, we add the surplus to the executed sell amount
 *
 * When there's no surplus it either means: there were no matches or it matched without any surplus
 * In both cases, the sell and buy remainders can be returned in full
 * @param order
 */
export function getRemainderAmountsWithoutSurplus(order: Order | ParsedOrder): {
  buyAmount: string
  sellAmount: string
} {
  const sellRemainder = getRemainderAmount(OrderKind.SELL, order)
  const buyRemainder = getRemainderAmount(OrderKind.BUY, order)
  const surplusAmountBigNumber = getSurplusAmountBigNumber(order)

  if (surplusAmountBigNumber.isZero()) {
    return { sellAmount: sellRemainder, buyAmount: buyRemainder }
  }

  const surplusAmount = JSBI.BigInt(`0x${surplusAmountBigNumber.decimalPlaces(0).toString(16)}`)

  if (isSellOrder(order.kind)) {
    const buyAmount = JSBI.subtract(JSBI.BigInt(buyRemainder), surplusAmount).toString()

    return { sellAmount: sellRemainder, buyAmount }
  } else {
    const sellAmount = JSBI.add(JSBI.BigInt(sellRemainder), surplusAmount).toString()

    return { sellAmount, buyAmount: buyRemainder }
  }
}

function getSurplusAmountBigNumber(order: Order | ParsedOrder): BigNumber {
  if ('executionData' in order) {
    // ParsedOrder
    return order.executionData.surplusAmount
  }
  // Order
  return getOrderSurplus(order).amount
}

/**
 * Get the remainder `kind` amount, based on executed amounts from the `apiAdditionalInfo`, if any
 *
 * For the sell amount, uses the variants that do not consider the fee:
 * `sellAmountBeforeFee` and `executedSellAmountBeforeFees`
 *
 * @param kind The kind of remainder
 * @param order The order object
 */
export function getRemainderAmount(kind: OrderKind, order: Order | ParsedOrder): string {
  const buyAmount = order.buyAmount.toString()

  const { sellAmount, executedSellAmount, executedBuyAmount } = getExecutedAmounts(order)

  const fullAmount = isSellOrder(kind) ? sellAmount : buyAmount

  if (!executedSellAmount || !executedBuyAmount || executedSellAmount === '0' || executedBuyAmount === '0') {
    return fullAmount
  }

  const executedAmount = JSBI.BigInt((isSellOrder(kind) ? executedSellAmount : executedBuyAmount) || 0)

  return JSBI.subtract(JSBI.BigInt(fullAmount), executedAmount).toString()
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function getExecutedAmounts(order: Order | ParsedOrder) {
  let sellAmount: string
  let executedSellAmount: string | undefined
  let executedBuyAmount: string | undefined

  if ('executionData' in order) {
    // ParsedOrder
    sellAmount = order.sellAmount
    executedSellAmount = order.executionData.executedSellAmount.toString()
    executedBuyAmount = order.executionData.executedBuyAmount.toString()
  } else {
    // Order
    sellAmount = order.sellAmountBeforeFee.toString()
    executedSellAmount = order.apiAdditionalInfo?.executedSellAmountBeforeFees
    executedBuyAmount = order.apiAdditionalInfo?.executedBuyAmount
  }

  return { sellAmount, executedSellAmount, executedBuyAmount }
}

function extrapolatePriceBasedOnFeeAmount<T extends Currency>(
  feeAmount: CurrencyAmount<T>,
  remainingSellAmount: CurrencyAmount<T>,
  limitPrice: Price<T, T>,
  inputToken: Token,
  outputToken: Token,
): Price<Token, Token> | undefined {
  // Use FEE_AMOUNT_MULTIPLIER times fee amount as the new sell amount
  const newSellAmount = feeAmount.multiply(JSBI.BigInt(FEE_AMOUNT_MULTIPLIER))
  // Only use this method if the new sell amount is smaller than the remaining sell amount
  if (remainingSellAmount.greaterThan(newSellAmount)) {
    // Quote the buy amount using the existing limit price
    const buyAmount = limitPrice.quote(newSellAmount)
    return new Price(
      inputToken,
      outputToken,
      newSellAmount.subtract(feeAmount).quotient, // TODO: should we use the fee with margin here?
      buyAmount.quotient,
    )
  }
  return undefined
}

export function partialOrderUpdate({ chainId, order, isSafeWallet }: UpdateOrderParams, dispatch: AppDispatch): void {
  const params: UpdateOrderParamsAction = {
    chainId,
    order: {
      ...order,
      ...(order.inputToken && { inputToken: serializeToken(order.inputToken) }),
      ...(order.outputToken && { outputToken: serializeToken(order.outputToken) }),
    } as UpdateOrderParamsAction['order'],
    isSafeWallet,
  }
  dispatch(updateOrder(params))
}

export function getOrderVolumeFee(fullAppData: EnrichedOrder['fullAppData']): number | undefined {
  const appData = decodeAppData(fullAppData) as LatestAppDataDocVersion

  return getPartnerFeeBps(appData?.metadata?.partnerFee)
}

type LimitPriceOrder = Pick<Order, 'inputToken' | 'outputToken' | 'sellAmount' | 'buyAmount' | 'kind' | 'fullAppData'>

export function getOrderLimitPriceWithPartnerFee(order: LimitPriceOrder): Price<Currency, Currency> {
  const inputAmount = CurrencyAmount.fromRawAmount(order.inputToken, order.sellAmount.toString())
  const outputAmount = CurrencyAmount.fromRawAmount(order.outputToken, order.buyAmount.toString())

  const { inputCurrencyAmount, outputCurrencyAmount } = getOrderAmountsWithPartnerFee(
    order.fullAppData,
    inputAmount,
    outputAmount,
    isSellOrder(order.kind),
  )

  return buildPriceFromCurrencyAmounts(inputCurrencyAmount, outputCurrencyAmount)
}

function getOrderAmountsWithPartnerFee(
  fullAppData: EnrichedOrder['fullAppData'],
  sellAmount: CurrencyAmount<Token>,
  buyAmount: CurrencyAmount<Token>,
  isSellOrder: boolean,
): { inputCurrencyAmount: CurrencyAmount<Token>; outputCurrencyAmount: CurrencyAmount<Token> } {
  const volumeFee = getOrderVolumeFee(fullAppData)

  if (!volumeFee) {
    return {
      inputCurrencyAmount: sellAmount,
      outputCurrencyAmount: buyAmount,
    }
  }

  const partnerFeePercent = bpsToPercent(volumeFee)

  if (isSellOrder) {
    return {
      inputCurrencyAmount: sellAmount,
      outputCurrencyAmount: buyAmount.divide(ONE_HUNDRED_PERCENT.subtract(partnerFeePercent)),
    }
  }

  return {
    inputCurrencyAmount: sellAmount.divide(ONE_HUNDRED_PERCENT.add(partnerFeePercent)),
    outputCurrencyAmount: buyAmount,
  }
}
