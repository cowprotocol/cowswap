import { useCallback, useEffect, useRef } from 'react'

import { useActiveWeb3React } from 'hooks/web3'

import { useCancelledOrders, useFulfillOrdersBatch } from 'state/orders/hooks'
import { OrderTransitionStatus } from 'state/orders/utils'
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
  const { chainId, account } = useActiveWeb3React()

  const cancelled = useCancelledOrders({ chainId })

  // Ref, so we don't rerun useEffect
  const cancelledRef = useRef(cancelled)
  const isUpdating = useRef(false) // TODO: Implement using SWR or retry/cancellable promises
  cancelledRef.current = cancelled

  const fulfillOrdersBatch = useFulfillOrdersBatch()

  const updateOrders = useCallback(
    async (chainId: ChainId, account: string) => {
      const lowerCaseAccount = account.toLowerCase()
      const now = Date.now()

      if (isUpdating.current) {
        return
      }

      // const startTime = Date.now()
      // console.debug('[CancelledOrdersUpdater] Checking recently canceled orders....')
      try {
        isUpdating.current = true

        // Filter orders:
        // - Owned by the current connected account
        // - Created in the last 5 min, no further
        const pending = cancelledRef.current.filter(({ owner, creationTime: creationTimeString }) => {
          const creationTime = new Date(creationTimeString).getTime()

          return owner.toLowerCase() === lowerCaseAccount && now - creationTime < CANCELLED_ORDERS_PENDING_TIME
        })

        if (pending.length === 0) {
          // console.debug(`[CancelledOrdersUpdater] No orders are being cancelled`)
          return
        } /* else {
          console.debug(`[CancelledOrdersUpdater] Checking ${pending.length} recently canceled orders...`)
        }*/

        // Iterate over pending orders fetching operator order data, async
        const unfilteredOrdersData = await Promise.all(
          pending.map(async (orderFromStore) => fetchOrderPopupData(orderFromStore, chainId))
        )

        // Group resolved promises by status
        // Only pick fulfilled
        const { fulfilled } = unfilteredOrdersData.reduce<Record<OrderTransitionStatus, OrderLogPopupMixData[]>>(
          (acc, orderData) => {
            if (orderData && orderData.popupData) {
              acc[orderData.status].push(orderData.popupData)
            }
            return acc
          },
          {
            fulfilled: [],
            presigned: [],
            expired: [],
            cancelled: [],
            unknown: [],
            presignaturePending: [],
            pending: [],
          }
        )

        // Bach state update fulfilled orders, if any
        fulfilled.length > 0 &&
          fulfillOrdersBatch({
            ordersData: fulfilled as OrderFulfillmentData[],
            chainId,
          })
      } finally {
        isUpdating.current = false
        // console.debug(`[CancelledOrdersUpdater] Checked recently canceled orders in ${Date.now() - startTime}ms`)
      }
    },
    [fulfillOrdersBatch]
  )

  useEffect(() => {
    if (!chainId || !account) {
      return
    }

    const interval = setInterval(() => updateOrders(chainId, account), OPERATOR_API_POLL_INTERVAL)

    return () => clearInterval(interval)
  }, [account, chainId, updateOrders])

  return null
}
