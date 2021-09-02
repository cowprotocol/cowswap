import { useCallback, useEffect, useRef } from 'react'

import { useActiveWeb3React } from 'hooks/web3'

import {
  useCancelOrdersBatch,
  useExpireOrdersBatch,
  useFulfillOrdersBatch,
  useMarkOrdersAsPresigned,
  usePendingOrders,
} from 'state/orders/hooks'
import { OrderTransitionStatus } from 'state/orders/utils'
import { Order, OrderFulfillmentData, OrderStatus } from 'state/orders/actions'
import { OPERATOR_API_POLL_INTERVAL } from 'state/orders/consts'

import { SupportedChainId as ChainId } from 'constants/chains'

import { OrderID } from 'api/gnosisProtocol'

import { fetchOrderPopupData, OrderLogPopupMixData } from 'state/orders/updaters/utils'

/**
 * Return the ids od the orders that we are not yet aware that are signed.
 * This is, pre-sign orders, in state of "PRESIGNATURE_PENDING", for which we now know they are signed
 *
 * Used as an auxiliar method to detect which orders we should mark as pre-signed, so we change their state
 *
 * @param allPendingOrders All pending orders
 * @param signedOrdersIds ids of orders we know are already pre-signed
 * @returns ids of the pending orders that were pending for pre-sign, and we now know are pre-signed
 */
function _getPresignedOrdersStillWaiting(allPendingOrders: Order[], signedOrdersIds: OrderID[]) {
  const presignaturePendingIds = allPendingOrders
    .filter((order) => order.status === OrderStatus.PRESIGNATURE_PENDING)
    .map((order) => order.id)

  return signedOrdersIds.filter((order: OrderID) => presignaturePendingIds.includes(order))
}

export function PendingOrdersUpdater(): null {
  const { chainId } = useActiveWeb3React()

  const pending = usePendingOrders({ chainId })

  // Ref, so we don't rerun useEffect
  const pendingRef = useRef(pending)
  pendingRef.current = pending

  const fulfillOrdersBatch = useFulfillOrdersBatch()
  const expireOrdersBatch = useExpireOrdersBatch()
  const cancelOrdersBatch = useCancelOrdersBatch()
  const markOrdersAsPresigned = useMarkOrdersAsPresigned()

  const updateOrders = useCallback(
    async (chainId: ChainId) => {
      // Exit early when there are no pending orders
      if (pendingRef.current.length === 0) {
        return
      }

      // Iterate over pending orders fetching API data
      const unfilteredOrdersData = await Promise.all(
        pendingRef.current.map(async (orderFromStore) => fetchOrderPopupData(orderFromStore, chainId))
      )

      // Group resolved promises by status
      // Only pick the status that are final
      const { fulfilled, expired, cancelled, presigned } = unfilteredOrdersData.reduce<
        Record<OrderTransitionStatus, OrderLogPopupMixData[]>
      >(
        (acc, { status, popupData }) => {
          popupData && acc[status].push(popupData)
          return acc
        },
        { fulfilled: [], expired: [], cancelled: [], unknown: [], presigned: [], pending: [] }
      )

      if (presigned.length > 0) {
        // Only mark as presigned the orders we were not aware of their new state
        const presignedOrderIds = presigned as OrderID[]
        const ordersPresignaturePendingSigned = _getPresignedOrdersStillWaiting(pendingRef.current, presignedOrderIds)
        console.log({ presignedOrderIds, ordersPresignaturePendingSigned })

        if (ordersPresignaturePendingSigned.length > 0) {
          markOrdersAsPresigned({
            ids: ordersPresignaturePendingSigned,
            chainId,
          })
        }
      }

      if (expired.length > 0) {
        expireOrdersBatch({
          ids: expired as OrderID[],
          chainId,
        })
      }

      if (cancelled.length > 0) {
        cancelOrdersBatch({
          ids: cancelled as OrderID[],
          chainId,
        })
      }

      if (fulfilled.length > 0) {
        fulfillOrdersBatch({
          ordersData: fulfilled as OrderFulfillmentData[],
          chainId,
        })
      }
    },
    [cancelOrdersBatch, expireOrdersBatch, fulfillOrdersBatch, markOrdersAsPresigned]
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
