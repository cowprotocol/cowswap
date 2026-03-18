/* eslint-disable @typescript-eslint/no-restricted-imports */ // TODO: Don't use 'modules' import
import { useCallback, useEffect, useRef } from 'react'

import { CANCELLED_ORDERS_PENDING_TIME } from '@cowprotocol/common-const'
import { areAddressesEqual, EnrichedOrder, SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { useIsSafeWallet, useWalletInfo } from '@cowprotocol/wallet'

import { useGetSerializedBridgeOrder } from 'entities/bridgeOrders'
import { useAutoAddOrderToSurplusQueue } from 'entities/surplusModal'

import { useAllTransactions } from 'legacy/state/enhancedTransactions/hooks'
import { EnhancedTransactionDetails } from 'legacy/state/enhancedTransactions/reducer'
import { Order } from 'legacy/state/orders/actions'
import { MARKET_OPERATOR_API_POLL_INTERVAL } from 'legacy/state/orders/consts'
import { useCancelledOrders, useFulfillOrdersBatch } from 'legacy/state/orders/hooks'
import { OrderTransitionStatus } from 'legacy/state/orders/utils'

import { emitFulfilledOrderEvent } from 'modules/orders'

import { getIsBridgeOrder } from 'common/utils/getIsBridgeOrder'

import { fetchAndClassifyOrder } from './utils'

const DEFAULT_ORDERS_STATE: Record<OrderTransitionStatus, EnrichedOrder[]> = {
  fulfilled: [],
  presigned: [],
  expired: [],
  cancelled: [],
  unknown: [],
  presignaturePending: [],
  pending: [],
}

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
  const isSafeWallet = useIsSafeWallet()
  const { chainId, account } = useWalletInfo()

  const cancelled = useCancelledOrders({ chainId })
  const addOrderToSurplusQueue = useAutoAddOrderToSurplusQueue()
  const getSerializedBridgeOrder = useGetSerializedBridgeOrder()
  const allTransactions = useAllTransactions()

  // Ref, so we don't rerun useEffect
  const cancelledRef = useRef(cancelled)
  const allTransactionsRef = useRef(allTransactions)
  const handledRecoveredOrderIdsRef = useRef<Set<string>>(new Set())
  const isUpdating = useRef(false) // TODO: Implement using SWR or retry/cancellable promises
  cancelledRef.current = cancelled
  allTransactionsRef.current = allTransactions

  const fulfillOrdersBatch = useFulfillOrdersBatch()

  const updateOrders = useCallback(
    async (chainId: ChainId, account: string, isSafeWallet: boolean) => {
      const now = Date.now()

      if (isUpdating.current) {
        return
      }

      try {
        isUpdating.current = true

        // Filter orders:
        // - Owned by the current connected account
        // - Cancelled recently enough that the backend may still settle to fulfilled
        const pending = cancelledRef.current.filter((order) => {
          if (handledRecoveredOrderIdsRef.current.has(order.id)) {
            return false
          }

          const lastRelevantUpdateTime = getLastRelevantUpdateTime(order, allTransactionsRef.current)

          return areAddressesEqual(order.owner, account) && now - lastRelevantUpdateTime < CANCELLED_ORDERS_PENDING_TIME
        })

        if (pending.length === 0) {
          return
        } /* else {
          console.debug(`[CancelledOrdersUpdater] Checking ${pending.length} recently canceled orders...`)
        }*/

        // Iterate over pending orders fetching operator order data, async
        const unfilteredOrdersData = await Promise.all(
          pending.map(async (orderFromStore) => fetchAndClassifyOrder(orderFromStore, chainId)),
        )

        // Group resolved promises by status
        // Only pick fulfilled
        const { fulfilled } = unfilteredOrdersData.reduce<Record<OrderTransitionStatus, EnrichedOrder[]>>(
          (acc, orderData) => {
            if (orderData && orderData.order) {
              acc[orderData.status].push(orderData.order)
            }
            return acc
          },
          { ...DEFAULT_ORDERS_STATE },
        )

        // Bach state update fulfilled orders, if any
        if (fulfilled.length) {
          fulfilled.forEach((order) => {
            handledRecoveredOrderIdsRef.current.add(order.uid)
          })

          fulfillOrdersBatch({
            orders: fulfilled,
            chainId,
            isSafeWallet,
          })

          fulfilled.forEach((order) => {
            if (!getIsBridgeOrder(order)) {
              addOrderToSurplusQueue(order.uid)
            }

            const bridgeOrder = getSerializedBridgeOrder(chainId, order.uid)
            emitFulfilledOrderEvent(chainId, order, bridgeOrder)
          })
        }
      } finally {
        isUpdating.current = false
      }
    },
    [addOrderToSurplusQueue, fulfillOrdersBatch, getSerializedBridgeOrder],
  )

  useEffect(() => {
    if (!chainId || !account) {
      return
    }

    handledRecoveredOrderIdsRef.current.clear()

    const interval = setInterval(() => updateOrders(chainId, account, isSafeWallet), MARKET_OPERATOR_API_POLL_INTERVAL)

    return () => clearInterval(interval)
  }, [account, chainId, isSafeWallet, updateOrders])

  return null
}

function getConnectedTransactionHashes(
  initialHash: string,
  allTransactions: ReturnType<typeof useAllTransactions>,
): string[] {
  const reverseLinkedTransactionHashes = Object.entries(allTransactions).reduce<Record<string, string[]>>(
    (acc, [hash, transaction]) => {
      const linkedTransactionHash = transaction.linkedTransactionHash

      if (!linkedTransactionHash) {
        return acc
      }

      acc[linkedTransactionHash] = [...(acc[linkedTransactionHash] || []), hash]

      return acc
    },
    {},
  )
  const visited = new Set<string>()
  const queue = [initialHash]

  while (queue.length > 0) {
    const hash = queue.shift()

    if (!hash || visited.has(hash)) {
      continue
    }

    visited.add(hash)

    const transaction = allTransactions[hash]

    const replacementHashes = reverseLinkedTransactionHashes[hash]

    if (replacementHashes) {
      queue.push(...replacementHashes)
    }

    if (transaction?.linkedTransactionHash) {
      queue.push(transaction.linkedTransactionHash)
    }
  }

  return [...visited]
}

function getLastRelevantUpdateTime(
  order: Pick<Order, 'creationTime' | 'cancellationHash'>,
  allTransactions: ReturnType<typeof useAllTransactions>,
): number {
  if (!order.cancellationHash) {
    return new Date(order.creationTime).getTime()
  }

  const txTimestamps = getConnectedTransactionHashes(order.cancellationHash, allTransactions).map((hash) => {
    const transaction = allTransactions[hash]

    return getTransactionTimestamp(transaction)
  })

  return Math.max(new Date(order.creationTime).getTime(), ...txTimestamps)
}

function getTransactionTimestamp(transaction: EnhancedTransactionDetails | undefined): number {
  return transaction?.confirmedTime ?? transaction?.addedTime ?? 0
}
