import { useSetAtom } from 'jotai'
import { useCallback, useEffect, useRef } from 'react'

import { timestamp } from '@cowprotocol/contracts'
import { OrderClass, SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount, Price } from '@uniswap/sdk-core'

import { FeeInformation, PriceInformation } from 'types'

import { priceOutOfRangeAnalytics } from 'legacy/components/analytics'
import { NATIVE_CURRENCY_BUY_ADDRESS } from 'legacy/constants'
import { WRAPPED_NATIVE_CURRENCY } from 'legacy/constants/tokens'
import { useGetGpPriceStrategy } from 'legacy/hooks/useGetGpPriceStrategy'
import useIsWindowVisible from 'legacy/hooks/useIsWindowVisible'
import { GpPriceStrategy } from 'legacy/state/gas/atoms'
import { Order } from 'legacy/state/orders/actions'
import { PENDING_ORDERS_PRICE_CHECK_POLL_INTERVAL } from 'legacy/state/orders/consts'
import { useOnlyPendingOrders, useSetIsOrderUnfillable } from 'legacy/state/orders/hooks'
import {
  getEstimatedExecutionPrice,
  getOrderMarketPrice,
  getRemainderAmount,
  isOrderUnfillable,
} from 'legacy/state/orders/utils'
import { getPromiseFulfilledValue } from 'legacy/utils/misc'
import { getBestQuote } from 'legacy/utils/price'

import { updatePendingOrderPricesAtom } from 'modules/orders/state/pendingOrdersPricesAtom'
import { useWalletInfo } from 'modules/wallet'

import { PRICE_QUOTE_VALID_TO_TIME } from 'common/constants/quote'

/**
 * Thin wrapper around `getBestPrice` that builds the params and returns null on failure
 */
async function _getOrderPrice(chainId: ChainId, order: Order, strategy: GpPriceStrategy) {
  let baseToken, quoteToken

  const amount = getRemainderAmount(order.kind, order)

  if (order.kind === 'sell') {
    // this order sell amount is sellAmountAfterFees
    // this is an issue as it will be adjusted again in the backend
    // e.g order submitted w/sellAmount adjusted for fee: 995, we re-query 995
    // e.g backend adjusts for fee again, 990 is used. We need to avoid double fee adjusting
    // e.g so here we need to pass the sellAmountBeforeFees
    baseToken = order.sellToken
    quoteToken = order.buyToken
  } else {
    baseToken = order.buyToken
    quoteToken = order.sellToken
  }

  const isEthFlow = order.sellToken === NATIVE_CURRENCY_BUY_ADDRESS
  if (isEthFlow) {
    console.debug('[UnfillableOrderUpdater] - Native sell swap detected. Using wrapped token address for quotes')
  }

  const quoteParams = {
    chainId,
    amount,
    kind: order.kind,
    // we need to get wrapped token quotes (native quotes will fail)
    sellToken: isEthFlow ? WRAPPED_NATIVE_CURRENCY[chainId].address : order.sellToken,
    buyToken: order.buyToken,
    baseToken,
    quoteToken,
    fromDecimals: order.inputToken.decimals,
    toDecimals: order.outputToken.decimals,
    // Limit order may have arbitrary validTo, but API doesn't allow values greater than 1 hour
    // To avoid ExcessiveValidTo error we use PRICE_QUOTE_VALID_TO_TIME
    validTo:
      order.class === 'limit' ? Math.round((Date.now() + PRICE_QUOTE_VALID_TO_TIME) / 1000) : timestamp(order.validTo),
    userAddress: order.owner,
    receiver: order.receiver,
    isEthFlow,
  }
  try {
    return getBestQuote({ strategy, quoteParams, fetchFee: false, isPriceRefresh: false })
  } catch (e: any) {
    return null
  }
}

/**
 * Updater that checks whether pending orders are still "fillable"
 */
export function UnfillableOrdersUpdater(): null {
  const { chainId, account } = useWalletInfo()
  const updatePendingOrderPrices = useSetAtom(updatePendingOrderPricesAtom)
  const isWindowVisible = useIsWindowVisible()

  const pending = useOnlyPendingOrders(chainId, OrderClass.LIMIT)
  const setIsOrderUnfillable = useSetIsOrderUnfillable()
  const strategy = useGetGpPriceStrategy()

  // Ref, so we don't rerun useEffect
  const pendingRef = useRef(pending)
  pendingRef.current = pending
  const isUpdating = useRef(false) // TODO: Implement using SWR or retry/cancellable promises

  const updateOrderMarketPriceCallback = useCallback(
    (
      order: Order,
      fee: FeeInformation | null,
      marketPrice: Price<Currency, Currency>,
      estimatedExecutionPrice: Price<Currency, Currency> | null
    ) => {
      if (!fee?.amount) return

      updatePendingOrderPrices({
        orderId: order.id,
        data: {
          lastUpdateTimestamp: Date.now(),
          marketPrice,
          estimatedExecutionPrice,
          feeAmount: CurrencyAmount.fromRawAmount(marketPrice.baseCurrency, fee.amount),
        },
      })
    },
    [updatePendingOrderPrices]
  )

  const updateIsUnfillableFlag = useCallback(
    (
      chainId: ChainId,
      order: Order,
      price: Required<Omit<PriceInformation, 'quoteId'>>,
      fee: FeeInformation | null
    ) => {
      if (!fee?.amount || !price.amount) return

      const orderPrice = new Price(
        order.inputToken,
        order.outputToken,
        order.sellAmount.toString(),
        order.buyAmount.toString()
      )

      const marketPrice = getOrderMarketPrice(order, price.amount, fee.amount)
      const estimatedExecutionPrice = getEstimatedExecutionPrice(order, marketPrice, fee.amount)
      const isUnfillable = order.class === OrderClass.MARKET && isOrderUnfillable(order, orderPrice, marketPrice)

      // Only trigger state update if flag changed
      if (order.isUnfillable !== isUnfillable && order.class === OrderClass.MARKET) {
        setIsOrderUnfillable({ chainId, id: order.id, isUnfillable })

        // order.isUnfillable by default is undefined, so we don't want to dispatch this in that case
        if (typeof order.isUnfillable !== 'undefined') {
          const label = `${order.inputToken.symbol}, ${order.outputToken.symbol}`
          priceOutOfRangeAnalytics(isUnfillable, label)
        }
      }

      updateOrderMarketPriceCallback(order, fee, marketPrice, estimatedExecutionPrice)
    },
    [setIsOrderUnfillable, updateOrderMarketPriceCallback]
  )

  const updatePending = useCallback(() => {
    if (!chainId || !account || isUpdating.current || !isWindowVisible) {
      return
    }

    const startTime = Date.now()
    try {
      isUpdating.current = true

      const lowerCaseAccount = account.toLowerCase()
      // Only check pending orders of the connected account
      const pending = pendingRef.current.filter((order) => order.owner.toLowerCase() === lowerCaseAccount)

      if (pending.length === 0) {
        return
      } else {
        console.debug(
          `[UnfillableOrdersUpdater] Checking new market price for ${pending.length} orders, account ${account} and network ${chainId}`
        )
      }

      pending.forEach((order, index) => {
        console.debug(`[UnfillableOrdersUpdater] Check order`, order)
        _getOrderPrice(chainId, order, strategy)
          .then((quote) => {
            if (quote) {
              const [promisedPrice, promisedFee] = quote
              const price = getPromiseFulfilledValue(promisedPrice, null)
              const fee = getPromiseFulfilledValue(promisedFee, null)

              console.debug(
                `[UnfillableOrdersUpdater::updateUnfillable] did we get any price? ${order.id.slice(0, 8)}|${index}`,
                price ? price.amount : 'no :('
              )
              price?.amount && updateIsUnfillableFlag(chainId, order, price, fee)
            } else {
              console.debug('[UnfillableOrdersUpdater::updateUnfillable] No price quote for', order.id.slice(0, 8))
            }
          })
          .catch((e) => {
            updatePendingOrderPrices({
              orderId: order.id,
              data: null,
            })

            console.debug(
              `[UnfillableOrdersUpdater::updateUnfillable] Failed to get quote on chain ${chainId} for order ${order?.id}`,
              e
            )
          })
      })
    } finally {
      isUpdating.current = false
      console.debug(`[UnfillableOrdersUpdater] Checked pending orders in ${Date.now() - startTime}ms`)
    }
  }, [account, chainId, strategy, updateIsUnfillableFlag, isWindowVisible, updatePendingOrderPrices])

  useEffect(() => {
    if (!chainId || !account || !isWindowVisible) {
      console.debug('[UnfillableOrdersUpdater] No need to fetch unfillable orders')
      return
    }

    console.debug('[UnfillableOrdersUpdater] Periodically check for unfillable orders')
    updatePending()
    const interval = setInterval(updatePending, PENDING_ORDERS_PRICE_CHECK_POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [updatePending, chainId, account, isWindowVisible])

  return null
}
