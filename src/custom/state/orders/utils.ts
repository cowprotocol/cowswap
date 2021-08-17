import { OrderKind } from '@gnosis.pm/gp-v2-contracts'
import { Price } from '@uniswap/sdk-core'

import { ONE_HUNDRED_PERCENT, PENDING_ORDERS_BUFFER } from 'constants/index'
import { OrderMetaData } from 'utils/operator'
import { Order } from 'state/orders/actions'
import { PriceInformation } from 'utils/price'
import { OUT_OF_MARKET_PRICE_DELTA_PERCENTAGE } from 'state/orders/consts'

export type ApiOrderStatus = 'unknown' | 'fulfilled' | 'expired' | 'cancelled' | 'pending'

/**
 * An order is considered fulfilled if `executedByAmount` and `executedSellAmount` are > 0.
 *
 * We assume the order is `fillOrKill`
 */
function isOrderFulfilled(order: OrderMetaData): boolean {
  return Number(order.executedBuyAmount) > 0 && Number(order.executedSellAmount) > 0
}

/**
 * An order is considered cancelled if the `invalidated` flag is `true` and
 * it has been at least `PENDING_ORDERS_BUFFER` since it has been created.
 * The buffer is used to take into account race conditions where a solver might
 * execute a transaction after the backend changed the order status.
 *
 * We assume the order is not fulfilled.
 */
function isOrderCancelled(order: OrderMetaData): boolean {
  const creationTime = new Date(order.creationDate).getTime()
  return order.invalidated && Date.now() - creationTime > PENDING_ORDERS_BUFFER
}

/**
 * An order is considered expired if it has been at least `PENDING_ORDERS_BUFFER` after `validTo`.
 * The buffer is used to take into account race conditions where a solver might
 * execute a transaction after the backend changed the order status.
 */
function isOrderExpired(order: OrderMetaData): boolean {
  const validToTime = order.validTo * 1000 // validTo is in seconds
  return Date.now() - validToTime > PENDING_ORDERS_BUFFER
}

export function classifyOrder(order: OrderMetaData | null): ApiOrderStatus {
  if (!order) {
    console.debug(`[state::orders::classifyOrder] unknown order`)
    return 'unknown'
  } else if (isOrderFulfilled(order)) {
    console.debug(
      `[state::orders::classifyOrder] fulfilled order ${order.uid.slice(0, 10)} ${order.executedBuyAmount} | ${
        order.executedSellAmount
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
 * @param price
 */
export function isOrderUnfillable(order: Order, price: Required<PriceInformation>): boolean {
  // Build price object from stored order
  const orderPrice = new Price(
    order.inputToken,
    order.outputToken,
    order.sellAmount.toString(),
    order.buyAmount.toString()
  )

  // Build current price object from quoted price
  // Note that depending on the order type, the amount will be used either as nominator or denominator
  const currentPrice =
    order.kind === OrderKind.SELL
      ? new Price(order.inputToken, order.outputToken, order.sellAmount.toString(), price.amount as string)
      : new Price(order.inputToken, order.outputToken, price.amount as string, order.buyAmount.toString())

  // Calculate the percentage of the current price in regards to the order price
  const percentageDifference = ONE_HUNDRED_PERCENT.subtract(currentPrice.divide(orderPrice))

  console.debug(
    `[UnfillableOrdersUpdater::isOrderUnfillable] ${order.kind} [${order.id.slice(0, 8)}]:`,
    orderPrice.toSignificant(10),
    currentPrice.toSignificant(10),
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
