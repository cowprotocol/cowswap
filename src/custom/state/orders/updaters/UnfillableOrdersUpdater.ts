import { useCallback, useEffect, useRef } from 'react'
import { timestamp } from '@cowprotocol/contracts'
import { useWalletInfo } from '@cow/modules/wallet'
import { usePendingOrders, useSetIsOrderUnfillable } from 'state/orders/hooks'
import { Order, OrderClass } from 'state/orders/actions'

import { SupportedChainId as ChainId } from 'constants/chains'

import { getBestQuote } from 'utils/price'
import { getOrderExecutionPrice, getOrderMarketPrice, isOrderUnfillable } from 'state/orders/utils'
import useGetGpPriceStrategy from 'hooks/useGetGpPriceStrategy'
import { getPromiseFulfilledValue } from 'utils/misc'
import { FeeInformation, PriceInformation } from '@cowprotocol/cow-sdk'
import { priceOutOfRangeAnalytics } from 'components/analytics'
import { GpPriceStrategy } from 'state/gas/atoms'
import { supportedChainId } from 'utils/supportedChainId'
import { NATIVE_CURRENCY_BUY_ADDRESS } from 'constants/index'
import { WRAPPED_NATIVE_CURRENCY } from 'constants/tokens'
import { PRICE_QUOTE_VALID_TO_TIME } from '@cow/constants/quote'
import { useUpdateAtom } from 'jotai/utils'
import { updatePendingOrderPricesAtom } from '@cow/modules/orders/state/pendingOrdersPricesAtom'
import { Currency, Price } from '@uniswap/sdk-core'
import { PENDING_ORDERS_PRICE_CHECK_POLL_INTERVAL } from 'state/orders/consts'
import useIsWindowVisible from 'hooks/useIsWindowVisible'

/**
 * Thin wrapper around `getBestPrice` that builds the params and returns null on failure
 */
async function _getOrderPrice(chainId: ChainId, order: Order, strategy: GpPriceStrategy) {
  let amount, baseToken, quoteToken

  if (order.kind === 'sell') {
    // this order sell amount is sellAmountAfterFees
    // this is an issue as it will be adjusted again in the backend
    // e.g order submitted w/sellAmount adjusted for fee: 995, we re-query 995
    // e.g backend adjusts for fee again, 990 is used. We need to avoid double fee adjusting
    // e.g so here we need to pass the sellAmountBeforeFees
    amount = order.sellAmountBeforeFee.toString()
    baseToken = order.sellToken
    quoteToken = order.buyToken
  } else {
    amount = order.buyAmount.toString()
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
  const { chainId: _chainId, account } = useWalletInfo()
  const chainId = supportedChainId(_chainId)
  const updatePendingOrderPrices = useUpdateAtom(updatePendingOrderPricesAtom)
  const isWindowVisible = useIsWindowVisible()

  const pending = usePendingOrders({ chainId })
  const setIsOrderUnfillable = useSetIsOrderUnfillable()
  // check which GP Quote API to use (NEW/LEGACY)
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
      executionPrice: Price<Currency, Currency>
    ) => {
      if (!fee?.amount) return

      updatePendingOrderPrices({
        orderId: order.id,
        data: {
          lastUpdateTimestamp: Date.now(),
          marketPrice,
          executionPrice,
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

      const executionPrice = getOrderExecutionPrice(order, price.amount, fee.amount)
      const marketPrice = getOrderMarketPrice(order, price.amount, fee.amount)
      const isUnfillable = isOrderUnfillable(order, orderPrice, executionPrice)

      // Only trigger state update if flag changed
      if (order.isUnfillable !== isUnfillable) {
        setIsOrderUnfillable({ chainId, id: order.id, isUnfillable })

        // order.isUnfillable by default is undefined, so we don't want to dispatch this in that case
        if (typeof order.isUnfillable !== 'undefined' && order.class !== OrderClass.LIMIT) {
          const label = `${order.inputToken.symbol}, ${order.outputToken.symbol}`
          priceOutOfRangeAnalytics(isUnfillable, label)
        }
      }

      updateOrderMarketPriceCallback(order, fee, marketPrice, executionPrice)
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
              `[UnfillableOrdersUpdater::updateUnfillable] Failed to get quote on chain ${chainId} for order ${order?.id}`
            )
            console.debug(e)
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
