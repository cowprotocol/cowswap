import { useSetAtom } from 'jotai'
import { useCallback, useEffect, useMemo, useRef } from 'react'

import {
  getExplorerOrderLink,
  isOrderInPendingTooLong,
  timeSinceInSeconds,
  triggerAppziSurvey,
} from '@cowprotocol/common-utils'
import { EnrichedOrder, EthflowData, SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { Command, UiOrderType } from '@cowprotocol/types'
import { useIsSafeWallet, useWalletInfo } from '@cowprotocol/wallet'

import { GetSafeInfo, useGetSafeInfo } from 'legacy/hooks/useGetSafeInfo'
import { FulfillOrdersBatchParams, Order, OrderStatus } from 'legacy/state/orders/actions'
import { LIMIT_OPERATOR_API_POLL_INTERVAL, MARKET_OPERATOR_API_POLL_INTERVAL } from 'legacy/state/orders/consts'
import {
  AddOrUpdateOrdersCallback,
  CancelOrdersBatchCallback,
  ExpireOrdersBatchCallback,
  FulfillOrdersBatchCallback,
  PresignOrdersCallback,
  UpdatePresignGnosisSafeTxCallback,
  useAddOrUpdateOrders,
  useCancelOrdersBatch,
  useCombinedPendingOrders,
  useExpireOrdersBatch,
  useFulfillOrdersBatch,
  usePresignOrders,
  useUpdatePresignGnosisSafeTx,
} from 'legacy/state/orders/hooks'
import { OrderTransitionStatus } from 'legacy/state/orders/utils'

import { emitFulfilledOrderEvent } from 'modules/orders'
import { useAddOrderToSurplusQueue } from 'modules/swap/state/surplusModal'

import { getOrder } from 'api/gnosisProtocol'
import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'

import { fetchOrderPopupData } from './utils'

import { removeOrdersToCancelAtom } from '../../hooks/useMultipleOrdersCancellation/state'
import { useTriggerTotalSurplusUpdateCallback } from '../../state/totalSurplusState'

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
function _getNewlyPreSignedOrders(allPendingOrders: Order[], signedOrdersIds: string[]) {
  return allPendingOrders
    .filter((order) => order.status === OrderStatus.PRESIGNATURE_PENDING && signedOrdersIds.includes(order.id))
    .map((order) => order.id)
}

/**
 *
 * Update the presign Gnosis Safe Tx information (if applies)
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

async function _updateCreatingOrders(
  chainId: ChainId,
  pendingOrders: Order[],
  isSafeWallet: boolean,
  addOrUpdateOrders: AddOrUpdateOrdersCallback
): Promise<void> {
  const promises = pendingOrders.reduce<Promise<void>[]>((acc, order) => {
    if (order.status === OrderStatus.CREATING) {
      // Filter only EthFlow orders in creating state

      const promise = getOrder(chainId, order.id)
        .then((orderData) => {
          console.debug(`[PendingOrdersUpdater] ETH FLOW order ${order.id} fetched from API!!!`, orderData)
          if (!orderData) {
            return
          }
          // Hack, because Swagger doesn't have isRefunded property and backend is going to delete it soon
          const ethflowData: (EthflowData & { isRefunded?: boolean }) | undefined = orderData.ethflowData

          const updatedOrder = {
            ...order,
            validTo: orderData.ethflowData?.userValidTo || order.validTo,
            isRefunded: ethflowData?.isRefunded,
            refundHash: ethflowData?.refundTxHash || undefined,
            openSince: Date.now(),
            status: OrderStatus.PENDING, // seen once, can be moved to pending bucket
            apiAdditionalInfo: orderData,
          }
          addOrUpdateOrders({ chainId, orders: [updatedOrder], isSafeWallet })
        })
        .catch((error) => {
          // Nothing to do here, keep waiting until the order shows up
          console.debug(`[PendingOrdersUpdater] ETH FLOW order ${order.id} couldn't be fetched from API`, error)
        })

      acc.push(promise)
    }

    return acc
  }, [])

  await Promise.all(promises)
}

interface UpdateOrdersParams {
  chainId: ChainId
  account: string
  isSafeWallet: boolean
  orders: Order[]
  // Actions
  addOrUpdateOrders: AddOrUpdateOrdersCallback
  fulfillOrdersBatch: FulfillOrdersBatchCallback
  expireOrdersBatch: ExpireOrdersBatchCallback
  cancelOrdersBatch: CancelOrdersBatchCallback
  presignOrders: PresignOrdersCallback
  addOrderToSurplusQueue: (orderId: string) => void
  triggerTotalSurplusUpdate: Command | null
  updatePresignGnosisSafeTx: UpdatePresignGnosisSafeTxCallback
  getSafeInfo: GetSafeInfo
}

async function _updateOrders({
  account,
  chainId,
  orders,
  isSafeWallet,
  // Actions
  addOrUpdateOrders,
  fulfillOrdersBatch,
  expireOrdersBatch,
  cancelOrdersBatch,
  presignOrders,
  addOrderToSurplusQueue,
  triggerTotalSurplusUpdate,
  updatePresignGnosisSafeTx,
  getSafeInfo,
}: UpdateOrdersParams): Promise<void> {
  // Only check pending orders of current connected account
  const lowerCaseAccount = account.toLowerCase()
  const pending = orders.filter(({ owner }) => owner.toLowerCase() === lowerCaseAccount)

  // Exit early when there are no pending orders
  if (!pending.length) {
    return
  } else {
    _triggerNps(pending, chainId)
  }

  // Iterate over pending orders fetching API data
  const unfilteredOrdersData = await Promise.all(
    pending.map(async (orderFromStore) => fetchOrderPopupData(orderFromStore, chainId))
  )

  // Group resolved promises by status
  // Only pick the status that are final
  const { fulfilled, expired, cancelled, presigned } = unfilteredOrdersData.reduce<
    Record<OrderTransitionStatus, EnrichedOrder[]>
  >(
    (acc, orderData) => {
      if (orderData && orderData.order) {
        acc[orderData.status].push(orderData.order)
      }
      return acc
    },
    { fulfilled: [], expired: [], cancelled: [], unknown: [], presigned: [], pending: [], presignaturePending: [] }
  )

  if (presigned.length > 0) {
    // Only mark as presigned the orders we were not aware of their new state
    const presignedOrderIds = presigned.map(({ uid }) => uid)
    const ordersPresignaturePendingSigned = _getNewlyPreSignedOrders(orders, presignedOrderIds)

    if (ordersPresignaturePendingSigned.length > 0) {
      presignOrders({
        ids: ordersPresignaturePendingSigned,
        chainId,
        isSafeWallet,
      })
    }
  }

  if (expired.length > 0) {
    expireOrdersBatch({
      ids: expired.map(({ uid }) => uid),
      chainId,
      isSafeWallet,
    })
  }

  if (cancelled.length > 0) {
    cancelOrdersBatch({
      ids: cancelled.map(({ uid }) => uid),
      chainId,
      isSafeWallet,
    })
  }

  if (fulfilled.length > 0) {
    // update redux state
    fulfillOrdersBatch({
      orders: fulfilled,
      chainId,
      isSafeWallet,
    })
    // add to surplus queue
    fulfilled.forEach(({ uid, fullAppData, class: orderClass }) => {
      if (getUiOrderType({ fullAppData, class: orderClass }) === UiOrderType.SWAP) {
        addOrderToSurplusQueue(uid)
      }
    })
    // trigger total surplus update
    triggerTotalSurplusUpdate?.()
  }

  // Update the presign Gnosis Safe Tx info (if applies)
  await _updatePresignGnosisSafeTx(chainId, orders, getSafeInfo, updatePresignGnosisSafeTx)
  // Update the creating EthFlow orders (if any)
  await _updateCreatingOrders(chainId, orders, isSafeWallet, addOrUpdateOrders)
}

// Check if there is any order pending for a long time
// If so, trigger appzi
function _triggerNps(pending: Order[], chainId: ChainId) {
  for (const order of pending) {
    const { openSince, id: orderId } = order
    const orderType = getUiOrderType(order)
    // Check if there's any SWAP pending for more than `PENDING_TOO_LONG_TIME`
    if (orderType === UiOrderType.SWAP && isOrderInPendingTooLong(openSince)) {
      const explorerUrl = getExplorerOrderLink(chainId, orderId)
      // Trigger NPS display, controlled by Appzi
      triggerAppziSurvey({
        waitedTooLong: true,
        secondsSinceOpen: timeSinceInSeconds(openSince),
        explorerUrl,
        chainId,
        orderType,
      })
      // Break the loop, don't need to show more than once
      break
    }
  }
}

export function PendingOrdersUpdater(): null {
  const isSafeWallet = useIsSafeWallet()
  const { chainId, account } = useWalletInfo()
  const removeOrdersToCancel = useSetAtom(removeOrdersToCancelAtom)

  const pending = useCombinedPendingOrders({ chainId, account })
  // TODO: Implement using SWR or retry/cancellable promises
  const isUpdatingMarket = useRef(false)
  const isUpdatingLimit = useRef(false)
  const isUpdatingTwap = useRef(false)

  const updatersRefMap = useMemo(
    () => ({
      [UiOrderType.SWAP]: isUpdatingMarket,
      [UiOrderType.LIMIT]: isUpdatingLimit,
      [UiOrderType.TWAP]: isUpdatingTwap,
    }),
    []
  )

  // Ref, so we don't rerun useEffect
  const pendingRef = useRef(pending)
  pendingRef.current = pending

  const _fulfillOrdersBatch = useFulfillOrdersBatch()
  const expireOrdersBatch = useExpireOrdersBatch()
  const cancelOrdersBatch = useCancelOrdersBatch()
  const addOrUpdateOrders = useAddOrUpdateOrders()
  const presignOrders = usePresignOrders()
  const addOrderToSurplusQueue = useAddOrderToSurplusQueue()
  const triggerTotalSurplusUpdate = useTriggerTotalSurplusUpdateCallback()
  const updatePresignGnosisSafeTx = useUpdatePresignGnosisSafeTx()
  const getSafeInfo = useGetSafeInfo()

  const fulfillOrdersBatch = useCallback(
    (fulfillOrdersBatchParams: FulfillOrdersBatchParams) => {
      _fulfillOrdersBatch(fulfillOrdersBatchParams)

      fulfillOrdersBatchParams.orders.forEach((order) => {
        emitFulfilledOrderEvent(order, chainId)
      })

      // Remove orders from the cancelling queue (marked by checkbox in the orders table)
      removeOrdersToCancel(fulfillOrdersBatchParams.orders.map(({ uid }) => uid))
    },
    [chainId, _fulfillOrdersBatch, removeOrdersToCancel]
  )

  const updateOrders = useCallback(
    async (chainId: ChainId, account: string, isSafeWallet: boolean, uiOrderType: UiOrderType) => {
      if (!account) {
        return []
      }

      const isUpdating = updatersRefMap[uiOrderType]

      if (!isUpdating.current) {
        isUpdating.current = true
        return _updateOrders({
          account,
          chainId,
          isSafeWallet,
          orders: pendingRef.current.filter((order) => getUiOrderType(order) === uiOrderType),
          addOrUpdateOrders,
          fulfillOrdersBatch,
          expireOrdersBatch,
          cancelOrdersBatch,
          presignOrders,
          addOrderToSurplusQueue,
          triggerTotalSurplusUpdate,
          updatePresignGnosisSafeTx,
          getSafeInfo,
        }).finally(() => {
          isUpdating.current = false
        })
      }
    },
    [
      updatersRefMap,
      addOrUpdateOrders,
      fulfillOrdersBatch,
      expireOrdersBatch,
      cancelOrdersBatch,
      presignOrders,
      addOrderToSurplusQueue,
      triggerTotalSurplusUpdate,
      updatePresignGnosisSafeTx,
      getSafeInfo,
    ]
  )

  useEffect(() => {
    if (!chainId || !account) {
      return
    }

    const marketInterval = setInterval(
      () => updateOrders(chainId, account, isSafeWallet, UiOrderType.SWAP),
      MARKET_OPERATOR_API_POLL_INTERVAL
    )
    const limitInterval = setInterval(
      () => updateOrders(chainId, account, isSafeWallet, UiOrderType.LIMIT),
      LIMIT_OPERATOR_API_POLL_INTERVAL
    )
    const twapInterval = setInterval(
      () => updateOrders(chainId, account, isSafeWallet, UiOrderType.TWAP),
      LIMIT_OPERATOR_API_POLL_INTERVAL
    )

    updateOrders(chainId, account, isSafeWallet, UiOrderType.SWAP)
    updateOrders(chainId, account, isSafeWallet, UiOrderType.LIMIT)
    updateOrders(chainId, account, isSafeWallet, UiOrderType.TWAP)

    return () => {
      clearInterval(marketInterval)
      clearInterval(limitInterval)
      clearInterval(twapInterval)
    }
  }, [account, chainId, isSafeWallet, updateOrders])

  return null
}
