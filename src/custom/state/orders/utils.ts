import { Currency, CurrencyAmount, Price } from '@uniswap/sdk-core'
import { ONE_HUNDRED_PERCENT } from 'constants/misc'
import { PENDING_ORDERS_BUFFER, ZERO_FRACTION } from 'constants/index'
import { Order } from 'state/orders/actions'
import { OUT_OF_MARKET_PRICE_DELTA_PERCENTAGE } from 'state/orders/consts'
import { EnrichedOrder, OrderClass, OrderKind } from '@cowprotocol/cow-sdk'
import JSBI from 'jsbi'
import { buildPriceFromCurrencyAmounts } from '@cow/modules/limitOrders/utils/buildPriceFromCurrencyAmounts'

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
function isOrderFulfilled(
  order: Pick<EnrichedOrder, 'buyAmount' | 'sellAmount' | 'executedBuyAmount' | 'executedSellAmountBeforeFees' | 'kind'>
): boolean {
  const { buyAmount, sellAmount, executedBuyAmount, executedSellAmountBeforeFees, kind } = order

  if (kind === OrderKind.SELL) {
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
function isOrderCancelled(order: Pick<EnrichedOrder, 'creationDate' | 'invalidated'>): boolean {
  const creationTime = new Date(order.creationDate).getTime()
  return order.invalidated && Date.now() - creationTime > PENDING_ORDERS_BUFFER
}

/**
 * An order is considered expired if it has been at least `PENDING_ORDERS_BUFFER` after `validTo`.
 * The buffer is used to take into account race conditions where a solver might
 * execute a transaction after the backend changed the order status.
 */
export function isOrderExpired(order: Pick<EnrichedOrder, 'validTo'>): boolean {
  const validToTime = order.validTo * 1000 // validTo is in seconds
  return Date.now() - validToTime > PENDING_ORDERS_BUFFER
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
  > | null
): OrderTransitionStatus {
  if (!order) {
    console.debug(`[state::orders::classifyOrder] unknown order`)
    return 'unknown'
  } else if (isOrderFulfilled(order)) {
    console.debug(
      `[state::orders::classifyOrder] fulfilled order ${order.uid.slice(0, 10)} ${order.executedBuyAmount} | ${
        order.executedSellAmountBeforeFees
      }`
    )
    return 'fulfilled'
  } else if (isOrderCancelled(order)) {
    console.debug(`[state::orders::classifyOrder] cancelled order ${order.uid.slice(0, 10)}`)
    return 'cancelled'
  } else if (isOrderExpired(order)) {
    console.debug(
      `[state::orders::classifyOrder] expired order ${order.uid.slice(0, 10)}`,
      new Date(order.validTo * 1000)
    )
    return 'expired'
  } else if (isPresignPending(order)) {
    console.debug(`[state::orders::classifyOrder] presignPending order ${order.uid.slice(0, 10)}`)
    return 'presignaturePending'
  } else if (isOrderPresigned(order)) {
    console.debug(`[state::orders::classifyOrder] presigned order ${order.uid.slice(0, 10)}`)
    return 'presigned'
  }

  console.debug(`[state::orders::classifyOrder] pending order ${order.uid.slice(0, 10)}`)
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
  executionPrice: Price<Currency, Currency>
): boolean {
  // Calculate the percentage of the current price in regards to the order price
  const percentageDifference = ONE_HUNDRED_PERCENT.subtract(executionPrice.divide(orderPrice))

  console.debug(
    `[UnfillableOrdersUpdater::isOrderUnfillable] ${order.kind} [${order.id.slice(0, 8)}]:`,
    orderPrice.toSignificant(10),
    executionPrice.toSignificant(10),
    `${percentageDifference.toFixed(4)}%`,
    percentageDifference.greaterThan(OUT_OF_MARKET_PRICE_DELTA_PERCENTAGE)
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

export function getOrderExecutionPrice(order: Order, price: string, feeAmount: string): Price<Currency, Currency> {
  if (order.kind === OrderKind.SELL) {
    return new Price(order.inputToken, order.outputToken, order.sellAmount.toString(), price.toString())
  }

  return new Price(
    order.inputToken,
    order.outputToken,
    JSBI.add(JSBI.BigInt(price.toString()), JSBI.BigInt(feeAmount)),
    order.buyAmount.toString()
  )
}
export function getOrderMarketPrice(order: Order, price: string, feeAmount: string): Price<Currency, Currency> {
  if (order.kind === OrderKind.SELL) {
    return new Price(
      order.inputToken,
      order.outputToken,
      JSBI.subtract(JSBI.BigInt(order.sellAmount.toString()), JSBI.BigInt(feeAmount)),
      price.toString()
    )
  }

  return new Price(order.inputToken, order.outputToken, price.toString(), order.buyAmount.toString())
}

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
 * * `FP` Fill Price (Volume sensitive) (aka Market Price)
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
 *
 *
 * @param order Tokens and amounts information, plus whether partially fillable
 * @param fillPrice AKA MarketPrice
 * @param fee Estimated fee in inputToken atoms, as string
 */
export function getEstimatedExecutionPrice(
  order: Order,
  fillPrice: Price<Currency, Currency>,
  fee: string
): Price<Currency, Currency> {
  // TODO: implement estimation for partially fillable orders

  // Build CurrencyAmount and Price instances
  const feeAmount = CurrencyAmount.fromRawAmount(order.inputToken, fee)
  const inputAmount = CurrencyAmount.fromRawAmount(order.inputToken, order.sellAmount.toString())
  const outputAmount = CurrencyAmount.fromRawAmount(order.outputToken, order.buyAmount.toString())
  const limitPrice = buildPriceFromCurrencyAmounts(inputAmount, outputAmount)

  if (order.class === OrderClass.MARKET) {
    return limitPrice
  }

  const amountMinusFees = inputAmount.subtract(feeAmount)

  if (!amountMinusFees.greaterThan(ZERO_FRACTION)) {
    // When fee > amount, return 0 price
    return new Price(order.inputToken, order.outputToken, '0', '0')
  }

  const numerator = inputAmount.multiply(limitPrice)
  // The divider in the formula is used as denominator, and the division is done inside the Price instance
  const denominator = amountMinusFees

  const feasibleExecutionPrice = new Price(
    order.inputToken,
    order.outputToken,
    denominator.quotient,
    numerator.quotient
  )

  // Picking the MAX between FEP and FP
  const estimatedExecutionPrice = fillPrice.greaterThan(feasibleExecutionPrice) ? fillPrice : feasibleExecutionPrice

  // TODO: remove debug statement
  console.debug(`getEstimatedExecutionPrice`, {
    'Amount (A)': inputAmount.toFixed(inputAmount.currency.decimals) + ' ' + inputAmount.currency.symbol,
    'Fee (F)': feeAmount.toFixed(feeAmount.currency.decimals) + ' ' + feeAmount.currency.symbol,
    'Limit Price (LP)': `${limitPrice.toFixed(8)} ${limitPrice.quoteCurrency.symbol} per ${
      limitPrice.baseCurrency.symbol
    } (${limitPrice.numerator.toString()}/${limitPrice.denominator.toString()})`,
    'Feasable Execution Price (FEP)': `${feasibleExecutionPrice.toFixed(18)} ${
      feasibleExecutionPrice.quoteCurrency.symbol
    } per ${feasibleExecutionPrice.baseCurrency.symbol}`,
    'Fill Price (FP)': `${fillPrice.toFixed(8)} ${fillPrice.quoteCurrency.symbol} per ${fillPrice.baseCurrency.symbol}`,
    'Est.Execution Price (EEP)': `${estimatedExecutionPrice.toFixed(8)} ${
      estimatedExecutionPrice.quoteCurrency.symbol
    } per ${estimatedExecutionPrice.baseCurrency.symbol}`,
    id: order.id.slice(0, 8),
    class: order.class,
  })

  return estimatedExecutionPrice
}
