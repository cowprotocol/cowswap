import { useCallback, useEffect, useRef } from 'react'

import { useActiveWeb3React } from 'hooks/web3'

import { useCancelOrdersBatch, useExpireOrdersBatch, useFulfillOrdersBatch, usePendingOrders } from 'state/orders/hooks'
import { ApiOrderStatus } from 'state/orders/utils'
import { OrderFulfillmentData } from 'state/orders/actions'
import { OPERATOR_API_POLL_INTERVAL } from 'state/orders/consts'

import { SupportedChainId as ChainId } from 'constants/chains'

import { OrderID } from 'utils/operator'

import { fetchOrderPopupData, OrderLogPopupMixData } from 'state/orders/updaters/utils'

export function PendingOrdersUpdater(): null {
  const { chainId } = useActiveWeb3React()

  const pending = usePendingOrders({ chainId })

  // Ref, so we don't rerun useEffect
  const pendingRef = useRef(pending)
  pendingRef.current = pending

  const fulfillOrdersBatch = useFulfillOrdersBatch()
  const expireOrdersBatch = useExpireOrdersBatch()
  const cancelOrdersBatch = useCancelOrdersBatch()

  const updateOrders = useCallback(
    async (chainId: ChainId) => {
      // Exit early when there are no pending orders
      if (pendingRef.current.length === 0) {
        return
      }

      // Iterate over pending orders fetching operator order data, async
      const unfilteredOrdersData = await Promise.all(
        pendingRef.current.map(async (orderFromStore) => fetchOrderPopupData(orderFromStore, chainId))
      )

      // Group resolved promises by status
      // Only pick the status that are final
      const { fulfilled, expired, cancelled } = unfilteredOrdersData.reduce<
        Record<ApiOrderStatus, OrderLogPopupMixData[]>
      >(
        (acc, { status, popupData }) => {
          popupData && acc[status].push(popupData)
          return acc
        },
        { fulfilled: [], expired: [], cancelled: [], unknown: [], pending: [] }
      )

      // Bach state update per group, if any

      fulfilled.length > 0 &&
        fulfillOrdersBatch({
          ordersData: fulfilled as OrderFulfillmentData[],
          chainId,
        })
      expired.length > 0 &&
        expireOrdersBatch({
          ids: expired as OrderID[],
          chainId,
        })
      cancelled.length > 0 &&
        cancelOrdersBatch({
          ids: cancelled as OrderID[],
          chainId,
        })
    },
    [cancelOrdersBatch, expireOrdersBatch, fulfillOrdersBatch]
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
