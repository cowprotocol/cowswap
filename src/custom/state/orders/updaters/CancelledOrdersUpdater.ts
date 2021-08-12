import { useCallback, useEffect, useRef } from 'react'

import { useActiveWeb3React } from 'hooks/web3'

import { useCancelledOrders, useFulfillOrdersBatch } from 'state/orders/hooks'
import { ApiOrderStatus } from 'state/orders/utils'
import { OrderFulfillmentData } from 'state/orders/actions'
import { OPERATOR_API_POLL_INTERVAL } from 'state/orders/consts'

import { SupportedChainId as ChainId } from 'constants/chains'
import { CANCELLED_ORDERS_PENDING_TIME } from 'constants/index'

import { fetchOrderPopupData, OrderLogPopupMixData } from 'state/orders/updaters/utils'

/**
 * Updater for cancelled orders.
 *
 * Similar to Event updater, but instead of watching pending orders, it watches orders that have been cancelled
 * in the last 5 min.
 *
 * Whenever an order that was cancelled but has since been fulfilled, trigger a state update
 * and a popup notification, changing the status from cancelled to fulfilled.
 *
 * It's supposed to fix race conditions between the api accepting a cancellation while a solution was already
 * submitted to the network by a solver.
 * Due to the network's nature, we can't tell whether an order has been really cancelled, so we prefer to wait a short
 * period and say it's cancelled even though in some cases it might actually be filled.
 */
export function CancelledOrdersUpdater(): null {
  const { chainId } = useActiveWeb3React()

  const cancelled = useCancelledOrders({ chainId })

  // Ref, so we don't rerun useEffect
  const cancelledRef = useRef(cancelled)
  cancelledRef.current = cancelled

  const fulfillOrdersBatch = useFulfillOrdersBatch()

  const updateOrders = useCallback(
    async (chainId: ChainId) => {
      // Filter orders created in the last 5 min, no further
      const pending = cancelledRef.current.filter(
        (order) => Date.now() - new Date(order.creationTime).getTime() < CANCELLED_ORDERS_PENDING_TIME
      )

      if (pending.length === 0) {
        return
      }

      // Iterate over pending orders fetching operator order data, async
      const unfilteredOrdersData = await Promise.all(
        pending.map(async (orderFromStore) => fetchOrderPopupData(orderFromStore, chainId))
      )

      // Group resolved promises by status
      // Only pick fulfilled
      const { fulfilled } = unfilteredOrdersData.reduce<Record<ApiOrderStatus, OrderLogPopupMixData[]>>(
        (acc, { status, popupData }) => {
          popupData && acc[status].push(popupData)
          return acc
        },
        { fulfilled: [], expired: [], cancelled: [], unknown: [], pending: [] }
      )

      // Bach state update fulfilled orders, if any
      fulfilled.length > 0 &&
        fulfillOrdersBatch({
          ordersData: fulfilled as OrderFulfillmentData[],
          chainId,
        })
    },
    [fulfillOrdersBatch]
  )

  useEffect(() => {
    if (!chainId) {
      return
    }

    const interval = setInterval(() => updateOrders(chainId), OPERATOR_API_POLL_INTERVAL)

    return () => clearInterval(interval)
  }, [chainId, updateOrders])

  return null
}
