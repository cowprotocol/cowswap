import { useCallback, useEffect, useRef } from 'react'
import { timestamp } from '@gnosis.pm/gp-v2-contracts'

import { useActiveWeb3React } from 'hooks/web3'

import { usePendingOrders, useSetIsOrderUnfillable } from 'state/orders/hooks'
import { Order } from 'state/orders/actions'
import { PENDING_ORDERS_PRICE_CHECK_POLL_INTERVAL } from 'state/orders/consts'

import { SupportedChainId as ChainId } from 'constants/chains'

import { getBestQuote, PriceInformation } from 'utils/price'
import { isOrderUnfillable } from 'state/orders/utils'
import useGetGpPriceStrategy, { GpPriceStrategy } from 'hooks/useGetGpPriceStrategy'
import { getPromiseFulfilledValue } from 'utils/misc'

/**
 * Thin wrapper around `getBestPrice` that builds the params and returns null on failure
 *
 * @param chainId
 * @param order
 */
async function _getOrderPrice(chainId: ChainId, order: Order, strategy: GpPriceStrategy) {
  let amount, baseToken, quoteToken

  if (order.kind === 'sell') {
    // this order sell amount is sellAmountAfterFees..
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

  const quoteParams = {
    chainId,
    amount,
    kind: order.kind,
    sellToken: order.sellToken,
    buyToken: order.buyToken,
    baseToken,
    quoteToken,
    fromDecimals: order.inputToken.decimals,
    toDecimals: order.outputToken.decimals,
    validTo: timestamp(order.validTo),
  }
  // console.debug('[UNFILLABLE]::BEFORE PRICE::', quoteParams.amount)
  try {
    // if (order.kind === 'sell') {
    //   // we need to calculate the fee separately to add to the sellAmount here
    //   const { quote } = await getQuote(quoteParams)
    //   const { feeAmount } = quote
    //   quoteParams.amount = BigNumber.from(quoteParams.amount).add(BigNumber.from(feeAmount)).toString()
    //   console.debug('[UNFILLABLE]::AFTER PRICE::', quoteParams.amount)
    // }
    return getBestQuote({ strategy, quoteParams, fetchFee: false, isPriceRefresh: false })
  } catch (e) {
    return null
  }
}

/**
 * Updater that checks whether pending orders are still "fillable"
 */
export function UnfillableOrdersUpdater(): null {
  const { chainId, account } = useActiveWeb3React()
  const pending = usePendingOrders({ chainId })
  const setIsOrderUnfillable = useSetIsOrderUnfillable()
  // check which GP Quote API to use (NEW/LEGACY)
  const strategy = useGetGpPriceStrategy()

  // Ref, so we don't rerun useEffect
  const pendingRef = useRef(pending)
  pendingRef.current = pending
  const isUpdating = useRef(false) // TODO: Implement using SWR or retry/cancellable promises

  const updateIsUnfillableFlag = useCallback(
    (chainId: ChainId, order: Order, price: Required<PriceInformation>) => {
      const isUnfillable = isOrderUnfillable(order, price)

      // Only trigger state update if flag changed
      order.isUnfillable !== isUnfillable && setIsOrderUnfillable({ chainId, id: order.id, isUnfillable })
    },
    [setIsOrderUnfillable]
  )

  const updatePending = useCallback(() => {
    if (!chainId || !account || isUpdating.current) {
      return
    }

    const startTime = Date.now()
    console.debug('[UnfillableOrdersUpdater] Checking new market price for orders....')
    try {
      isUpdating.current = true

      const lowerCaseAccount = account.toLowerCase()
      // Only check pending orders of the connected account
      const pending = pendingRef.current.filter(({ owner }) => owner.toLowerCase() === lowerCaseAccount)

      if (pending.length === 0) {
        // console.debug('[UnfillableOrdersUpdater] No orders to update')
        return
      } else {
        console.debug(
          `[UnfillableOrdersUpdater] Checking new market price for ${pending.length} orders, account ${account} and network ${chainId}`
        )
      }

      pending.forEach((order, index) =>
        _getOrderPrice(chainId, order, strategy).then((quote) => {
          if (quote) {
            const [promisedPrice] = quote
            const price = getPromiseFulfilledValue(promisedPrice, null)
            console.debug(
              `[UnfillableOrdersUpdater::updateUnfillable] did we get any price? ${order.id.slice(0, 8)}|${index}`,
              price ? price.amount : 'no :('
            )
            price?.amount && updateIsUnfillableFlag(chainId, order, price)
          } else {
            console.debug('[UnfillableOrdersUpdater::updateUnfillable] No price quote for', order.id.slice(0, 8))
          }
        })
      )
    } finally {
      isUpdating.current = false
      console.debug(`[UnfillableOrdersUpdater] Checked canceled orders in ${Date.now() - startTime}ms`)
    }
  }, [account, chainId, strategy, updateIsUnfillableFlag])

  useEffect(() => {
    updatePending()

    const interval = setInterval(updatePending, PENDING_ORDERS_PRICE_CHECK_POLL_INTERVAL)

    return () => clearInterval(interval)
  }, [updatePending])

  return null
}
