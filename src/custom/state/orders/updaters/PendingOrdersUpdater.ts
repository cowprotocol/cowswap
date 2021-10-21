import { useCallback, useEffect, useRef } from 'react'

import { useActiveWeb3React } from 'hooks/web3'

import {
  useCancelOrdersBatch,
  useExpireOrdersBatch,
  useFulfillOrdersBatch,
  usePresignOrders,
  usePendingOrders,
} from 'state/orders/hooks'
import { OrderTransitionStatus } from 'state/orders/utils'
import { Order, OrderFulfillmentData, OrderStatus } from 'state/orders/actions'
import { OPERATOR_API_POLL_INTERVAL } from 'state/orders/consts'

import { SupportedChainId as ChainId } from 'constants/chains'

import { OrderID } from 'api/gnosisProtocol'

import { fetchOrderPopupData, OrderLogPopupMixData } from 'state/orders/updaters/utils'

/**
 * Return the ids of the orders that we are not yet aware that are signed.
 * This is, pre-sign orders, in state of "PRESIGNATURE_PENDING", for which we now know they are signed
 *
 * Used as an auxiliar method to detect which orders we should mark as pre-signed, so we change their state
 *
 * @param allPendingOrders All pending orders
 * @param signedOrdersIds ids of orders we know are already pre-signed
 * @returns ids of the pending orders that were pending for pre-sign, and we now know are pre-signed
 */
function _getNewlyPreSignedOrders(allPendingOrders: Order[], signedOrdersIds: OrderID[]) {
  return allPendingOrders
    .filter((order) => order.status === OrderStatus.PRESIGNATURE_PENDING && signedOrdersIds.includes(order.id))
    .map((order) => order.id)
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
  const presignOrders = usePresignOrders()

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
        { fulfilled: [], presigned: [], expired: [], cancelled: [], unknown: [], presignaturePending: [], pending: [] }
      )

      if (presigned.length > 0) {
        // Only mark as presigned the orders we were not aware of their new state
        const presignedOrderIds = presigned as OrderID[]
        const ordersPresignaturePendingSigned = _getNewlyPreSignedOrders(pendingRef.current, presignedOrderIds)

        if (ordersPresignaturePendingSigned.length > 0) {
          presignOrders({
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
    [cancelOrdersBatch, expireOrdersBatch, fulfillOrdersBatch, presignOrders]
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
