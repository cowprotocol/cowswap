/* eslint-disable @typescript-eslint/no-restricted-imports */ // TODO: Don't use 'modules' import
import { useCallback, useEffect, useRef } from 'react'

import { CANCELLED_ORDERS_PENDING_TIME } from '@cowprotocol/common-const'
import { areAddressesEqual, SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { useIsSafeWallet, useWalletInfo } from '@cowprotocol/wallet'

import { useGetSerializedBridgeOrder } from 'entities/bridgeOrders'
import { useAddOrderToSurplusQueue } from 'entities/surplusModal'

import { Order } from 'legacy/state/orders/actions'
import { MARKET_OPERATOR_API_POLL_INTERVAL } from 'legacy/state/orders/consts'
import { useCancelledOrders, useFulfillOrdersBatch } from 'legacy/state/orders/hooks'
import { OrderTransitionStatus } from 'legacy/state/orders/utils'

import { emitFulfilledOrderEvent } from 'modules/orders'

import { getIsBridgeOrder } from 'common/utils/getIsBridgeOrder'

import { fetchAndClassifyOrder, getOrdersFromTransitionData, OrderTransitionData } from './utils'

const DEFAULT_ORDERS_STATE: Record<OrderTransitionStatus, OrderTransitionData[]> = {
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
  const addOrderToSurplusQueue = useAddOrderToSurplusQueue()
  const getSerializedBridgeOrder = useGetSerializedBridgeOrder()

  // Ref, so we don't rerun useEffect
  const cancelledRef = useRef(cancelled)
  const isUpdating = useRef(false) // TODO: Implement using SWR or retry/cancellable promises
  cancelledRef.current = cancelled

  const fulfillOrdersBatch = useFulfillOrdersBatch()

  const updateOrders = useCallback(
    async (chainId: ChainId, account: string, isSafeWallet: boolean) => {
      const now = Date.now()

      if (isUpdating.current) {
        return
      }

      try {
        isUpdating.current = true

        const pending = cancelledRef.current.filter((order) => shouldRecheckCancelledOrder(order, account, now))

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
        const { fulfilled } = unfilteredOrdersData.reduce<Record<OrderTransitionStatus, OrderTransitionData[]>>(
          (acc, orderData) => {
            if (orderData && orderData.order) {
              acc[orderData.status].push(orderData)
            }
            return acc
          },
          { ...DEFAULT_ORDERS_STATE },
        )

        // Bach state update fulfilled orders, if any
        if (fulfilled.length) {
          const fulfilledOrders = getOrdersFromTransitionData(fulfilled)

          fulfillOrdersBatch({
            orders: fulfilledOrders,
            chainId,
            isSafeWallet,
          })

          fulfilled.forEach(({ order, orderType }) => {
            if (!getIsBridgeOrder(order)) {
              addOrderToSurplusQueue(order.uid)
            }

            const bridgeOrder = getSerializedBridgeOrder(chainId, order.uid)
            emitFulfilledOrderEvent(chainId, order, bridgeOrder, orderType)
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

    const interval = setInterval(() => updateOrders(chainId, account, isSafeWallet), MARKET_OPERATOR_API_POLL_INTERVAL)

    return () => clearInterval(interval)
  }, [account, chainId, isSafeWallet, updateOrders])

  return null
}

/**
 * Whether a recently-cancelled order should be re-verified against the order-book, to catch a
 * cancellation that raced a solver fill.
 *
 * A successful EVM on-chain cancellation is settlement-contract-guaranteed final, ~so it can't race a
 * fill and is skipped here~. It's still checked because the cancellation can happen in a later block than the fill.
 *
 * The recheck window is measured from `cancellationHashTime` for a hard-cancelled order, not
 * `creationTime`: an order can be created long before it's cancelled, and it's the cancellation - not
 * the creation - that can race a fill.
 */
export function shouldRecheckCancelledOrder(
  order: Pick<Order, 'owner' | 'creationTime' | 'status' | 'cancellationHash' | 'cancellationHashTime'>,
  account: string,
  now: number,
): boolean {
  const { owner, creationTime, cancellationHash, cancellationHashTime } = order
  const anchorTime = new Date(cancellationHash && cancellationHashTime ? cancellationHashTime : creationTime).getTime()

  return areAddressesEqual(owner, account) && now - anchorTime < CANCELLED_ORDERS_PENDING_TIME
}
