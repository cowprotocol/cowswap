/* eslint-disable no-restricted-imports */ // TODO: Don't use 'modules' import
import { useSetAtom } from 'jotai'
import { useCallback, useEffect, useMemo, useRef } from 'react'

import { getExplorerOrderLink, timeSinceInSeconds } from '@cowprotocol/common-utils'
import { EnrichedOrder, EthflowData, SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { Command, UiOrderType } from '@cowprotocol/types'
import { GnosisSafeInfo, useGnosisSafeInfo, useWalletInfo } from '@cowprotocol/wallet'

import { isOrderInPendingTooLong, triggerAppziSurvey } from 'appzi'
import { useBridgeOrdersSerializedMap } from 'entities/bridgeOrders'
import { useAddOrderToSurplusQueue } from 'entities/surplusModal'
import { useDispatch } from 'react-redux'

import { GetSafeTxInfo, useGetSafeTxInfo } from 'legacy/hooks/useGetSafeTxInfo'
import { AppDispatch } from 'legacy/state'
import { useAllTransactions } from 'legacy/state/enhancedTransactions/hooks'
import { CREATING_STATES, FulfillOrdersBatchParams, Order, OrderStatus } from 'legacy/state/orders/actions'
import { updateLastCheckedBlock } from 'legacy/state/orders/actions'
import { LIMIT_OPERATOR_API_POLL_INTERVAL, MARKET_OPERATOR_API_POLL_INTERVAL } from 'legacy/state/orders/consts'
import {
  AddOrUpdateOrdersCallback,
  CancelOrdersBatchCallback,
  ExpireOrdersBatchCallback,
  FulfillOrdersBatchCallback,
  InvalidateOrdersBatchCallback,
  PresignOrdersCallback,
  UpdatePresignGnosisSafeTxCallback,
  useAddOrUpdateOrders,
  useCancelOrdersBatch,
  useCombinedPendingOrders,
  useExpireOrdersBatch,
  useFulfillOrdersBatch,
  useInvalidateOrdersBatch,
  usePresignOrders,
  useUpdatePresignGnosisSafeTx,
} from 'legacy/state/orders/hooks'
import { OrderTransitionStatus } from 'legacy/state/orders/utils'

import {
  emitCancelledOrderEvent,
  emitExpiredOrderEvent,
  emitFulfilledOrderEvent,
  emitPresignedOrderEvent,
} from 'modules/orders'

import { getOrder } from 'api/cowProtocol'
import { getIsBridgeOrder } from 'common/utils/getIsBridgeOrder'
import { getUiOrderType } from 'utils/orderUtils/getUiOrderType'

import { fetchAndClassifyOrder } from './utils'

import { BridgeOrdersStateSerialized } from '../../../entities/bridgeOrders/state/bridgeOrdersAtom'
import { useBlockNumber } from '../../hooks/useBlockNumber'
import { removeOrdersToCancelAtom } from '../../hooks/useMultipleOrdersCancellation/state'
import { useTriggerTotalSurplusUpdateCallback } from '../../state/totalSurplusState'

/**
 *
 * Update the presign Gnosis Safe Tx information (if applies)
 */
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function _updatePresignGnosisSafeTx(
  chainId: ChainId,
  allPendingOrders: Order[],
  getSafeTxInfo: GetSafeTxInfo,
  updatePresignGnosisSafeTx: UpdatePresignGnosisSafeTxCallback,
  cancelOrdersBatch: CancelOrdersBatchCallback,
  safeInfo: GnosisSafeInfo | undefined,
) {
  const getSafeTxPromises = allPendingOrders
    // Update orders that are pending for presingature
    .filter((order) => order.presignGnosisSafeTxHash && order.status === OrderStatus.PRESIGNATURE_PENDING)
    .map((order): Promise<void> => {
      // Get safe info and receipt
      const presignGnosisSafeTxHash = order.presignGnosisSafeTxHash as string
      console.log('[PendingOrdersUpdater] Get Gnosis Transaction info for tx:', presignGnosisSafeTxHash)

      const { promise: safeTransactionPromise } = getSafeTxInfo(presignGnosisSafeTxHash)

      // Get safe info
      return safeTransactionPromise
        .then((safeTransaction) => {
          const safeNonce = safeInfo?.nonce

          /**
           * If an order has a nonce lower than the current Safe nonce, it means that the proposed transaction was replaced by another one.
           * In this case, we should cancel the order.
           */
          const isOrderTxReplaced = !!(safeNonce && safeTransaction.nonce < safeNonce && !safeTransaction.isExecuted)

          if (CREATING_STATES.includes(order.status) && isOrderTxReplaced) {
            cancelOrdersBatch({
              ids: [order.id],
              chainId,
              isSafeWallet: true,
            })

            console.warn('[PendingOrdersUpdater] Safe order tx was replaced, cancelling order:', order.id)
          } else {
            console.log('[PendingOrdersUpdater] Update Gnosis Safe transaction info: ', {
              orderId: order.id,
              safeTransaction,
            })
            updatePresignGnosisSafeTx({ orderId: order.id, chainId, safeTransaction })
          }
        })
        .catch((error) => {
          if (!error.isCancelledError) {
            console.error(
              `[PendingOrdersUpdater] Failed to check Gnosis Safe tx hash: ${presignGnosisSafeTxHash}`,
              error,
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
  addOrUpdateOrders: AddOrUpdateOrdersCallback,
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
  bridgeOrdersMap: BridgeOrdersStateSerialized
  orders: Order[]
  // Actions
  addOrUpdateOrders: AddOrUpdateOrdersCallback
  fulfillOrdersBatch: FulfillOrdersBatchCallback
  invalidateOrdersBatch: InvalidateOrdersBatchCallback
  expireOrdersBatch: ExpireOrdersBatchCallback
  cancelOrdersBatch: CancelOrdersBatchCallback
  presignOrders: PresignOrdersCallback
  addOrderToSurplusQueue: (orderId: string) => void
  triggerTotalSurplusUpdate: Command | null
  updatePresignGnosisSafeTx: UpdatePresignGnosisSafeTxCallback
  getSafeTxInfo: GetSafeTxInfo
  safeInfo: GnosisSafeInfo | undefined
  allTransactions: ReturnType<typeof useAllTransactions>
  markPollComplete?: (chainId: ChainId) => void
}

interface HandlePresignedParams {
  presigned: EnrichedOrder[]
  orders: Order[]
  bridgeOrdersMap: BridgeOrdersStateSerialized
  chainId: ChainId
  account: string
  isSafeWallet: boolean
  presignOrders: PresignOrdersCallback
}

function handlePresignedOrders({
  presigned,
  orders,
  bridgeOrdersMap,
  chainId,
  account,
  isSafeWallet,
  presignOrders,
}: HandlePresignedParams): void {
  if (presigned.length === 0) {
    return
  }

  const presignedMap = presigned.reduce<{ [key: string]: EnrichedOrder }>((acc, order) => {
    acc[order.uid] = order
    return acc
  }, {})

  const presignedIds = presigned.map((order) => order.uid)

  const newlyPreSignedOrders = orders
    .filter((order) => order.status === OrderStatus.PRESIGNATURE_PENDING && presignedIds.includes(order.id))
    .map((order) => presignedMap[order.id])

  if (newlyPreSignedOrders.length === 0) {
    return
  }

  presignOrders({
    ids: newlyPreSignedOrders.map((order) => order.uid),
    chainId,
    isSafeWallet,
  })

  const bridgeOrders = bridgeOrdersMap[chainId]?.[account.toLowerCase()]

  newlyPreSignedOrders.forEach((order) => {
    const bridgeOrder = bridgeOrders?.find((i) => i.orderUid === order.uid)

    emitPresignedOrderEvent({ chainId, order, bridgeOrder })
  })
}

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
async function _updateOrders({
  account,
  chainId,
  orders,
  bridgeOrdersMap,
  isSafeWallet,
  // Actions
  addOrUpdateOrders,
  fulfillOrdersBatch,
  expireOrdersBatch,
  cancelOrdersBatch,
  invalidateOrdersBatch,
  presignOrders,
  addOrderToSurplusQueue,
  triggerTotalSurplusUpdate,
  updatePresignGnosisSafeTx,
  getSafeTxInfo,
  safeInfo,
  allTransactions,
  markPollComplete,
}: UpdateOrdersParams): Promise<void> {
  // Only check pending orders of current connected account
  const lowerCaseAccount = account.toLowerCase()
  const pending = orders.filter(({ owner }) => owner.toLowerCase() === lowerCaseAccount)

  // Exit early when there are no pending orders
  if (!pending.length) {
    markPollComplete?.(chainId)
    return
  } else {
    _triggerNps(pending, chainId, account)
  }

  // Iterate over pending orders fetching API data
  const unfilteredOrdersData = await Promise.all(
    pending.map(async (orderFromStore) => fetchAndClassifyOrder(orderFromStore, chainId)),
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
    { fulfilled: [], expired: [], cancelled: [], unknown: [], presigned: [], pending: [], presignaturePending: [] },
  )

  handlePresignedOrders({ presigned, orders, bridgeOrdersMap, chainId, account, isSafeWallet, presignOrders })

  if (expired.length > 0) {
    expireOrdersBatch({
      ids: expired.map(({ uid }) => uid),
      chainId,
      isSafeWallet,
    })

    expired.forEach((order) => {
      emitExpiredOrderEvent({ order, chainId })
    })
  }

  if (cancelled.length > 0) {
    cancelOrdersBatch({
      ids: cancelled.map(({ uid }) => uid),
      chainId,
      isSafeWallet,
    })

    cancelled.forEach((order) => {
      emitCancelledOrderEvent({
        chainId,
        order,
      })
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
    fulfilled.forEach((order) => {
      const { uid, fullAppData, class: orderClass } = order
      if (getUiOrderType({ fullAppData, class: orderClass }) === UiOrderType.SWAP) {
        if (!getIsBridgeOrder(order)) {
          addOrderToSurplusQueue(uid)
        }
      }
    })
    // trigger total surplus update
    triggerTotalSurplusUpdate?.()
  }

  const replacedOrCancelledEthFlowOrders = getReplacedOrCancelledEthFlowOrders(orders, allTransactions)

  if (replacedOrCancelledEthFlowOrders.length > 0) {
    invalidateOrdersBatch({
      ids: replacedOrCancelledEthFlowOrders.map(({ id }) => id),
      chainId,
      isSafeWallet,
    })
  }

  // Update the presign Gnosis Safe Tx info (if applies)
  await _updatePresignGnosisSafeTx(
    chainId,
    orders,
    getSafeTxInfo,
    updatePresignGnosisSafeTx,
    cancelOrdersBatch,
    safeInfo,
  )
  // Update the creating EthFlow orders (if any)
  await _updateCreatingOrders(chainId, orders, isSafeWallet, addOrUpdateOrders)

  markPollComplete?.(chainId)
}

function getReplacedOrCancelledEthFlowOrders(
  orders: Order[],
  allTransactions: UpdateOrdersParams['allTransactions'],
): Order[] {
  return orders.filter((order) => {
    if (!order.orderCreationHash || order.status !== OrderStatus.CREATING) return false

    const { orderCreationHash } = order

    const creationTx = orderCreationHash ? allTransactions[orderCreationHash] : undefined
    const creationLinkedTx = creationTx?.linkedTransactionHash
      ? allTransactions[creationTx.linkedTransactionHash]
      : undefined

    if (!creationLinkedTx?.replacementType) return false

    const { replacementType } = creationLinkedTx

    return replacementType !== 'speedup'
  })
}

// Check if there is any order pending for a long time
// If so, trigger appzi
function _triggerNps(pending: Order[], chainId: ChainId, account: string): void {
  for (const order of pending) {
    const { openSince, id: orderId } = order
    const orderType = getUiOrderType(order)
    const isBridging = getIsBridgeOrder(order) || undefined
    // Check if there's any SWAP pending for more than `PENDING_TOO_LONG_TIME`
    if (orderType === UiOrderType.SWAP && isOrderInPendingTooLong(openSince, isBridging)) {
      const explorerUrl = getExplorerOrderLink(chainId, orderId)
      // Trigger NPS display, controlled by Appzi
      triggerAppziSurvey({
        waitedTooLong: true,
        secondsSinceOpen: timeSinceInSeconds(openSince),
        explorerUrl,
        chainId,
        orderType,
        account,
        isBridging,
      })
      // Break the loop, don't need to show more than once
      break
    }
  }
}

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
export function PendingOrdersUpdater(): null {
  const safeInfo = useGnosisSafeInfo()
  const isSafeWallet = !!safeInfo
  const { chainId, account } = useWalletInfo()
  const blockNumber = useBlockNumber()
  const removeOrdersToCancel = useSetAtom(removeOrdersToCancelAtom)
  const dispatch = useDispatch<AppDispatch>()

  const pending = useCombinedPendingOrders({ chainId, account })
  // TODO: Implement using SWR or retry/cancellable promises
  const isUpdatingMarket = useRef(false)
  const isUpdatingLimit = useRef(false)
  const isUpdatingTwap = useRef(false)
  const isUpdatingHooks = useRef(false)
  const isUpdatingYield = useRef(false)

  const updatersRefMap = useMemo(
    () => ({
      [UiOrderType.SWAP]: isUpdatingMarket,
      [UiOrderType.LIMIT]: isUpdatingLimit,
      [UiOrderType.TWAP]: isUpdatingTwap,
      [UiOrderType.HOOKS]: isUpdatingHooks,
      [UiOrderType.YIELD]: isUpdatingYield,
    }),
    [],
  )

  // Ref, so we don't rerun useEffect
  const pendingRef = useRef(pending)
  pendingRef.current = pending
  // Keep block number in a ref so markPollComplete doesn't depend on it and re-trigger polling effect each block
  const blockNumberRef = useRef(blockNumber)
  blockNumberRef.current = blockNumber

  const _fulfillOrdersBatch = useFulfillOrdersBatch()
  const expireOrdersBatch = useExpireOrdersBatch()
  const cancelOrdersBatch = useCancelOrdersBatch()
  const addOrUpdateOrders = useAddOrUpdateOrders()
  const invalidateOrdersBatch = useInvalidateOrdersBatch()
  const presignOrders = usePresignOrders()
  const addOrderToSurplusQueue = useAddOrderToSurplusQueue()
  const triggerTotalSurplusUpdate = useTriggerTotalSurplusUpdateCallback()
  const updatePresignGnosisSafeTx = useUpdatePresignGnosisSafeTx()
  const allTransactions = useAllTransactions()
  const getSafeTxInfo = useGetSafeTxInfo()
  const bridgeOrdersMap = useBridgeOrdersSerializedMap()
  const bridgeOrdersMapRef = useRef(bridgeOrdersMap)
  useEffect(() => {
    bridgeOrdersMapRef.current = bridgeOrdersMap
  }, [bridgeOrdersMap])
  const markPollComplete = useCallback(
    (targetChainId: ChainId) => {
      if (!chainId || targetChainId !== chainId) {
        return
      }

      const latestBlock = blockNumberRef.current

      if (typeof latestBlock === 'number') {
        dispatch(updateLastCheckedBlock({ chainId: targetChainId, lastCheckedBlock: latestBlock }))
      }
    },
    [chainId, dispatch],
  )

  const fulfillOrdersBatch = useCallback(
    (fulfillOrdersBatchParams: FulfillOrdersBatchParams) => {
      if (!account) return

      _fulfillOrdersBatch(fulfillOrdersBatchParams)

      fulfillOrdersBatchParams.orders.forEach((order) => {
        const bridgeOrders = bridgeOrdersMap[chainId]?.[account.toLowerCase()]
        const bridgeOrder = bridgeOrders?.find((i) => i.orderUid === order.uid)

        emitFulfilledOrderEvent(chainId, order, bridgeOrder)
      })

      // Remove orders from the cancelling queue (marked by checkbox in the orders table)
      removeOrdersToCancel(fulfillOrdersBatchParams.orders.map(({ uid }) => uid))
    },
    [chainId, account, _fulfillOrdersBatch, removeOrdersToCancel, bridgeOrdersMap],
  )

  const updateOrders = useCallback(
    async (chainId: ChainId, account: string, isSafeWallet: boolean, uiOrderType: UiOrderType) => {
      if (!account) {
        return []
      }

      const isUpdating = updatersRefMap[uiOrderType]
      const shouldMarkCompletion = uiOrderType === UiOrderType.SWAP

      if (!isUpdating.current) {
        // eslint-disable-next-line react-hooks/immutability
        isUpdating.current = true
        return _updateOrders({
          account,
          chainId,
          isSafeWallet,
          bridgeOrdersMap: bridgeOrdersMapRef.current,
          orders: pendingRef.current.filter((order) => getUiOrderType(order) === uiOrderType),
          addOrUpdateOrders,
          fulfillOrdersBatch,
          invalidateOrdersBatch,
          expireOrdersBatch,
          cancelOrdersBatch,
          presignOrders,
          addOrderToSurplusQueue,
          triggerTotalSurplusUpdate,
          updatePresignGnosisSafeTx,
          getSafeTxInfo,
          safeInfo,
          allTransactions,
          markPollComplete: shouldMarkCompletion ? markPollComplete : undefined,
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
      invalidateOrdersBatch,
      presignOrders,
      addOrderToSurplusQueue,
      triggerTotalSurplusUpdate,
      updatePresignGnosisSafeTx,
      getSafeTxInfo,
      safeInfo,
      allTransactions,
      markPollComplete,
    ],
  )

  useEffect(() => {
    if (!chainId || !account) {
      return
    }

    const marketInterval = setInterval(
      () => updateOrders(chainId, account, isSafeWallet, UiOrderType.SWAP),
      MARKET_OPERATOR_API_POLL_INTERVAL,
    )
    const limitInterval = setInterval(
      () => updateOrders(chainId, account, isSafeWallet, UiOrderType.LIMIT),
      LIMIT_OPERATOR_API_POLL_INTERVAL,
    )
    const twapInterval = setInterval(
      () => updateOrders(chainId, account, isSafeWallet, UiOrderType.TWAP),
      LIMIT_OPERATOR_API_POLL_INTERVAL,
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
