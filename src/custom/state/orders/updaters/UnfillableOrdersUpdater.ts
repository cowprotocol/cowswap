import { useCallback, useEffect, useRef } from 'react'
import { Price } from '@uniswap/sdk-core'

import { useActiveWeb3React } from 'hooks/web3'

import { usePendingOrders, useSetIsOrderUnfillable } from 'state/orders/hooks'
import { Order } from 'state/orders/actions'
import { OUT_OF_MARKET_PRICE_DELTA_PERCENTAGE, PENDING_ORDERS_PRICE_CHECK_POLL_INTERVAL } from 'state/orders/consts'

import { SupportedChainId as ChainId } from 'constants/chains'
import { ONE_HUNDRED_PERCENT } from 'constants/index'

import { getBestPrice, PriceInformation } from 'utils/price'

/**
 * Thin wrapper around `getBestPrice` that builds the params and returns null on failure
 *
 * @param chainId
 * @param order
 */
async function _getOrderPrice(chainId: ChainId, order: Order) {
  let amount, baseToken, quoteToken

  if (order.kind === 'sell') {
    amount = order.sellAmount.toString()
    baseToken = order.sellToken
    quoteToken = order.buyToken
  } else {
    amount = order.buyAmount.toString()
    baseToken = order.buyToken
    quoteToken = order.sellToken
  }

  const quoteParams = {
    chainId,
    amount,
    kind: order.kind,
    baseToken,
    quoteToken,
    fromDecimals: order.inputToken.decimals,
    toDecimals: order.outputToken.decimals,
  }

  try {
    return await getBestPrice(quoteParams)
  } catch (e) {
    return null
  }
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
function isOrderUnfillable(order: Order, price: Required<PriceInformation>): boolean {
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
    order.kind === 'sell'
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

/**
 * Updater that checks whether pending orders are still "fillable"
 */
export function UnfillableOrdersUpdater(): null {
  const { chainId } = useActiveWeb3React()
  const pending = usePendingOrders({ chainId })
  const setIsOrderUnfillable = useSetIsOrderUnfillable()

  // Ref, so we don't rerun useEffect
  const pendingRef = useRef(pending)
  pendingRef.current = pending

  const updateIsUnfillableFlag = useCallback(
    (chainId: ChainId, order: Order, price: Required<PriceInformation>) => {
      const isUnfillable = isOrderUnfillable(order, price)

      // Only trigger state update if flag changed
      order.isUnfillable !== isUnfillable && setIsOrderUnfillable({ chainId, id: order.id, isUnfillable })
    },
    [setIsOrderUnfillable]
  )

  const updatePending = useCallback(() => {
    if (!chainId || pendingRef.current.length === 0) {
      return
    }

    pendingRef.current.forEach((order, index) =>
      _getOrderPrice(chainId, order).then((price) => {
        console.debug(
          `[UnfillableOrdersUpdater::updateUnfillable] did we get any price? ${order.id.slice(0, 8)}|${index}`,
          price ? price.amount : 'no :('
        )
        price?.amount && updateIsUnfillableFlag(chainId, order, price)
      })
    )
  }, [chainId, updateIsUnfillableFlag])

  useEffect(() => {
    updatePending()

    const interval = setInterval(updatePending, PENDING_ORDERS_PRICE_CHECK_POLL_INTERVAL)

    return () => clearInterval(interval)
  }, [updatePending])

  return null
}
