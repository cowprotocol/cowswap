import { useCallback, useEffect, useRef } from 'react'

import { useActiveWeb3React } from 'hooks/web3'

import { usePendingOrders, useSetIsOrderUnfillable } from 'state/orders/hooks'
import { Order } from 'state/orders/actions'
import { PENDING_ORDERS_PRICE_CHECK_POLL_INTERVAL } from 'state/orders/consts'

import { SupportedChainId as ChainId } from 'constants/chains'

import { getBestPrice, PriceInformation } from 'utils/price'
import { isOrderUnfillable } from 'state/orders/utils'

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
 * Updater that checks whether pending orders are still "fillable"
 */
export function UnfillableOrdersUpdater(): null {
  const { chainId, account } = useActiveWeb3React()
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
    if (!chainId || !account) {
      return
    }

    const lowerCaseAccount = account.toLowerCase()
    // Only check pending orders of the connected account
    const pending = pendingRef.current.filter(({ owner }) => owner.toLowerCase() === lowerCaseAccount)

    if (pending.length === 0) {
      return
    }

    pending.forEach((order, index) =>
      _getOrderPrice(chainId, order).then((price) => {
        console.debug(
          `[UnfillableOrdersUpdater::updateUnfillable] did we get any price? ${order.id.slice(0, 8)}|${index}`,
          price ? price.amount : 'no :('
        )
        price?.amount && updateIsUnfillableFlag(chainId, order, price)
      })
    )
  }, [account, chainId, updateIsUnfillableFlag])

  useEffect(() => {
    updatePending()

    const interval = setInterval(updatePending, PENDING_ORDERS_PRICE_CHECK_POLL_INTERVAL)

    return () => clearInterval(interval)
  }, [updatePending])

  return null
}
