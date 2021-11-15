import { useCallback, useEffect, useRef } from 'react'

import { useActiveWeb3React } from 'hooks/web3'

import {
  useCancelOrdersBatch,
  useExpireOrdersBatch,
  useFulfillOrdersBatch,
  usePresignOrders,
  usePendingOrders,
  FulfillOrdersBatchCallback,
  ExpireOrdersBatchCallback,
  CancelOrdersBatchCallback,
  PresignOrdersCallback,
  useUpdatePresignGnosisSafeTx,
  UpdatePresignGnosisSafeTxCallback,
} from 'state/orders/hooks'
import { OrderTransitionStatus } from 'state/orders/utils'
import { Order, OrderFulfillmentData, OrderStatus } from 'state/orders/actions'
import { OPERATOR_API_POLL_INTERVAL } from 'state/orders/consts'

import { SupportedChainId as ChainId } from 'constants/chains'

import { OrderID } from 'api/gnosisProtocol'

import { fetchOrderPopupData, OrderLogPopupMixData } from 'state/orders/updaters/utils'
import { GetSafeInfo, useGetSafeInfo } from 'hooks/useGetSafeInfo'

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

/**
 *
 * Update the presign Gnosis Safe Tx information (if applies)
 *
 * @param allPendingOrders
 * @param signedOrdersIds
 * @returns
 */
async function _updatePresignGnosisSafeTx(
  chainId: ChainId,
  allPendingOrders: Order[],
  getSafeInfo: GetSafeInfo,
  updatePresignGnosisSafeTx: UpdatePresignGnosisSafeTxCallback
) {
  const getSafeTxPromises = allPendingOrders
    // Update orders that are pending for presingature
    .filter((order) => order.presignGnosisSafeTxHash && order.status === OrderStatus.PRESIGNATURE_PENDING)
    .map((order): Promise<void> => {
      // Get safe info and receipt
      const presignGnosisSafeTxHash = order.presignGnosisSafeTxHash as string
      console.log('[PendingOrdersUpdater] Get Gnosis Transaction info for tx:', presignGnosisSafeTxHash)

      const { promise: safeTransactionPromise } = getSafeInfo(presignGnosisSafeTxHash)

      // Get safe info
      return safeTransactionPromise
        .then((safeTransaction) => {
          console.log('[PendingOrdersUpdater] Update Gnosis Safe transaction info: ', safeTransaction)
          updatePresignGnosisSafeTx({ orderId: order.id, chainId, safeTransaction })
        })
        .catch((error) => {
          if (!error.isCancelledError) {
            console.error(
              `[PendingOrdersUpdater] Failed to check Gnosis Safe tx hash: ${presignGnosisSafeTxHash}`,
              error
            )
          }
        })
    })

  await Promise.all(getSafeTxPromises)
}

interface UpdateOrdersParams {
  account: string
  chainId: ChainId
  orders: Order[]

  // Actions
  fulfillOrdersBatch: FulfillOrdersBatchCallback
  expireOrdersBatch: ExpireOrdersBatchCallback
  cancelOrdersBatch: CancelOrdersBatchCallback
  presignOrders: PresignOrdersCallback
  updatePresignGnosisSafeTx: UpdatePresignGnosisSafeTxCallback
  getSafeInfo: GetSafeInfo
}

async function _updateOrders({
  account,
  chainId,
  orders,

  // Actions
  fulfillOrdersBatch,
  expireOrdersBatch,
  cancelOrdersBatch,
  presignOrders,
  updatePresignGnosisSafeTx,
  getSafeInfo,
}: UpdateOrdersParams): Promise<void> {
  // Only check pending orders of current connected account
  const lowerCaseAccount = account.toLowerCase()
  const pending = orders.filter(({ owner }) => owner.toLowerCase() === lowerCaseAccount)

  // Exit early when there are no pending orders
  if (pending.length === 0) {
    return
  }

  // Iterate over pending orders fetching API data
  const unfilteredOrdersData = await Promise.all(
    pending.map(async (orderFromStore) => fetchOrderPopupData(orderFromStore, chainId))
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
    const ordersPresignaturePendingSigned = _getNewlyPreSignedOrders(orders, presignedOrderIds)

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

  // Update the presign Gnosis Safe Tx info (if applies)}
  await _updatePresignGnosisSafeTx(chainId, orders, getSafeInfo, updatePresignGnosisSafeTx)
}

export function PendingOrdersUpdater(): null {
  const { chainId, account } = useActiveWeb3React()

  const pending = usePendingOrders({ chainId })

  // Ref, so we don't rerun useEffect
  const pendingRef = useRef(pending)
  pendingRef.current = pending

  const fulfillOrdersBatch = useFulfillOrdersBatch()
  const expireOrdersBatch = useExpireOrdersBatch()
  const cancelOrdersBatch = useCancelOrdersBatch()
  const presignOrders = usePresignOrders()
  const updatePresignGnosisSafeTx = useUpdatePresignGnosisSafeTx()
  const getSafeInfo = useGetSafeInfo()

  const updateOrders = useCallback(
    async (chainId: ChainId, account: string) => {
      if (!account) {
        return []
      }

      return _updateOrders({
        account,
        chainId,
        orders: pendingRef.current,
        fulfillOrdersBatch,
        expireOrdersBatch,
        cancelOrdersBatch,
        presignOrders,
        updatePresignGnosisSafeTx,
        getSafeInfo,
      })
    },
    [cancelOrdersBatch, updatePresignGnosisSafeTx, expireOrdersBatch, fulfillOrdersBatch, presignOrders, getSafeInfo]
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
